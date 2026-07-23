import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/home/Hero";
import { PropertyTypeShortcuts } from "@/components/home/PropertyTypeShortcuts";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { LatestProperties } from "@/components/home/LatestProperties";
import { BrowseByCity } from "@/components/home/BrowseByCity";
import { SellCta } from "@/components/home/SellCta";
import { FeaturedAgents } from "@/components/home/FeaturedAgents";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { GuidesPreview } from "@/components/home/GuidesPreview";
import { getCities, getNeighborhoods } from "@/lib/data/locations";
import type { AppLocale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, cities, neighborhoods] = await Promise.all([
    getTranslations("home"),
    getCities(),
    getNeighborhoods(),
  ]);

  return (
    <>
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <Container className="flex flex-col items-center gap-8 text-center">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl text-foreground sm:text-4xl">{t("heroTitle")}</h1>
            <p className="mt-3 text-muted">{t("heroSubtitle")}</p>
          </div>
          <Hero cities={cities} neighborhoods={neighborhoods} />
        </Container>
      </section>

      <PropertyTypeShortcuts />
      <FeaturedProperties locale={appLocale} />
      <LatestProperties locale={appLocale} />
      <BrowseByCity locale={appLocale} />
      <SellCta />
      <FeaturedAgents />
      <WhyChooseUs />
      <Testimonials locale={appLocale} />
      <GuidesPreview locale={appLocale} />
    </>
  );
}
