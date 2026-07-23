import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { PropertyDetail } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";
import { localize } from "@/lib/localize";

export async function LocationSection({
  property,
  locale,
}: {
  property: PropertyDetail;
  locale: AppLocale;
}) {
  const t = await getTranslations("detail");
  const cityName = property.city
    ? localize(property.city.name_sq, property.city.name_en, locale)
    : null;
  const neighborhoodName = property.neighborhood
    ? localize(property.neighborhood.name_sq, property.neighborhood.name_en, locale)
    : null;
  const location = [property.address_line, neighborhoodName, cityName].filter(Boolean).join(", ");

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("location")}</h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        {location && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            {location}
          </p>
        )}
        <div className="flex flex-col items-center gap-2 rounded-xl bg-background px-6 py-12 text-center">
          <MapPin className="h-6 w-6 text-muted" />
          <p className="text-sm text-muted">{t("mapComingSoon")}</p>
        </div>
      </div>
    </section>
  );
}
