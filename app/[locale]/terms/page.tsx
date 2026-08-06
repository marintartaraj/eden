import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

const LAST_UPDATED = "2026-07-01";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("terms") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("termsPage");

  const sections = [
    { title: t("section1Title"), body: t("section1Body") },
    { title: t("section2Title"), body: t("section2Body") },
    { title: t("section3Title"), body: t("section3Body") },
    { title: t("section4Title"), body: t("section4Body") },
    { title: t("section5Title"), body: t("section5Body") },
    { title: t("section6Title"), body: t("section6Body") },
    { title: t("section7Title"), body: t("section7Body") },
    { title: t("section8Title"), body: t("section8Body") },
  ];

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">
          {t("lastUpdated", { date: formatDate(LAST_UPDATED, locale as AppLocale) })}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-foreground">{t("intro")}</p>

        <div className="mt-8 flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-lg text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-serif text-lg text-foreground">{t("section9Title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t("section9Body")}{" "}
              <Link href="/contact" className="text-foreground underline">
                {t("contactPageLinkLabel")}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
