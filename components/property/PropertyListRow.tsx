import Image from "next/image";
import { BedDouble, Bath, Move, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { PropertyListItem } from "@/lib/data/properties";
import { localize } from "@/lib/localize";
import { formatPrice, formatArea } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";

export async function PropertyListRow({
  property,
  locale,
  priority = false,
}: {
  property: PropertyListItem;
  locale: AppLocale;
  priority?: boolean;
}) {
  const t = await getTranslations("property");
  const title = localize(property.title_sq, property.title_en, locale);
  const cityName = property.city
    ? localize(property.city.name_sq, property.city.name_en, locale)
    : null;
  const neighborhoodName = property.neighborhood
    ? localize(property.neighborhood.name_sq, property.neighborhood.name_en, locale)
    : null;
  const location = [neighborhoodName, cityName].filter(Boolean).join(", ");

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:gap-6 sm:p-4"
    >
      <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-border sm:w-56">
        {property.coverImageUrl && (
          <Image
            src={property.coverImageUrl}
            alt={title}
            fill
            sizes="(min-width: 640px) 224px, 128px"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background sm:px-3 sm:py-1 sm:text-xs">
            {property.purpose === "sale" ? t("badgeSale") : t("badgeRent")}
          </span>
          {property.is_exclusive ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground sm:px-3 sm:py-1 sm:text-xs">
              {t("exclusive")}
            </span>
          ) : (
            property.is_featured && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground sm:px-3 sm:py-1 sm:text-xs">
                {t("featured")}
              </span>
            )
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 py-1 sm:gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold text-foreground sm:text-lg">
            {formatPrice(property.price, property.currency, locale, property.price_period)}
          </p>
          <FavoriteButton propertyId={property.id} label={t("saveProperty")} />
        </div>
        <h3 className="line-clamp-1 font-serif text-sm text-foreground sm:text-base">{title}</h3>
        {location && <p className="text-xs text-muted sm:text-sm">{location}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted sm:text-sm">
          {property.gross_area != null && (
            <span className="flex items-center gap-1">
              <Move className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-label={t("areaLabel")} />
              {formatArea(property.gross_area, locale)}
            </span>
          )}
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-label={t("bedroomsLabel")} />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-label={t("bathroomsLabel")} />
              {property.bathrooms}
            </span>
          )}
          {property.floor != null && (
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-label={t("floorLabel")} />
              {property.floor}
            </span>
          )}
        </div>

        {property.reference_code && (
          <p className="mt-auto pt-1 text-[11px] text-muted sm:text-xs">
            {t("reference")}: {property.reference_code}
          </p>
        )}
      </div>
    </Link>
  );
}
