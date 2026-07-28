import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

export default async function AccessDeniedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("accessDenied");

  return (
    <Container className="py-16 text-center">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("backHome")}
      </Link>
    </Container>
  );
}
