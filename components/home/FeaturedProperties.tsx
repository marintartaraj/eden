import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { getFeaturedProperties } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";

export async function FeaturedProperties({ locale }: { locale: AppLocale }) {
  const [t, properties] = await Promise.all([
    getTranslations("home"),
    getFeaturedProperties(6),
  ]);

  if (properties.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
              {t("featuredTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("featuredSubtitle")}</p>
          </div>
          <Link
            href="/properties?featured=1"
            className="text-sm font-medium text-accent hover:opacity-80"
          >
            {t("viewAll")}
          </Link>
        </div>
        <PropertyGrid properties={properties} locale={locale} priorityCount={3} />
      </Container>
    </section>
  );
}
