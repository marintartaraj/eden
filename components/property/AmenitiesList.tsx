import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { PropertyDetail } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";
import { localize } from "@/lib/localize";

export async function AmenitiesList({
  amenities,
  locale,
}: {
  amenities: PropertyDetail["amenities"];
  locale: AppLocale;
}) {
  if (amenities.length === 0) return null;
  const t = await getTranslations("detail");

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("amenities")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 shrink-0 text-accent" />
            {localize(amenity.name_sq, amenity.name_en, locale)}
          </div>
        ))}
      </div>
    </section>
  );
}
