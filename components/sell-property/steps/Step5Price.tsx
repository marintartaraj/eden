"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

export function Step5Price() {
  const t = useTranslations("sellProperty.step5");
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();
  const purpose = watch("purpose");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="max-w-xs">
        <label className="mb-2 block text-sm font-medium text-foreground">
          {purpose === "rent" ? t("priceRent") : t("priceSale")}
        </label>
        <Input type="number" min={0} step="1" {...register("price")} />
        {errors.price && <p className="mt-1 text-xs text-danger">{t("priceError")}</p>}
      </div>
    </div>
  );
}
