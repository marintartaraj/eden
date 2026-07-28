import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { NewDevelopmentGrid } from "@/components/new-developments/NewDevelopmentGrid";
import { getAllNewDevelopments } from "@/lib/data/new-developments";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("newDevelopments") };
}

export default async function NewDevelopmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, developments] = await Promise.all([
    getTranslations("newDevelopmentsPage"),
    getAllNewDevelopments(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        {developments.length > 0 ? (
          <NewDevelopmentGrid developments={developments} locale={appLocale} priorityCount={3} />
        ) : (
          <p className="text-sm text-muted">{t("empty")}</p>
        )}
      </div>
    </Container>
  );
}
