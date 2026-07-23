import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PropertiesResults } from "@/components/property/PropertiesResults";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("forSale") };
}

export default async function ForSalePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;

  return (
    <PropertiesResults
      searchParams={raw}
      locale={locale as AppLocale}
      basePath="/for-sale"
      forcedPurpose="sale"
    />
  );
}
