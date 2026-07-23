import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyList } from "@/components/property/PropertyList";
import { MapViewPlaceholder } from "@/components/property/MapViewPlaceholder";
import { SortSelect } from "@/components/property/SortSelect";
import { ViewToggle } from "@/components/property/ViewToggle";
import { Pagination } from "@/components/property/Pagination";
import { FilterPanel } from "@/components/property/FilterPanel";
import { FilterSheetTrigger } from "@/components/property/FilterSheetTrigger";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import { searchProperties, DEFAULT_PAGE_SIZE } from "@/lib/data/properties";
import { parsePropertiesSearchParams, toFilters } from "@/lib/filters/property-filters";
import type { AppLocale } from "@/i18n/routing";

export async function PropertiesResults({
  searchParams,
  locale,
  basePath,
  forcedPurpose,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  locale: AppLocale;
  basePath: "/properties" | "/for-sale" | "/for-rent";
  forcedPurpose?: "sale" | "rent";
}) {
  const query = parsePropertiesSearchParams(searchParams);
  if (forcedPurpose) query.purpose = forcedPurpose;

  const [resultsT, viewT, commonT, cities, neighborhoods, result] = await Promise.all([
    getTranslations("results"),
    getTranslations("view"),
    getTranslations("common"),
    getCities(),
    getNeighborhoods(),
    searchProperties(toFilters(query), {
      page: query.page,
      sort: query.sort,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
  ]);

  const title =
    forcedPurpose === "sale"
      ? resultsT("forSaleTitle")
      : forcedPurpose === "rent"
        ? resultsT("forRentTitle")
        : resultsT("title");

  const showPagination = query.view !== "map";

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{resultsT("count", { count: result.total })}</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterSheetTrigger
            cities={cities}
            neighborhoods={neighborhoods}
            query={query}
            basePath={basePath}
            forcedPurpose={forcedPurpose}
            initialOpen={query.advanced}
            triggerLabel={viewT("filtersButton")}
            closeLabel={commonT("close")}
          />
          <SortSelect query={query} basePath={basePath} />
          <ViewToggle query={query} basePath={basePath} />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <FilterPanel
              cities={cities}
              neighborhoods={neighborhoods}
              query={query}
              basePath={basePath}
              forcedPurpose={forcedPurpose}
            />
          </div>
        </aside>

        <div>
          {query.view === "map" ? (
            <MapViewPlaceholder query={query} basePath={basePath} />
          ) : result.items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-24 text-center text-muted">
              {resultsT("empty")}
            </div>
          ) : query.view === "list" ? (
            <PropertyList properties={result.items} locale={locale} priorityCount={2} />
          ) : (
            <PropertyGrid properties={result.items} locale={locale} priorityCount={3} />
          )}

          {showPagination && result.items.length > 0 && (
            <Pagination query={query} pageCount={result.pageCount} basePath={basePath} />
          )}
        </div>
      </div>
    </Container>
  );
}
