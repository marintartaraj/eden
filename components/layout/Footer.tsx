import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-border bg-card">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <span className="font-serif text-xl font-semibold text-foreground">
            {t("site.name")}
          </span>
          <p className="mt-3 max-w-sm text-sm text-muted">
            {t("site.description")}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-medium text-foreground">
            {t("footer.explore")}
          </span>
          <Link href="/properties" className="text-muted hover:text-foreground">
            {t("nav.properties")}
          </Link>
          <Link href="/for-sale" className="text-muted hover:text-foreground">
            {t("nav.forSale")}
          </Link>
          <Link href="/for-rent" className="text-muted hover:text-foreground">
            {t("nav.forRent")}
          </Link>
          <Link
            href="/new-developments"
            className="text-muted hover:text-foreground"
          >
            {t("nav.newDevelopments")}
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-medium text-foreground">
            {t("footer.company")}
          </span>
          <Link href="/agents" className="text-muted hover:text-foreground">
            {t("nav.agents")}
          </Link>
          <Link href="/about" className="text-muted hover:text-foreground">
            {t("nav.about")}
          </Link>
          <Link href="/contact" className="text-muted hover:text-foreground">
            {t("nav.contact")}
          </Link>
        </div>
      </Container>

      <div className="border-t border-border py-4">
        <Container>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {t("site.name")}. {t("footer.rights")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
