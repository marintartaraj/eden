import "server-only";
import { serverEnv } from "@/lib/env.server";

/**
 * Verifies a Cloudflare Turnstile token server-side. Returns true
 * unconditionally when TURNSTILE_SECRET_KEY isn't configured — Turnstile is
 * an opt-in layer (see .env.local.example) so forms keep working before
 * it's set up, rather than hard-failing on a missing third-party account.
 */
export async function verifyTurnstileToken(token: string | undefined | null): Promise<boolean> {
  if (!serverEnv.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: serverEnv.TURNSTILE_SECRET_KEY, response: token }),
    });
    const data = (await response.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
