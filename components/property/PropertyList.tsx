import type { AppLocale } from "@/i18n/routing";
import type { PropertyListItem } from "@/lib/data/properties";
import { PropertyListRow } from "./PropertyListRow";

export function PropertyList({
  properties,
  locale,
  priorityCount = 0,
}: {
  properties: PropertyListItem[];
  locale: AppLocale;
  priorityCount?: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {properties.map((property, index) => (
        <PropertyListRow
          key={property.id}
          property={property}
          locale={locale}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
