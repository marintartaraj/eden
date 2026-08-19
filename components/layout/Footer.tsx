import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { FOCUS_RING } from "@/lib/utils";

const FOOTER_LINK_CLASS = `rounded-sm text-sm text-ink-muted hover:text-ink-foreground ${FOCUS_RING}`;
const FOOTER_HEAD_CLASS = "eyebrow mb-4 !text-accent-light";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-ink-border bg-ink text-ink-foreground">
      <Container className="grid gap-10 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-2.5 font-serif text-xl font-semibold text-ink-foreground">
            <span className="flex h-8 w-8 rotate-45 items-center justify-center border border-accent-light text-sm text-accent-light">
              <span className="-rotate-45 font-serif font-bold">E</span>
            </span>
            {t("site.name")}
          </span>
          <p className="mt-3 max-w-sm text-sm text-ink-muted">
            {t("site.description")}
          </p>
          <Link
            href="/contact"
            className={`mt-4 inline-flex h-10 items-center border border-ink-border px-4 text-sm font-medium text-ink-foreground transition-colors hover:border-accent-light hover:text-accent-light ${FOCUS_RING}`}
          >
            {t("footer.contactCta")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className={FOOTER_HEAD_CLASS}>{t("footer.explore")}</span>
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

        <div className="flex flex-col gap-3">
          <span className={FOOTER_HEAD_CLASS}>{t("footer.company")}</span>
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

      <div className="border-t border-ink-border py-4">
        <Container>
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {t("site.name")}. {t("footer.rights")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
