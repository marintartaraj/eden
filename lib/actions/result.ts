/**
 * Shared discriminated result shape for public-facing submission actions
 * (inquiry, contact, property submission). Distinguishing *why* an action
 * failed lets the client show an actionable message instead of a single
 * generic "something went wrong" for every failure mode — including ones
 * (Turnstile unavailable, rate limited) that need very different guidance.
 */
export type SubmitFailureReason =
  | "validation_error"
  | "verification_failed"
  | "verification_unavailable"
  | "rate_limited"
  | "database_error"
  | "server_error";

export type SubmitResult =
  | { success: true; reference?: string }
  | { success: false; reason: SubmitFailureReason };
