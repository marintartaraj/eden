"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { getUserEmailById } from "@/lib/data/admin-notifications";
import type { Database } from "@/types/supabase";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

// This email goes to the submitter — a property owner who chose the site's
// Albanian locale for their own submission (evidenced by `titleSq`/guest
// name being Albanian-first data) — not to internal staff, so unlike the
// admin-facing notifications elsewhere in this file the body needs both
// languages rather than assuming English is readable.
const STATUS_LABELS: Record<SubmissionStatus, { en: string; sq: string }> = {
  draft: { en: "draft", sq: "draft" },
  submitted: { en: "submitted", sq: "dërguar" },
  pending_review: { en: "pending review", sq: "në pritje të shqyrtimit" },
  more_info_required: { en: "needs more information", sq: "kërkon informacion shtesë" },
  approved: { en: "approved", sq: "miratuar" },
  rejected: { en: "rejected", sq: "refuzuar" },
  published: { en: "published", sq: "publikuar" },
  withdrawn: { en: "withdrawn", sq: "tërhequr" },
  archived: { en: "archived", sq: "arkivuar" },
};

export async function reviewSubmission(
  submissionId: string,
  options: { status: SubmissionStatus; feedback?: string; agentId?: string },
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_submission", {
    p_submission_id: submissionId,
    p_new_status: options.status,
    p_feedback: options.feedback || null,
    p_agent_id: options.agentId || null,
  });
  if (error) return { success: false as const };

  // Best-effort notification — separate simple queries rather than a
  // PostgREST embed, matching this codebase's data-layer convention
  // (see attachRelations() in lib/data/properties.ts) and avoiding
  // ambiguity over whether properties(submission_id -> id) embeds as an
  // object or array.
  const [{ data: submission }, { data: property }] = await Promise.all([
    supabase
      .from("property_submissions")
      .select("guest_email, submitted_by_user_id")
      .eq("id", submissionId)
      .maybeSingle(),
    supabase.from("properties").select("title_sq").eq("submission_id", submissionId).maybeSingle(),
  ]);

  const submitterEmail =
    submission?.guest_email ??
    (submission?.submitted_by_user_id
      ? await getUserEmailById(submission.submitted_by_user_id)
      : null);

  if (submitterEmail) {
    const status = STATUS_LABELS[options.status];
    await sendEmail({
      to: submitterEmail,
      subject: `Your property submission is now ${status.en} / Dorëzimi juaj i pronës tani është ${status.sq}`,
      html: `
        <p>Your submission${property?.title_sq ? ` for <strong>${property.title_sq}</strong>` : ""} is now <strong>${status.en}</strong>.${options.feedback ? ` Note from our team: ${options.feedback}` : ""}</p>
        <hr />
        <p>Dorëzimi juaj${property?.title_sq ? ` për <strong>${property.title_sq}</strong>` : ""} tani është <strong>${status.sq}</strong>.${options.feedback ? ` Shënim nga ekipi ynë: ${options.feedback}` : ""}</p>
      `,
    });
  }

  return { success: true as const };
}
