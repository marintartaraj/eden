import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { FOCUS_RING } from "@/lib/utils";

const FOOTER_LINK_CLASS = `rounded-sm text-muted hover:text-foreground ${FOCUS_RING}`;

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
          <Link
            href="/contact"
            className={`mt-4 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent-foreground hover:text-accent-foreground ${FOCUS_RING}`}
          >
            {t("footer.contactCta")}
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-medium text-foreground">
            {t("footer.explore")}
          </span>
          <Link href="/properties" className={FOOTER_LINK_CLASS}>
            {t("nav.properties")}
          </Link>
          <Link href="/for-sale" className={FOOTER_LINK_CLASS}>
            {t("nav.forSale")}
          </Link>
          <Link href="/for-rent" className={FOOTER_LINK_CLASS}>
            {t("nav.forRent")}
          </Link>
          <Link
            href="/new-developments"
            className={FOOTER_LINK_CLASS}
          >
            {t("nav.newDevelopments")}
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-medium text-foreground">
            {t("footer.company")}
          </span>
          <Link href="/agents" className={FOOTER_LINK_CLASS}>
            {t("nav.agents")}
          </Link>
          <Link href="/about" className={FOOTER_LINK_CLASS}>
            {t("nav.about")}
          </Link>
          <Link href="/contact" className={FOOTER_LINK_CLASS}>
            {t("nav.contact")}
          </Link>
          <Link href="/privacy" className={FOOTER_LINK_CLASS}>
            {t("nav.privacy")}
          </Link>
          <Link href="/terms" className={FOOTER_LINK_CLASS}>
            {t("nav.terms")}
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
