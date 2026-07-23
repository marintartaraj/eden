import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/property/Breadcrumbs";
import { Gallery } from "@/components/property/Gallery";
import { VideoSection } from "@/components/property/VideoSection";
import { FloorPlansSection } from "@/components/property/FloorPlansSection";
import { SpecsTable } from "@/components/property/SpecsTable";
import { AmenitiesList } from "@/components/property/AmenitiesList";
import { LocationSection } from "@/components/property/LocationSection";
import { AgentCard } from "@/components/property/AgentCard";
import { InquiryForm } from "@/components/property/InquiryForm";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { ShareButton } from "@/components/property/ShareButton";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { RecentlyViewedTracker } from "@/components/property/RecentlyViewedTracker";
import { RecentlyViewedSection } from "@/components/property/RecentlyViewedSection";
import { getPropertyBySlug, getSimilarProperties } from "@/lib/data/properties";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const appLocale = locale as AppLocale;
  const title = localize(property.title_sq, property.title_en, appLocale);
  const description = localize(property.description_sq ?? "", property.description_en, appLocale);

  return { title, description: description || undefined };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [t, detailT, similarProperties] = await Promise.all([
    getTranslations("property"),
    getTranslations("detail"),
    getSimilarProperties(property),
  ]);

  const title = localize(property.title_sq, property.title_en, appLocale);
  const description = localize(property.description_sq ?? "", property.description_en, appLocale);
  const cityName = property.city
    ? localize(property.city.name_sq, property.city.name_en, appLocale)
    : null;
  const neighborhoodName = property.neighborhood
    ? localize(property.neighborhood.name_sq, property.neighborhood.name_en, appLocale)
    : null;
  const location = [neighborhoodName, cityName].filter(Boolean).join(", ");
  const coverImage = property.images.find((img) => img.isCover) ?? property.images[0];

  return (
    <Container className="py-8 sm:py-12">
      <RecentlyViewedTracker
        item={{
          id: property.id,
          slug: property.slug,
          titleSq: property.title_sq,
          titleEn: property.title_en,
          price: property.price,
          currency: property.currency,
          pricePeriod: property.price_period,
          purpose: property.purpose,
          coverImageUrl: coverImage?.url ?? null,
          cityNameSq: property.city?.name_sq ?? null,
          cityNameEn: property.city?.name_en ?? null,
          neighborhoodNameSq: property.neighborhood?.name_sq ?? null,
          neighborhoodNameEn: property.neighborhood?.name_en ?? null,
          grossArea: property.gross_area,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          referenceCode: property.reference_code,
        }}
      />

      <Breadcrumbs cityName={cityName} title={title} />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
              {property.purpose === "sale" ? t("badgeSale") : t("badgeRent")}
            </span>
            {property.is_exclusive ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {t("exclusive")}
              </span>
            ) : (
              property.is_featured && (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {t("featured")}
                </span>
              )
            )}
          </div>
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {location}
            {property.reference_code && ` · ${t("reference")}: ${property.reference_code}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-11 items-center rounded-full border border-border px-1">
            <FavoriteButton propertyId={property.id} label={t("saveProperty")} />
          </div>
          <ShareButton title={title} />
        </div>
      </div>

      <div className="mt-6">
        <Gallery images={property.images} title={title} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-10">
          <SpecsTable property={property} locale={appLocale} />

          {description && (
            <section>
              <h2 className="mb-4 font-serif text-xl text-foreground">{detailT("description")}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {description}
              </p>
            </section>
          )}

          <AmenitiesList amenities={property.amenities} locale={appLocale} />
          <VideoSection videos={property.videos} />
          <FloorPlansSection floorPlans={property.floorPlans} />
          <LocationSection property={property} locale={appLocale} />
          <MortgageCalculator price={property.price} currency={property.currency} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-serif text-2xl text-foreground">
              {formatPrice(property.price, property.currency, appLocale, property.price_period)}
            </p>
          </div>
          {property.agent && <AgentCard agent={property.agent} />}
          <InquiryForm propertyId={property.id} />
        </div>
      </div>

      {similarProperties.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl text-foreground">{detailT("similarProperties")}</h2>
          <PropertyGrid properties={similarProperties} locale={appLocale} />
        </section>
      )}

      <div className="mt-16">
        <RecentlyViewedSection excludeId={property.id} />
      </div>
    </Container>
  );
}
