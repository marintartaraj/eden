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
    <section className="bg-background-alt py-16">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("latestEyebrow")}</span>
            <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
              {t("latestTitle")}
            </h2>
            <p className="mt-2 text-muted">{t("latestSubtitle")}</p>
          </div>
          <Link
            href="/properties"
            className="font-label text-[13px] uppercase tracking-wider text-foreground underline decoration-accent-foreground underline-offset-4"
          >
            {t("viewAll")}
          </Link>
        </div>
        <PropertyGrid properties={properties} locale={locale} />
      </Container>
    </section>
  );
}
