import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { SearchablePaginatedList } from "@/components/ui/SearchablePaginatedList";
import { Link } from "@/i18n/navigation";
import { getAllAgentsWithLinkStatus } from "@/lib/data/admin-agents";

export default async function AdminAgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, agents] = await Promise.all([getTranslations("adminAgents"), getAllAgentsWithLinkStatus()]);

  return (
    <Container className="py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
        <Link
          href="/admin/agents/new"
          className="flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("newAgent")}
        </Link>
      </div>
      <AdminNav />

      <div className="mt-8">
        <SearchablePaginatedList
          items={agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/admin/agents/${agent.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <p className="font-medium text-foreground">{agent.full_name}</p>
                <p className="text-sm text-muted">
                  {agent.linkedProfileName ? agent.linkedProfileName : t("unlinked")}
                </p>
              </div>
            </Link>
          ))}
          searchText={agents.map((agent) => agent.full_name)}
          searchPlaceholder={t("searchPlaceholder")}
          emptyMessage={t("empty")}
        />
      </div>
    </Container>
  );
}
