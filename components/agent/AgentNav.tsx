import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function AgentNav() {
  const t = await getTranslations("agentDashboard");

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
