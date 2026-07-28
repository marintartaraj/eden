"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { getUserEmailById } from "@/lib/data/admin-notifications";
import type { Database } from "@/types/supabase";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "draft",
  submitted: "submitted",
  pending_review: "pending review",
  more_info_required: "needs more information",
  approved: "approved",
  rejected: "rejected",
  published: "published",
  withdrawn: "withdrawn",
  archived: "archived",
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
    await sendEmail({
      to: submitterEmail,
      subject: `Your property submission is now ${STATUS_LABELS[options.status]}`,
      html: `
        <p>Your submission${property?.title_sq ? ` for <strong>${property.title_sq}</strong>` : ""} is now <strong>${STATUS_LABELS[options.status]}</strong>.</p>
        ${options.feedback ? `<p>Note from our team: ${options.feedback}</p>` : ""}
      `,
    });
  }

  return { success: true as const };
}
