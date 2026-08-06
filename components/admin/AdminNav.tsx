"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const t = useTranslations("adminDashboard");
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: t("navOverview") },
    { href: "/admin/submissions", label: t("navSubmissions") },
    { href: "/admin/properties", label: t("navProperties") },
    { href: "/admin/inquiries", label: t("navInquiries") },
    { href: "/admin/viewings", label: t("navViewings") },
    { href: "/admin/users", label: t("navUsers") },
    { href: "/admin/agents", label: t("navAgents") },
  ];

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-6">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
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
