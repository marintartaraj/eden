import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function AccountNav() {
  const t = await getTranslations("account");

  const links = [
    { href: "/account", label: t("navOverview") },
    { href: "/favorites", label: t("navFavorites") },
    { href: "/account/saved-searches", label: t("navSavedSearches") },
    { href: "/account/inquiries", label: t("navInquiries") },
    { href: "/account/viewings", label: t("navViewings") },
    { href: "/account/submissions", label: t("navSubmissions") },
  ];

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
