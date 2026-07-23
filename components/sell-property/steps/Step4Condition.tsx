"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { CONSTRUCTION_CONDITIONS, CERTIFICATE_STATUSES } from "@/lib/property-enums";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

export function Step4Condition() {
  const t = useTranslations("sellProperty.step4");
  const conditionT = useTranslations("constructionCondition");
  const certificateT = useTranslations("certificateStatus");
  const { register, watch, setValue } = useFormContext<PropertySubmissionInput>();

  const condition = watch("constructionCondition");
  const certificate = watch("certificateStatus");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{t("condition")}</label>
        <div className="flex flex-wrap gap-2">
          {CONSTRUCTION_CONDITIONS.map((c) => (
            <Chip
              key={c}
              selected={condition === c}
              onClick={() => setValue("constructionCondition", condition === c ? undefined : c)}
            >
              {conditionT(c)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="max-w-xs">
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t("constructionYear")}
        </label>
        <Input type="number" step="1" {...register("constructionYear")} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{t("certificate")}</label>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATE_STATUSES.map((c) => (
            <Chip
              key={c}
              selected={certificate === c}
              onClick={() => setValue("certificateStatus", certificate === c ? undefined : c)}
            >
              {certificateT(c)}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
