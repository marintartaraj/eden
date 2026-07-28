import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function AdminNav() {
  const t = await getTranslations("adminDashboard");

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
