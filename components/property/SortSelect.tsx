"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/Select";
import { buildHref, type PropertiesQuery } from "@/lib/filters/property-filters";
import type { SortOption } from "@/lib/data/properties";

export function SortSelect({
  query,
  basePath,
}: {
  query: PropertiesQuery;
  basePath: string;
}) {
  const t = useTranslations("sort");
  const router = useRouter();

  return (
    <Select
      aria-label={t("label")}
      value={query.sort}
      onChange={(event) =>
        router.push(
          buildHref(basePath, query, { sort: event.target.value as SortOption, page: 1 }),
        )
      }
      className="w-auto"
    >
      <option value="newest">{t("newest")}</option>
      <option value="price_asc">{t("priceAsc")}</option>
      <option value="price_desc">{t("priceDesc")}</option>
      <option value="area_desc">{t("areaDesc")}</option>
    </Select>
  );
}
