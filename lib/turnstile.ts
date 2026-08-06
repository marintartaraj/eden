import "server-only";
import { serverEnv } from "@/lib/env.server";

export type TurnstileVerification =
  | { verified: true }
  | { verified: false; reason: "missing_token" | "invalid_token" | "unavailable" };

/**
 * Verifies a Cloudflare Turnstile token server-side. Returns `{verified:
 * true}` unconditionally when TURNSTILE_SECRET_KEY isn't configured —
 * Turnstile is an opt-in layer (see .env.local.example) so forms keep
 * working before it's set up, rather than hard-failing on a missing
 * third-party account.
 *
 * The failure reason matters to callers: "missing_token" (widget hasn't
 * finished loading / user hasn't completed the challenge yet) and
 * "unavailable" (the verify call itself couldn't be completed, e.g. the
 * widget script was blocked by an ad/privacy blocker or Cloudflare's API is
 * down) must never be charged against the caller's rate limit the same way
 * an actively-rejected "invalid_token" is — otherwise a slow connection or
 * an ad blocker can burn through a legitimate user's whole rate-limit
 * allowance before they ever get a chance to submit.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
): Promise<TurnstileVerification> {
  if (!serverEnv.TURNSTILE_SECRET_KEY) return { verified: true };
  if (!token) return { verified: false, reason: "missing_token" };

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: serverEnv.TURNSTILE_SECRET_KEY, response: token }),
    });
    const data = (await response.json()) as { success: boolean };
    return data.success === true
      ? { verified: true }
      : { verified: false, reason: "invalid_token" };
  } catch {
    return { verified: false, reason: "unavailable" };
  }
}
