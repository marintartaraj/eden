import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

// not-found.js accepts no props in this Next.js version — the locale comes
// from next-intl's own request-scoped config (i18n/request.ts), not params.
export default async function NotFound() {
  const t = await getTranslations("errorPages");

  return (
    <Container className="py-16 text-center">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("notFoundTitle")}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("backHome")}
      </Link>
    </Container>
  );
}
