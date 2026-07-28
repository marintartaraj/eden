import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Building2, Calendar, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { getNewDevelopmentBySlug } from "@/lib/data/new-developments";
import { getPropertiesByDevelopmentId } from "@/lib/data/properties";
import { localize } from "@/lib/localize";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const development = await getNewDevelopmentBySlug(slug);
  if (!development) return {};

  const appLocale = locale as AppLocale;
  const title = localize(development.name_sq, development.name_en, appLocale);
  const description = localize(
    development.description_sq ?? "",
    development.description_en,
    appLocale,
  );

  return {
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: development.cover_image ? [{ url: development.cover_image }] : undefined,
    },
  };
}

export default async function NewDevelopmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const development = await getNewDevelopmentBySlug(slug);
  if (!development) notFound();

  const [t, properties] = await Promise.all([
    getTranslations("newDevelopmentDetail"),
    getPropertiesByDevelopmentId(development.id),
  ]);

  const name = localize(development.name_sq, development.name_en, appLocale);
  const description = localize(
    development.description_sq ?? "",
    development.description_en,
    appLocale,
  );
  const cityName = development.city
    ? localize(development.city.name_sq, development.city.name_en, appLocale)
    : null;
  const neighborhoodName = development.neighborhood
    ? localize(development.neighborhood.name_sq, development.neighborhood.name_en, appLocale)
    : null;
  const location = [neighborhoodName, cityName].filter(Boolean).join(", ");

  return (
    <>
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-border">
        {development.cover_image && (
          <Image
            src={development.cover_image}
            alt={name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      <Container className="py-8 sm:py-12">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{name}</h1>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </span>
          )}
          {development.developer_name && (
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {development.developer_name}
            </span>
          )}
          {development.delivery_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t("delivery", { date: formatDate(development.delivery_date, appLocale) })}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground">{description}</p>
        )}

        <div className="mt-12">
          <h2 className="mb-6 font-serif text-xl text-foreground">{t("listingsTitle")}</h2>
          {properties.length > 0 ? (
            <PropertyGrid properties={properties} locale={appLocale} />
          ) : (
            <p className="text-sm text-muted">{t("noListings")}</p>
          )}
        </div>
      </Container>
    </>
  );
}
