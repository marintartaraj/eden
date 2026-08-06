"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const EXACT_MATCH_HREFS = new Set(["/account", "/favorites"]);

export function AccountNav() {
  const t = useTranslations("account");
  const pathname = usePathname();

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
      {links.map((link) => {
        const active = EXACT_MATCH_HREFS.has(link.href)
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted hover:border-accent hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
