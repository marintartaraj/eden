import Image from "next/image";
import { BedDouble, Bath, Move, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { PropertyListItem } from "@/lib/data/properties";
import { localize } from "@/lib/localize";
import { formatPrice, formatArea } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";

export async function PropertyCard({
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
      className="group flex flex-col overflow-hidden border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-border">
        {property.coverImageUrl && (
          <Image
            src={property.coverImageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="bg-card px-3 py-1 font-label text-[11px] uppercase tracking-wide text-foreground">
            {property.purpose === "sale" ? t("badgeSale") : t("badgeRent")}
          </span>
          {property.is_exclusive ? (
            <span className="bg-ink px-3 py-1 font-label text-[11px] uppercase tracking-wide text-accent-light">
              {t("exclusive")}
            </span>
          ) : (
            property.is_featured && (
              <span className="bg-ink px-3 py-1 font-label text-[11px] uppercase tracking-wide text-accent-light">
                {t("featured")}
              </span>
            )
          )}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} label={t("saveProperty")} />
        </div>
        <div className="absolute bottom-3 right-3 bg-ink px-4 py-2 font-serif text-base text-accent-light">
          {formatPrice(property.price, property.currency, locale, property.price_period)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-serif text-lg text-foreground">{title}</h3>
        {location && (
          <p className="font-label text-xs uppercase tracking-wide text-muted">{location}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-sm text-muted">
          {property.gross_area != null && (
            <span className="flex items-center gap-1">
              <Move className="h-4 w-4" aria-label={t("areaLabel")} />
              {formatArea(property.gross_area, locale)}
            </span>
          )}
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" aria-label={t("bedroomsLabel")} />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" aria-label={t("bathroomsLabel")} />
              {property.bathrooms}
            </span>
          )}
          {property.floor != null && (
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" aria-label={t("floorLabel")} />
              {property.floor}
            </span>
          )}
        </div>

        {property.reference_code && (
          <p className="mt-auto pt-2 text-xs text-muted">
            {t("reference")}: {property.reference_code}
          </p>
        )}
      </div>
    </Link>
  );
}
