"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

export function Step7Contact() {
  const t = useTranslations("sellProperty.step7");
  const {
    register,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("name")}</label>
          <Input {...register("ownerName")} />
          {errors.ownerName && <p className="mt-1 text-xs text-danger">{t("nameError")}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("phone")}</label>
          <Input type="tel" {...register("ownerPhone")} />
          {errors.ownerPhone && <p className="mt-1 text-xs text-danger">{t("phoneError")}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("email")}</label>
          <Input type="email" {...register("ownerEmail")} />
          {errors.ownerEmail && <p className="mt-1 text-xs text-danger">{t("emailError")}</p>}
        </div>
      </div>
    </div>
  );
}
