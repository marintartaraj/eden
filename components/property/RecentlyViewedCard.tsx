"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { RecentlyViewedItem } from "@/lib/hooks/useRecentlyViewed";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";

export function RecentlyViewedCard({
  item,
  locale,
}: {
  item: RecentlyViewedItem;
  locale: AppLocale;
}) {
  const t = useTranslations("property");
  const title = localize(item.titleSq, item.titleEn, locale);
  const cityName = item.cityNameSq ? localize(item.cityNameSq, item.cityNameEn, locale) : null;
  const neighborhoodName = item.neighborhoodNameSq
    ? localize(item.neighborhoodNameSq, item.neighborhoodNameEn, locale)
    : null;
  const location = [neighborhoodName, cityName].filter(Boolean).join(", ");

  return (
    <Link
      href={`/properties/${item.slug}`}
      className="group flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card sm:w-56"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-border">
        {item.coverImageUrl && (
          <Image
            src={item.coverImageUrl}
            alt={title}
            fill
            sizes="224px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
          {item.purpose === "sale" ? t("badgeSale") : t("badgeRent")}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(item.price, item.currency, locale, item.pricePeriod)}
        </p>
        <h3 className="line-clamp-1 text-xs text-foreground">{title}</h3>
        {location && <p className="line-clamp-1 text-xs text-muted">{location}</p>}
      </div>
    </Link>
  );
}
