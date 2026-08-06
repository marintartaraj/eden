import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { WithdrawSubmissionButton } from "@/components/account/WithdrawSubmissionButton";
import { getMySubmissionById } from "@/lib/data/submissions";
import { localize } from "@/lib/localize";
import { formatPrice, formatDateWithDay } from "@/lib/format";
import { submissionStatusClasses } from "@/lib/status-styles";
import type { AppLocale } from "@/i18n/routing";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const submission = await getMySubmissionById(id);
  if (!submission) notFound();

  const t = await getTranslations("submissions");
  const title = submission.property
    ? localize(submission.property.title_sq, submission.property.title_en, appLocale)
    : t("untitled");

  const canWithdraw = submission.status === "submitted" || submission.status === "pending_review";

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("detailTitle")}</h1>
      <AccountNav />

      <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg text-foreground">{title}</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${submissionStatusClasses(submission.status)}`}
          >
            {t(`status.${submission.status}`)}
          </span>
        </div>

        {submission.property && (
          <p className="mt-2 text-sm text-muted">
            {formatPrice(submission.property.price, submission.property.currency, appLocale)}
          </p>
        )}

        <p className="mt-4 text-sm text-muted">
          {t("submittedOn", { date: formatDateWithDay(submission.submitted_at, appLocale) })}
        </p>

        {submission.admin_feedback && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase text-muted">{t("adminFeedbackLabel")}</p>
            <p className="mt-1 text-sm text-foreground">{submission.admin_feedback}</p>
          </div>
        )}

        {canWithdraw && (
          <div className="mt-6">
            <WithdrawSubmissionButton submissionId={submission.id} />
          </div>
        )}
      </div>
    </Container>
  );
}
