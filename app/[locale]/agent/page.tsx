import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { getMyAgentStats } from "@/lib/data/agent-analytics";

export default async function AgentDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, stats] = await Promise.all([getTranslations("agentDashboard"), getMyAgentStats()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AgentNav />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.totalProperties}</p>
          <p className="mt-1 text-sm text-muted">{t("statAssignedProperties")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.propertiesByStatus.active}</p>
          <p className="mt-1 text-sm text-muted">{t("statActiveProperties")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.totalLeads}</p>
          <p className="mt-1 text-sm text-muted">{t("statAssignedLeads")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.leadsByStatus.new}</p>
          <p className="mt-1 text-sm text-muted">{t("statNewLeads")}</p>
        </div>
      </div>
    </Container>
  );
}
