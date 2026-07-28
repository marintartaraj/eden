import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env.server";

const resend = serverEnv.RESEND_API_KEY ? new Resend(serverEnv.RESEND_API_KEY) : null;

/**
 * Best-effort transactional email. No-ops when RESEND_API_KEY isn't set
 * (see .env.local.example) — same opt-in pattern as Turnstile/Sentry, so
 * the app works today and gains email once a Resend account is added.
 * Never throws: a notification failing shouldn't fail the action that
 * triggered it (an inquiry/submission should still save if the email
 * doesn't send).
 */
export async function sendEmail(params: { to: string | string[]; subject: string; html: string }) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: serverEnv.RESEND_FROM_EMAIL ?? "Eden <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error) {
    console.error("sendEmail failed:", error);
  }
}
