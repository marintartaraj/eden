"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { publicEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpValues,
  type SignInValues,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/validations/auth";

async function getOrigin() {
  const headersList = await headers();
  return headersList.get("origin") ?? publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export type AuthErrorCode =
  | "email_taken"
  | "weak_password"
  | "same_password"
  | "session_expired"
  | "unknown";

// Supabase's AuthError carries a stable `code` (e.g. "user_already_exists")
// on API errors, but client-side errors like AuthSessionMissingError only
// set `name`. Classifying into a small app-level enum here — rather than
// forwarding `error.message` to the client — avoids showing a raw,
// unlocalized Supabase string to the user.
function classifyAuthError(error: { code?: string; name?: string }): AuthErrorCode {
  switch (error.code ?? error.name) {
    case "user_already_exists":
      return "email_taken";
    case "weak_password":
      return "weak_password";
    case "same_password":
      return "same_password";
    case "session_not_found":
    case "AuthSessionMissingError":
      return "session_expired";
    default:
      return "unknown";
  }
}

export async function signUp(values: SignUpValues, locale: AppLocale, turnstileToken?: string) {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  // Turnstile is checked before the rate limit so a slow-loading widget or
  // an ad/privacy blocker (which prevents a token from ever arriving) can't
  // burn through the rate-limit allowance before the user gets a real shot
  // at signing up — see lib/turnstile.ts.
  const verification = await verifyTurnstileToken(turnstileToken);
  if (!verification.verified) return { success: false as const };

  const allowed = await checkRateLimit("signup", 5, 3600);
  if (!allowed) return { success: false as const };

  const origin = await getOrigin();
  const next = getPathname({ href: "/account", locale });
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${next}`,
    },
  });
  if (error) return { success: false as const, code: classifyAuthError(error) };

  return { success: true as const, needsEmailConfirmation: !data.session };
}

export async function signIn(values: SignInValues) {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { success: false as const, code: classifyAuthError(error) };

  return { success: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(values: ForgotPasswordValues, locale: AppLocale) {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const origin = await getOrigin();
  const next = getPathname({ href: "/reset-password", locale });
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${next}`,
  });

  // Always report success, regardless of whether the email is registered,
  // so this endpoint can't be used to enumerate accounts.
  return { success: true as const };
}

export async function updatePassword(values: ResetPasswordValues) {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { success: false as const, code: classifyAuthError(error) };

  return { success: true as const };
}
