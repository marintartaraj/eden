"use client";

import { useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { PROPERTY_TYPES } from "@/lib/property-types";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

export function Step2TypeLocation({
  cities,
  neighborhoods,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
}) {
  const t = useTranslations("sellProperty.step2");
  const propertyTypesT = useTranslations("propertyTypes");
  const locale = useLocale() as AppLocale;
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<PropertySubmissionInput>();

  const propertyType = watch("propertyType");
  const city = watch("city");
  const selectedCity = cities.find((c) => c.slug === city);
  const availableNeighborhoods = selectedCity
    ? neighborhoods.filter((n) => n.city_id === selectedCity.id)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t("propertyType")}
        </label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <Chip
              key={type}
              selected={propertyType === type}
              onClick={() => setValue("propertyType", type, { shouldValidate: true })}
            >
              {propertyTypesT(type)}
            </Chip>
          ))}
        </div>
        {errors.propertyType && (
          <p className="mt-1 text-xs text-danger">{t("propertyTypeError")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t("city")}</label>
          <Select
            {...register("city")}
            onChange={(event) => {
              setValue("city", event.target.value, { shouldValidate: true });
              setValue("neighborhood", undefined);
            }}
          >
            <option value="">{t("cityPlaceholder")}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.slug}>
                {localize(c.name_sq, c.name_en, locale)}
              </option>
            ))}
          </Select>
          {errors.city && <p className="mt-1 text-xs text-danger">{t("cityError")}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("neighborhood")}
          </label>
          <Select {...register("neighborhood")} disabled={!city}>
            <option value="">{t("neighborhoodPlaceholder")}</option>
            {availableNeighborhoods.map((n) => (
              <option key={n.id} value={n.slug}>
                {localize(n.name_sq, n.name_en, locale)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{t("address")}</label>
        <Input placeholder={t("addressPlaceholder")} {...register("addressLine")} />
      </div>
    </div>
  );
}
