"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AgentNav() {
  const t = useTranslations("agentDashboard");
  const pathname = usePathname();

  const links = [
    { href: "/agent", label: t("navOverview") },
    { href: "/agent/properties", label: t("navProperties") },
    { href: "/agent/inquiries", label: t("navInquiries") },
    { href: "/agent/viewings", label: t("navViewings") },
    { href: "/agent/follow-ups", label: t("navFollowUps") },
    { href: "/agent/analytics", label: t("navAnalytics") },
  ];

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-6">
      {links.map((link) => {
        const active = link.href === "/agent" ? pathname === link.href : pathname.startsWith(link.href);
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
