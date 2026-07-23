"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";
import { cn } from "@/lib/utils";

export function Step1Purpose() {
  const t = useTranslations("sellProperty.step1");
  const { watch, setValue } = useFormContext<PropertySubmissionInput>();
  const purpose = watch("purpose");

  return (
    <div>
      <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["sale", "rent"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setValue("purpose", option, { shouldValidate: true })}
            className={cn(
              "rounded-2xl border p-6 text-left transition-colors",
              purpose === option
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent",
            )}
          >
            <span className="block font-serif text-lg text-foreground">
              {option === "sale" ? t("sale") : t("rent")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
