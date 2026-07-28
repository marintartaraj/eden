import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("contact") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contactPage");

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>
      <div className="mx-auto mt-8 max-w-lg">
        <ContactForm />
      </div>
    </Container>
  );
}
