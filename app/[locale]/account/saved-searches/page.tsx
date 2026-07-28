import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { SavedSearchList } from "@/components/account/SavedSearchList";
import { getMySavedSearches } from "@/lib/data/saved-searches";

export default async function SavedSearchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, searches] = await Promise.all([
    getTranslations("savedSearches"),
    getMySavedSearches(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AccountNav />
      <div className="mt-8">
        <SavedSearchList searches={searches} />
      </div>
    </Container>
  );
}
