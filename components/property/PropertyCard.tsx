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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
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
          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
            {property.purpose === "sale" ? t("badgeSale") : t("badgeRent")}
          </span>
          {property.is_exclusive ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {t("exclusive")}
            </span>
          ) : (
            property.is_featured && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {t("featured")}
              </span>
            )
          )}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} label={t("saveProperty")} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-lg font-semibold text-foreground">
          {formatPrice(property.price, property.currency, locale, property.price_period)}
        </p>
        <h3 className="line-clamp-1 font-serif text-base text-foreground">{title}</h3>
        {location && <p className="text-sm text-muted">{location}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
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
