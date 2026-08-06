import { getTranslations } from "next-intl/server";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyList } from "@/components/property/PropertyList";
import { PropertyMap, type PropertyMapMarker } from "@/components/property/PropertyMap";
import { Pagination } from "@/components/property/Pagination";
import { searchProperties, DEFAULT_PAGE_SIZE } from "@/lib/data/properties";
import { toFilters, type PropertiesQuery } from "@/lib/filters/property-filters";
import { resolveCoordinates } from "@/lib/city-coordinates";
import { localize } from "@/lib/localize";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export async function PropertyResultsContent({
  query,
  locale,
  basePath,
}: {
  query: PropertiesQuery;
  locale: AppLocale;
  basePath: "/properties" | "/for-sale" | "/for-rent";
}) {
  const [resultsT, result] = await Promise.all([
    getTranslations("results"),
    searchProperties(toFilters(query), {
      page: query.page,
      sort: query.sort,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
  ]);

  const showPagination = query.view !== "map";

  const mapMarkers: PropertyMapMarker[] =
    query.view === "map"
      ? result.items.reduce<PropertyMapMarker[]>((markers, property) => {
          const coordinates = resolveCoordinates(property.lat, property.lng, property.city?.slug, property.id);
          if (!coordinates) return markers;
          markers.push({
            lat: coordinates.lat,
            lng: coordinates.lng,
            label: localize(property.title_sq, property.title_en, locale),
            href: getPathname({ href: `/properties/${property.slug}`, locale }),
          });
          return markers;
        }, [])
      : [];

  return (
    <>
      <p className="mb-4 text-sm text-muted">{resultsT("count", { count: result.total })}</p>

      {query.view === "map" ? (
        mapMarkers.length > 0 ? (
          <PropertyMap markers={mapMarkers} className="h-[60vh] w-full overflow-hidden rounded-2xl" />
        ) : (
          <div className="rounded-2xl border border-border bg-card px-6 py-24 text-center text-muted">
            {resultsT("empty")}
          </div>
        )
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
    </>
  );
}
