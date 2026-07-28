import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("about") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, siteT] = await Promise.all([
    getTranslations("aboutPage"),
    getTranslations("site"),
  ]);

  return (
    <>
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <Container className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">{siteT("name")}</h1>
          <p className="mt-3 text-lg text-muted">{siteT("tagline")}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground">{siteT("description")}</p>
        </Container>
      </section>

      <WhyChooseUs />

      <section className="pb-16">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-xl text-foreground">{t("ctaTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/agents"
              className="flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {t("ctaAgents")}
            </Link>
            <Link
              href="/properties"
              className="flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-accent"
            >
              {t("ctaProperties")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
