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

export async function signUp(values: SignUpValues, locale: AppLocale, turnstileToken?: string) {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const allowed = await checkRateLimit("signup", 5, 3600);
  if (!allowed) return { success: false as const };

  const humanVerified = await verifyTurnstileToken(turnstileToken);
  if (!humanVerified) return { success: false as const };

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
  if (error) return { success: false as const, message: error.message };

  return { success: true as const, needsEmailConfirmation: !data.session };
}

export async function signIn(values: SignInValues) {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { success: false as const };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { success: false as const, message: error.message };

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
  if (error) return { success: false as const, message: error.message };

  return { success: true as const };
}
