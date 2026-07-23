import type { AppLocale } from "@/i18n/routing";
import type { PropertyListItem } from "@/lib/data/properties";
import { PropertyCard } from "./PropertyCard";

export function PropertyGrid({
  properties,
  locale,
  priorityCount = 0,
}: {
  properties: PropertyListItem[];
  locale: AppLocale;
  /** Number of leading cards to mark as high-priority (above-the-fold) images. */
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          locale={locale}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
