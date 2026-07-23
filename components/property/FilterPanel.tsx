"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Checkbox } from "@/components/ui/Checkbox";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { PROPERTY_TYPES } from "@/lib/property-types";
import {
  FURNISHING_STATUSES,
  CONSTRUCTION_CONDITIONS,
  CERTIFICATE_STATUSES,
} from "@/lib/property-enums";
import { localize } from "@/lib/localize";
import {
  buildHref,
  defaultPropertiesQuery,
  type PropertiesQuery,
} from "@/lib/filters/property-filters";
import type { AppLocale } from "@/i18n/routing";
import type { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOM_OPTIONS = [1, 2, 3];
const FLOOR_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({
  cities,
  neighborhoods,
  query,
  basePath,
  forcedPurpose,
  onClose,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  query: PropertiesQuery;
  basePath: string;
  forcedPurpose?: "sale" | "rent";
  onClose?: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [draft, setDraft] = useState<PropertiesQuery>(query);

  const selectedCity = cities.find((c) => c.slug === draft.city);
  const availableNeighborhoods = selectedCity
    ? neighborhoods.filter((n) => n.city_id === selectedCity.id)
    : [];

  function updatePurpose(next: "sale" | "rent") {
    router.push(buildHref(basePath, query, { purpose: next, page: 1 }));
  }

  function applyFilters() {
    router.push(buildHref(basePath, draft, { page: 1 }));
    onClose?.();
  }

  function clearAll() {
    const cleared = defaultPropertiesQuery();
    setDraft(cleared);
    router.push(basePath);
    onClose?.();
  }

  return (
    <div className="flex flex-col">
      {!forcedPurpose && (
        <div className="mb-4 flex gap-2">
          {(["sale", "rent"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updatePurpose(option)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                query.purpose === option
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted hover:text-foreground",
              )}
            >
              {option === "sale" ? t("filters.purposeSale") : t("filters.purposeRent")}
            </button>
          ))}
        </div>
      )}

      <CollapsibleSection title={t("filters.propertyType")}>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <Chip
              key={type}
              selected={draft.type.includes(type)}
              onClick={() => setDraft((d) => ({ ...d, type: toggleValue(d.type, type) }))}
              size="sm"
            >
              {t(`propertyTypes.${type}`)}
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.location")}>
        <div className="flex flex-col gap-3">
          <Select
            aria-label={t("hero.cityLabel")}
            value={draft.city ?? ""}
            onChange={(event) =>
              setDraft((d) => ({
                ...d,
                city: event.target.value || undefined,
                neighborhood: undefined,
              }))
            }
          >
            <option value="">{t("hero.cityPlaceholder")}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {localize(city.name_sq, city.name_en, locale)}
              </option>
            ))}
          </Select>
          <Select
            aria-label={t("hero.neighborhoodLabel")}
            value={draft.neighborhood ?? ""}
            onChange={(event) =>
              setDraft((d) => ({ ...d, neighborhood: event.target.value || undefined }))
            }
            disabled={!draft.city}
          >
            <option value="">{t("hero.neighborhoodPlaceholder")}</option>
            {availableNeighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.slug}>
                {localize(neighborhood.name_sq, neighborhood.name_en, locale)}
              </option>
            ))}
          </Select>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.priceRange")}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder={t("filters.minPlaceholder")}
            value={draft.minPrice ?? ""}
            onChange={(event) =>
              setDraft((d) => ({ ...d, minPrice: event.target.value || undefined }))
            }
          />
          <Input
            type="number"
            min={0}
            placeholder={t("filters.maxPlaceholder")}
            value={draft.maxPrice ?? ""}
            onChange={(event) =>
              setDraft((d) => ({ ...d, maxPrice: event.target.value || undefined }))
            }
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.areaRange")}>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder={t("filters.minPlaceholder")}
            value={draft.minArea ?? ""}
            onChange={(event) =>
              setDraft((d) => ({ ...d, minArea: event.target.value || undefined }))
            }
          />
          <Input
            type="number"
            min={0}
            placeholder={t("filters.maxPlaceholder")}
            value={draft.maxArea ?? ""}
            onChange={(event) =>
              setDraft((d) => ({ ...d, maxArea: event.target.value || undefined }))
            }
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.bedrooms")}>
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={!draft.bedrooms}
            onClick={() => setDraft((d) => ({ ...d, bedrooms: undefined }))}
            size="sm"
          >
            {t("filters.any")}
          </Chip>
          {BEDROOM_OPTIONS.map((n) => (
            <Chip
              key={n}
              selected={draft.bedrooms === String(n)}
              onClick={() => setDraft((d) => ({ ...d, bedrooms: String(n) }))}
              size="sm"
            >
              {n}+
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.bathrooms")}>
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={!draft.bathrooms}
            onClick={() => setDraft((d) => ({ ...d, bathrooms: undefined }))}
            size="sm"
          >
            {t("filters.any")}
          </Chip>
          {BATHROOM_OPTIONS.map((n) => (
            <Chip
              key={n}
              selected={draft.bathrooms === String(n)}
              onClick={() => setDraft((d) => ({ ...d, bathrooms: String(n) }))}
              size="sm"
            >
              {n}+
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.floor")}>
        <Select
          aria-label={t("filters.floor")}
          value={draft.floor ?? ""}
          onChange={(event) =>
            setDraft((d) => ({ ...d, floor: event.target.value || undefined }))
          }
        >
          <option value="">{t("filters.any")}</option>
          {FLOOR_OPTIONS.map((floor) => (
            <option key={floor} value={floor}>
              {floor === 0 ? t("filters.groundFloor") : floor}
            </option>
          ))}
        </Select>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.furnishing")}>
        <div className="flex flex-wrap gap-2">
          {FURNISHING_STATUSES.map((status) => (
            <Chip
              key={status}
              selected={draft.furnishing.includes(status)}
              onClick={() =>
                setDraft((d) => ({ ...d, furnishing: toggleValue(d.furnishing, status) }))
              }
              size="sm"
            >
              {t(`furnishingStatus.${status}`)}
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.elevatorParking")}>
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={!!draft.elevator}
            onChange={(checked) => setDraft((d) => ({ ...d, elevator: checked }))}
            label={t("filters.hasElevator")}
          />
          <Checkbox
            checked={!!draft.parking}
            onChange={(checked) => setDraft((d) => ({ ...d, parking: checked }))}
            label={t("filters.hasParking")}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.condition")}>
        <div className="flex flex-wrap gap-2">
          {CONSTRUCTION_CONDITIONS.map((condition) => (
            <Chip
              key={condition}
              selected={draft.condition.includes(condition)}
              onClick={() =>
                setDraft((d) => ({ ...d, condition: toggleValue(d.condition, condition) }))
              }
              size="sm"
            >
              {t(`constructionCondition.${condition}`)}
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("filters.certificate")} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATE_STATUSES.map((status) => (
            <Chip
              key={status}
              selected={draft.certificate.includes(status)}
              onClick={() =>
                setDraft((d) => ({ ...d, certificate: toggleValue(d.certificate, status) }))
              }
              size="sm"
            >
              {t(`certificateStatus.${status}`)}
            </Chip>
          ))}
        </div>
      </CollapsibleSection>

      <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-border bg-background pt-4">
        <Button variant="secondary" className="flex-1" onClick={clearAll}>
          {t("filters.clearAll")}
        </Button>
        <Button className="flex-1" onClick={applyFilters}>
          {t("filters.apply")}
        </Button>
      </div>
    </div>
  );
}
