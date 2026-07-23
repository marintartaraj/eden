import { getTranslations } from "next-intl/server";
import type { PropertyDetail } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";
import { formatArea } from "@/lib/format";

export async function SpecsTable({
  property,
  locale,
}: {
  property: PropertyDetail;
  locale: AppLocale;
}) {
  const [t, propertyTypesT, furnishingT, conditionT, certificateT, detailT] = await Promise.all([
    getTranslations("property"),
    getTranslations("propertyTypes"),
    getTranslations("furnishingStatus"),
    getTranslations("constructionCondition"),
    getTranslations("certificateStatus"),
    getTranslations("detail"),
  ]);

  const rows: { label: string; value: string }[] = [
    { label: detailT("specPropertyType"), value: propertyTypesT(property.property_type) },
    {
      label: t("areaLabel"),
      value: property.gross_area != null ? formatArea(property.gross_area, locale) : "—",
    },
    ...(property.net_area != null
      ? [{ label: detailT("specNetArea"), value: formatArea(property.net_area, locale) }]
      : []),
    ...(property.bedrooms != null
      ? [{ label: t("bedroomsLabel"), value: String(property.bedrooms) }]
      : []),
    ...(property.bathrooms != null
      ? [{ label: t("bathroomsLabel"), value: String(property.bathrooms) }]
      : []),
    ...(property.floor != null ? [{ label: t("floorLabel"), value: String(property.floor) }] : []),
    ...(property.total_floors != null
      ? [{ label: detailT("specTotalFloors"), value: String(property.total_floors) }]
      : []),
    ...(property.furnishing
      ? [{ label: detailT("specFurnishing"), value: furnishingT(property.furnishing) }]
      : []),
    { label: detailT("specElevator"), value: property.has_elevator ? detailT("yes") : detailT("no") },
    { label: detailT("specParking"), value: property.has_parking ? detailT("yes") : detailT("no") },
    ...(property.construction_condition
      ? [{ label: detailT("specCondition"), value: conditionT(property.construction_condition) }]
      : []),
    ...(property.construction_year != null
      ? [{ label: detailT("specConstructionYear"), value: String(property.construction_year) }]
      : []),
    ...(property.certificate_status
      ? [{ label: detailT("specCertificate"), value: certificateT(property.certificate_status) }]
      : []),
  ];

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{detailT("specifications")}</h2>
      <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
