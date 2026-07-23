import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SellPropertyForm } from "@/components/sell-property/SellPropertyForm";
import { getCities, getNeighborhoods } from "@/lib/data/locations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("sellProperty") };
}

export default async function SellPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cities, neighborhoods] = await Promise.all([
    getTranslations("sellProperty"),
    getCities(),
    getNeighborhoods(),
  ]);

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("pageSubtitle")}</p>
      <div className="mt-8">
        <SellPropertyForm cities={cities} neighborhoods={neighborhoods} />
      </div>
    </Container>
  );
}
