"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { buildHref, type PropertiesQuery } from "@/lib/filters/property-filters";
import { formatPrice, formatArea } from "@/lib/format";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

type ChipItem = { key: string; label: string; patch: Partial<PropertiesQuery> };

export function ActiveFilterChips({
  query,
  basePath,
  cities,
  neighborhoods,
}: {
  query: PropertiesQuery;
  basePath: string;
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
}) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const chips: ChipItem[] = [];

  if (query.city) {
    const city = cities.find((c) => c.slug === query.city);
    chips.push({
      key: "city",
      label: city ? localize(city.name_sq, city.name_en, locale) : query.city,
      patch: { city: undefined, neighborhood: undefined },
    });
  }

  if (query.neighborhood) {
    const neighborhood = neighborhoods.find((n) => n.slug === query.neighborhood);
    chips.push({
      key: "neighborhood",
      label: neighborhood
        ? localize(neighborhood.name_sq, neighborhood.name_en, locale)
        : query.neighborhood,
      patch: { neighborhood: undefined },
    });
  }

  for (const type of query.type) {
    chips.push({
      key: `type-${type}`,
      label: t(`propertyTypes.${type}`),
      patch: { type: query.type.filter((v) => v !== type) },
    });
  }

  if (query.minPrice || query.maxPrice) {
    const min = query.minPrice ? formatPrice(Number(query.minPrice), "EUR", locale) : null;
    const max = query.maxPrice ? formatPrice(Number(query.maxPrice), "EUR", locale) : null;
    chips.push({
      key: "price",
      label: min && max ? `${min} – ${max}` : min ? `${min}+` : `≤ ${max}`,
      patch: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (query.minArea || query.maxArea) {
    const min = query.minArea ? formatArea(Number(query.minArea), locale) : null;
    const max = query.maxArea ? formatArea(Number(query.maxArea), locale) : null;
    chips.push({
      key: "area",
      label: min && max ? `${min} – ${max}` : min ? `${min}+` : `≤ ${max}`,
      patch: { minArea: undefined, maxArea: undefined },
    });
  }

  if (query.bedrooms) {
    chips.push({
      key: "bedrooms",
      label: `${query.bedrooms}+ ${t("filters.bedrooms")}`,
      patch: { bedrooms: undefined },
    });
  }

  if (query.bathrooms) {
    chips.push({
      key: "bathrooms",
      label: `${query.bathrooms}+ ${t("filters.bathrooms")}`,
      patch: { bathrooms: undefined },
    });
  }

  if (query.floor) {
    chips.push({
      key: "floor",
      label: query.floor === "0" ? t("filters.groundFloor") : `${t("filters.floor")} ${query.floor}`,
      patch: { floor: undefined },
    });
  }

  for (const status of query.furnishing) {
    chips.push({
      key: `furnishing-${status}`,
      label: t(`furnishingStatus.${status}`),
      patch: { furnishing: query.furnishing.filter((v) => v !== status) },
    });
  }

  if (query.elevator) {
    chips.push({ key: "elevator", label: t("filters.hasElevator"), patch: { elevator: undefined } });
  }

  if (query.parking) {
    chips.push({ key: "parking", label: t("filters.hasParking"), patch: { parking: undefined } });
  }

  for (const condition of query.condition) {
    chips.push({
      key: `condition-${condition}`,
      label: t(`constructionCondition.${condition}`),
      patch: { condition: query.condition.filter((v) => v !== condition) },
    });
  }

  for (const status of query.certificate) {
    chips.push({
      key: `certificate-${status}`,
      label: t(`certificateStatus.${status}`),
      patch: { certificate: query.certificate.filter((v) => v !== status) },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => router.push(buildHref(basePath, query, { ...chip.patch, page: 1 }))}
          aria-label={t("filters.removeFilter", { filter: chip.label })}
          className="flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 py-1 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:bg-accent/20"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push(basePath)}
        className="text-xs font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("filters.clearAll")}
      </button>
    </div>
  );
}
