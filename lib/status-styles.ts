import type { Database } from "@/types/supabase";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

// Maps a submission's lifecycle stage to the token that signals its outcome
// to the reader at a glance — published/approved is the good outcome
// (success), rejected is the already-established bad outcome (danger),
// everything still in motion is pending (warning), and closed-without-a-
// verdict states (draft/withdrawn/archived) stay neutral rather than being
// forced into one of the three.
export function submissionStatusClasses(status: SubmissionStatus): string {
  switch (status) {
    case "published":
    case "approved":
      return "bg-success/10 text-success";
    case "submitted":
    case "pending_review":
    case "more_info_required":
      return "bg-warning/10 text-warning";
    case "rejected":
      return "bg-danger/10 text-danger";
    default:
      // text-muted is only verified against --background/--card (see the
      // muted contrast check in globals.css history) — pairing it with a
      // solid bg-border fill is a new combination this badge introduces,
      // and it fails contrast. text-foreground keeps the pill visually
      // quiet via the border-colored fill while staying readable.
      return "bg-border text-foreground";
  }
}
