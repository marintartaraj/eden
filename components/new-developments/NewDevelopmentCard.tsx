import Image from "next/image";
import { Building2, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { NewDevelopmentListItem } from "@/lib/data/new-developments";
import { localize } from "@/lib/localize";
import { formatDate } from "@/lib/format";

export function NewDevelopmentCard({
  development,
  locale,
  priority = false,
}: {
  development: NewDevelopmentListItem;
  locale: AppLocale;
  priority?: boolean;
}) {
  const name = localize(development.name_sq, development.name_en, locale);
  const cityName = development.city
    ? localize(development.city.name_sq, development.city.name_en, locale)
    : null;
  const neighborhoodName = development.neighborhood
    ? localize(development.neighborhood.name_sq, development.neighborhood.name_en, locale)
    : null;
  const location = [neighborhoodName, cityName].filter(Boolean).join(", ");

  return (
    <Link
      href={`/new-developments/${development.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-border">
        {development.cover_image && (
          <Image
            src={development.cover_image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-serif text-base text-foreground">{name}</h3>
        {location && <p className="text-sm text-muted">{location}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
          {development.developer_name && (
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {development.developer_name}
            </span>
          )}
          {development.delivery_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(development.delivery_date, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
