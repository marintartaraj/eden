import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getCitiesWithPropertyCounts } from "@/lib/data/locations";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";

export async function BrowseByCity({ locale }: { locale: AppLocale }) {
  const [t, cities] = await Promise.all([
    getTranslations("home"),
    getCitiesWithPropertyCounts(8),
  ]);

  if (cities.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            {t("browseCityTitle")}
          </h2>
          <p className="mt-2 text-muted">{t("browseCitySubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/properties?city=${city.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={`https://picsum.photos/seed/city-${city.slug}/600/450`}
                alt={localize(city.name_sq, city.name_en, locale)}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="font-serif text-lg">{localize(city.name_sq, city.name_en, locale)}</p>
                <p className="text-sm text-white/80">
                  {t("propertiesCount", { count: city.propertyCount })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
