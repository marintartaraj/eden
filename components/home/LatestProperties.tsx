import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { getLatestProperties } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";

export async function LatestProperties({ locale }: { locale: AppLocale }) {
  const [t, properties] = await Promise.all([
    getTranslations("home"),
    getLatestProperties(8),
  ]);

  if (properties.length === 0) return null;

  return (
    <section className="bg-card py-16">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
              {t("latestTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("latestSubtitle")}</p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-medium text-accent hover:opacity-80"
          >
            {t("viewAll")}
          </Link>
        </div>
        <PropertyGrid properties={properties} locale={locale} />
      </Container>
    </section>
  );
}
