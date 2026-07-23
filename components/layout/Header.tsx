import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const t = await getTranslations("nav");
  const common = await getTranslations("common");

  const links = [
    { href: "/", label: t("home") },
    { href: "/properties", label: t("properties") },
    { href: "/for-sale", label: t("forSale") },
    { href: "/for-rent", label: t("forRent") },
    { href: "/new-developments", label: t("newDevelopments") },
    { href: "/agents", label: t("agents") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-foreground"
        >
          Eden
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/sell-property"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("sellProperty")}
          </Link>
          <MobileNav
            links={links}
            sellLabel={t("sellProperty")}
            closeLabel={common("close")}
          />
        </div>
      </Container>
    </header>
  );
}
