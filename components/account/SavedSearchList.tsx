"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteSavedSearch } from "@/lib/actions/saved-searches";
import type { Database } from "@/types/supabase";

type SavedSearch = Database["public"]["Tables"]["saved_searches"]["Row"];

// Summarizes the saved query string into a short "3+ Bedrooms · Tirana ·
// €100,000+" line — the list previously showed only the user-given search
// name, with no indication of what filters it actually represents.
function summarizeFilters(
  queryString: string | undefined,
  t: (key: string) => string,
): string | null {
  if (!queryString) return null;
  const params = new URLSearchParams(queryString);
  const parts: string[] = [];

  const purpose = params.get("purpose");
  if (purpose === "sale") parts.push(t("filters.purposeSale"));
  else if (purpose === "rent") parts.push(t("filters.purposeRent"));

  const city = params.get("city");
  if (city) parts.push(city.charAt(0).toUpperCase() + city.slice(1));

  const types = params.getAll("type");
  if (types.length > 0) parts.push(types.map((type) => t(`propertyTypes.${type}`)).join("/"));

  const bedrooms = params.get("bedrooms");
  if (bedrooms) parts.push(`${bedrooms}+ ${t("filters.bedrooms")}`);

  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  if (minPrice && maxPrice) parts.push(`€${minPrice}–€${maxPrice}`);
  else if (minPrice) parts.push(`€${minPrice}+`);
  else if (maxPrice) parts.push(`≤ €${maxPrice}`);

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function SavedSearchList({ searches }: { searches: SavedSearch[] }) {
  const t = useTranslations("savedSearches");
  const fullT = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <p className="text-muted">{t("empty")}</p>
        <Link
          href="/properties"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("browseCta")}
        </Link>
      </div>
    );
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSavedSearch(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {searches.map((search) => {
        const filters = search.filters as { basePath?: string; queryString?: string } | null;
        const href = filters?.basePath
          ? filters.queryString
            ? `${filters.basePath}?${filters.queryString}`
            : filters.basePath
          : "/properties";
        const summary = summarizeFilters(filters?.queryString, fullT);
        return (
          <div
            key={search.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div>
              <Link href={href} className="text-sm font-medium text-foreground hover:underline">
                {search.name}
              </Link>
              {summary && <p className="mt-0.5 text-xs text-muted">{summary}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(search.id)}
              disabled={isPending}
              aria-label={t("delete")}
              className="text-muted transition-colors hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
