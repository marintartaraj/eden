"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PROPERTY_TYPES } from "@/lib/property-types";
import { localize } from "@/lib/localize";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

export function Hero({
  cities,
  neighborhoods,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
}) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");
  const [cityId, setCityId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const availableNeighborhoods = useMemo(
    () => neighborhoods.filter((n) => n.city_id === cityId),
    [neighborhoods, cityId],
  );

  function buildParams() {
    const params = new URLSearchParams();
    params.set("purpose", purpose);
    const city = cities.find((c) => c.id === cityId);
    if (city) params.set("city", city.slug);
    const neighborhood = availableNeighborhoods.find((n) => n.id === neighborhoodId);
    if (neighborhood) params.set("neighborhood", neighborhood.slug);
    if (propertyType) params.set("type", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    return params;
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/properties?${buildParams().toString()}`);
  }

  function goTo(extra: Record<string, string>) {
    const params = buildParams();
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 inline-flex rounded-full bg-background p-1">
        {(["sale", "rent"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPurpose(option)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              purpose === option
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {option === "sale" ? t("nav.forSale") : t("nav.forRent")}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <Select
          aria-label={t("hero.cityLabel")}
          value={cityId}
          onChange={(event) => {
            setCityId(event.target.value);
            setNeighborhoodId("");
          }}
        >
          <option value="">{t("hero.cityPlaceholder")}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {localize(city.name_sq, city.name_en, locale)}
            </option>
          ))}
        </Select>

        <Select
          aria-label={t("hero.neighborhoodLabel")}
          value={neighborhoodId}
          onChange={(event) => setNeighborhoodId(event.target.value)}
          disabled={!cityId}
        >
          <option value="">{t("hero.neighborhoodPlaceholder")}</option>
          {availableNeighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>
              {localize(neighborhood.name_sq, neighborhood.name_en, locale)}
            </option>
          ))}
        </Select>

        <Select
          aria-label={t("hero.typeLabel")}
          value={propertyType}
          onChange={(event) => setPropertyType(event.target.value)}
        >
          <option value="">{t("hero.typePlaceholder")}</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`propertyTypes.${type}`)}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={t("hero.minPrice")}
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
        />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={t("hero.maxPrice")}
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:col-span-2 lg:col-span-3 xl:col-span-5">
          <Button type="submit" className="flex-1">
            {t("hero.search")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => goTo({ advanced: "1" })}
          >
            {t("hero.advancedSearch")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => goTo({ view: "map" })}>
            {t("hero.mapSearch")}
          </Button>
        </div>
      </form>
    </div>
  );
}
