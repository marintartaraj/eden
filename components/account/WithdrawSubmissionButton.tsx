"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { withdrawSubmission } from "@/lib/actions/submissions";

export function WithdrawSubmissionButton({ submissionId }: { submissionId: string }) {
  const t = useTranslations("submissions");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleWithdraw() {
    startTransition(async () => {
      await withdrawSubmission(submissionId);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">{t("withdrawConfirm")}</span>
        <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          {t("cancel")}
        </Button>
        <Button type="button" size="sm" onClick={handleWithdraw} disabled={isPending}>
          {isPending ? t("withdrawing") : t("withdrawConfirmButton")}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" variant="secondary" onClick={() => setConfirming(true)}>
      {t("withdraw")}
    </Button>
  );
}
