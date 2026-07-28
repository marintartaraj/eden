"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { reviewSubmission } from "@/lib/actions/admin-submissions";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";
import type { AdminSubmission } from "@/lib/data/admin-submissions";
import type { Database } from "@/types/supabase";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];
type AgentRow = { id: string; full_name: string };

const REVIEWABLE_STATUSES: Extract<
  SubmissionStatus,
  "submitted" | "pending_review" | "more_info_required"
>[] = ["submitted", "pending_review", "more_info_required"];

export function SubmissionReviewPanel({
  submission,
  agents,
}: {
  submission: AdminSubmission;
  agents: AgentRow[];
}) {
  const t = useTranslations("adminSubmissions");
  const statusT = useTranslations("submissions.status");
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [feedback, setFeedback] = useState(submission.admin_feedback ?? "");
  const [agentId, setAgentId] = useState(submission.assigned_agent_id ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<SubmissionStatus | null>(null);
  const submittingRef = useRef(false);

  const canReview = REVIEWABLE_STATUSES.includes(
    submission.status as (typeof REVIEWABLE_STATUSES)[number],
  );

  async function handleAction(status: SubmissionStatus) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPendingAction(status);
    setErrorMessage(null);

    try {
      const result = await reviewSubmission(submission.id, {
        status,
        feedback: feedback.trim() || undefined,
        agentId: agentId || undefined,
      });
      if (!result.success) {
        setErrorMessage(t("error"));
        return;
      }
      router.refresh();
    } finally {
      submittingRef.current = false;
      setPendingAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted">
          {t("statusLabel")}: <span className="font-medium text-foreground">{statusT(submission.status)}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {submission.submitted_by_user_id
            ? t("submittedByAccount")
            : t("submittedByGuest", { name: submission.guest_name ?? "" })}
        </p>

        {submission.property ? (
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-background p-4">
            {submission.property.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={submission.property.images[0].url}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-medium text-foreground">
                {localize(submission.property.title_sq, submission.property.title_en, locale)}
              </p>
              <p className="text-sm text-muted">
                {formatPrice(submission.property.price, submission.property.currency, locale)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">{t("noProperty")}</p>
        )}
      </div>

      {canReview && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">{t("reviewTitle")}</h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("agentAssign")}</label>
            <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">{t("unassigned")}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("feedbackLabel")}</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder={t("feedbackPlaceholder")}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={pendingAction !== null}
              onClick={() => handleAction("more_info_required")}
            >
              {pendingAction === "more_info_required" ? t("saving") : t("actionRequestInfo")}
            </Button>
            <Button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => handleAction("published")}
            >
              {pendingAction === "published" ? t("saving") : t("actionApprove")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pendingAction !== null}
              onClick={() => handleAction("rejected")}
            >
              {pendingAction === "rejected" ? t("saving") : t("actionReject")}
            </Button>
          </div>
        </div>
      )}

      {!canReview && submission.admin_feedback && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-lg text-foreground">{t("feedbackLabel")}</h2>
          <p className="mt-2 text-sm text-foreground">{submission.admin_feedback}</p>
        </div>
      )}
    </div>
  );
}
