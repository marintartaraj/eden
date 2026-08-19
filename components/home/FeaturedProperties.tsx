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
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("featuredEyebrow")}</span>
            <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
              {t("featuredTitle")}
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted">{t("featuredSubtitle")}</p>
        </div>
        <PropertyGrid properties={properties} locale={locale} priorityCount={3} />
        <Link
          href="/properties?featured=1"
          className="mx-auto mt-12 block w-fit border-b border-accent-foreground pb-1.5 font-label text-[13px] uppercase tracking-wider text-foreground"
        >
          {t("viewAll")} →
        </Link>
      </Container>
    </section>
  );
}
