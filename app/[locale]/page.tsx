import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/home/Hero";
import { StatsStrip } from "@/components/home/StatsStrip";
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
import { getActivePropertyCount } from "@/lib/data/properties";
import { getAllAgents } from "@/lib/data/agents";
import type { AppLocale } from "@/i18n/routing";

// Full-bleed hero backdrop — placeholder architecture photo until Eden
// supplies real listing/office photography to swap in here.
const HERO_IMAGE =
  "https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=1600";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  // Overrides the root layout's default title with the homepage's own —
  // `absolute` bypasses the layout's `%s · Eden` template so this renders
  // exactly as written, not "Find your ideal home in Albania · Eden".
  return {
    title: { absolute: `${t("name")} — ${t("tagline")}` },
    description: t("description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, cities, neighborhoods, listingCount, agents] = await Promise.all([
    getTranslations("home"),
    getCities(),
    getNeighborhoods(),
    getActivePropertyCount(),
    getAllAgents(),
  ]);

  return (
    <>
      <section
        className="relative flex min-h-[85vh] items-end bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10,9,8,.42) 0%, rgba(8,7,6,.85) 100%), url('${HERO_IMAGE}')`,
        }}
      >
        <Container className="w-full pb-16 pt-28 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:pb-20">
          <span className="eyebrow block !text-accent-light">{t("heroEyebrow")}</span>
          <h1 className="mt-5 max-w-2xl font-serif text-4xl font-semibold leading-[1.08] text-background sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-md font-label text-base leading-relaxed text-background/85">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10">
            <Hero cities={cities} neighborhoods={neighborhoods} />
          </div>
        </Container>
      </section>

      <StatsStrip listings={listingCount} cities={cities.length} agents={agents.length} />

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
