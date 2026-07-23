"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Checkbox } from "@/components/ui/Checkbox";
import { FURNISHING_STATUSES } from "@/lib/property-enums";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

export function Step3Characteristics() {
  const t = useTranslations("sellProperty.step3");
  const furnishingT = useTranslations("furnishingStatus");
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();

  const furnishing = watch("furnishing");
  const hasElevator = watch("hasElevator");
  const hasParking = watch("hasParking");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("grossArea")}
          </label>
          <Input type="number" min={0} step="0.1" {...register("grossArea")} />
          {errors.grossArea && (
            <p className="mt-1 text-xs text-danger">{t("grossAreaError")}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("netArea")}</label>
          <Input type="number" min={0} step="0.1" {...register("netArea")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("bedrooms")}
          </label>
          <Input type="number" min={0} step="1" {...register("bedrooms")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("bathrooms")}
          </label>
          <Input type="number" min={0} step="1" {...register("bathrooms")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("floor")}</label>
          <Input type="number" step="1" {...register("floor")} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("totalFloors")}
          </label>
          <Input type="number" min={0} step="1" {...register("totalFloors")} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t("furnishing")}
        </label>
        <div className="flex flex-wrap gap-2">
          {FURNISHING_STATUSES.map((status) => (
            <Chip
              key={status}
              selected={furnishing === status}
              onClick={() =>
                setValue("furnishing", furnishing === status ? undefined : status)
              }
            >
              {furnishingT(status)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Checkbox
          checked={!!hasElevator}
          onChange={(checked) => setValue("hasElevator", checked)}
          label={t("elevator")}
        />
        <Checkbox
          checked={!!hasParking}
          onChange={(checked) => setValue("hasParking", checked)}
          label={t("parking")}
        />
      </div>
    </div>
  );
}
