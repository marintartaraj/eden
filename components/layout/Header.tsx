import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { AccountMenu } from "./AccountMenu";
import { HeaderNavLinks } from "./HeaderNavLinks";
import type { CurrentUser } from "@/lib/auth/session";

export async function Header({ current }: { current: CurrentUser | null }) {
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

  const isAgentOrAdmin = current?.profile.role === "agent" || current?.profile.role === "admin";
  const isAdmin = current?.profile.role === "admin";

  const authLinks = current
    ? [
        ...(isAdmin ? [{ href: "/admin", label: t("adminDashboard") }] : []),
        ...(isAgentOrAdmin ? [{ href: "/agent", label: t("agentDashboard") }] : []),
        { href: "/account", label: t("myAccount") },
      ]
    : [
        { href: "/login", label: t("login") },
        { href: "/signup", label: t("signUp") },
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

        <HeaderNavLinks links={links} />

        <div className="flex items-center gap-3">
          {/*
            Role/account links (My Account, Admin/Agent Dashboard, Log Out)
            collapse into a single dropdown for authenticated users instead
            of sitting as flat top-level items — that flat-item approach is
            what made this row wrap onto two lines for admin/agent accounts
            even at 1920px (the item count grew with role, the row didn't).
            Logged-out visitors only ever have two items (Log In/Sign Up),
            which never overflows, so those stay as plain links.
          */}
          {current ? (
            <div className="hidden lg:block">
              <AccountMenu menuLabel={t("accountMenu")} links={authLinks} logoutLabel={t("logout")} />
            </div>
          ) : (
            <div className="hidden items-center gap-4 lg:flex">
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <LocaleSwitcher />
          <Link
            href="/sell-property"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("sellProperty")}
          </Link>
          <MobileNav
            links={links}
            authLinks={authLinks}
            isLoggedIn={Boolean(current)}
            sellLabel={t("sellProperty")}
            logoutLabel={t("logout")}
            menuLabel={common("menu")}
            closeLabel={common("close")}
          />
        </div>
      </Container>
    </header>
  );
}
