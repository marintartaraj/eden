import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SortSelect } from "@/components/property/SortSelect";
import { ViewToggle } from "@/components/property/ViewToggle";
import { ViewModeRestorer } from "@/components/property/ViewModeRestorer";
import { FilterPanel } from "@/components/property/FilterPanel";
import { FilterSheetTrigger } from "@/components/property/FilterSheetTrigger";
import { ActiveFilterChips } from "@/components/property/ActiveFilterChips";
import { PropertyResultsContent } from "@/components/property/PropertyResultsContent";
import { PropertyResultsSkeleton } from "@/components/property/PropertyResultsSkeleton";
import { SaveSearchButton } from "@/components/account/SaveSearchButton";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import { parsePropertiesSearchParams } from "@/lib/filters/property-filters";
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

  const [resultsT, viewT, commonT, cities, neighborhoods] = await Promise.all([
    getTranslations("results"),
    getTranslations("view"),
    getTranslations("common"),
    getCities(),
    getNeighborhoods(),
  ]);

  const title =
    forcedPurpose === "sale"
      ? resultsT("forSaleTitle")
      : forcedPurpose === "rent"
        ? resultsT("forRentTitle")
        : resultsT("title");

  return (
    <Container className="py-8 sm:py-12">
      <ViewModeRestorer basePath={basePath} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
          <div className="mt-3 h-0.5 w-12 bg-accent-foreground" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <SaveSearchButton basePath={basePath} query={query} />
        </div>
      </div>

      <ActiveFilterChips query={query} basePath={basePath} cities={cities} neighborhoods={neighborhoods} />

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
          <Suspense key={JSON.stringify(query)} fallback={<PropertyResultsSkeleton />}>
            <PropertyResultsContent query={query} locale={locale} basePath={basePath} />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
