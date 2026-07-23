"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/Checkbox";
import { localize } from "@/lib/localize";
import { formatArea } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";
import type { PropertySubmissionInput } from "@/lib/validations/property-submission";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

export function Step8Review({
  cities,
  neighborhoods,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
}) {
  const t = useTranslations("sellProperty.step8");
  const filtersT = useTranslations("filters");
  const propertyTypesT = useTranslations("propertyTypes");
  const locale = useLocale() as AppLocale;
  const {
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useFormContext<PropertySubmissionInput>();

  const values = watch();
  const city = cities.find((c) => c.slug === values.city);
  const neighborhood = neighborhoods.find((n) => n.slug === values.neighborhood);

  const locationText =
    [
      neighborhood ? localize(neighborhood.name_sq, neighborhood.name_en, locale) : null,
      city ? localize(city.name_sq, city.name_en, locale) : null,
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const rows: { label: string; value: string }[] = [
    {
      label: t("purpose"),
      value: values.purpose === "sale" ? filtersT("purposeSale") : filtersT("purposeRent"),
    },
    {
      label: t("propertyType"),
      value: values.propertyType ? propertyTypesT(values.propertyType) : "—",
    },
    { label: t("location"), value: locationText },
    {
      label: t("area"),
      value: values.grossArea ? formatArea(Number(values.grossArea), locale) : "—",
    },
    { label: t("price"), value: values.price ? `€${values.price}` : "—" },
    { label: t("photos"), value: String(values.photos?.length ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <dl className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {values.photos && values.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {values.photos.map((url) => (
            <div key={url} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-border">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div>
        <Checkbox
          checked={!!values.agreeToTerms}
          onChange={(checked) => setValue("agreeToTerms", checked, { shouldValidate: true })}
          label={t("confirmLabel")}
        />
        {isSubmitted && errors.agreeToTerms && (
          <p className="mt-1 text-xs text-danger">{t("confirmError")}</p>
        )}
      </div>
    </div>
  );
}
