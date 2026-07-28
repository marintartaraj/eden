import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { getMyAgentStats } from "@/lib/data/agent-analytics";

export default async function AgentAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, statusT, leadStatusT, stats] = await Promise.all([
    getTranslations("agentAnalytics"),
    getTranslations("agentProperties.status"),
    getTranslations("agentLeads.status"),
    getMyAgentStats(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AgentNav />

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">
            {t("propertiesTitle", { count: stats.totalProperties })}
          </h2>
          <div className="flex flex-col gap-2">
            {Object.entries(stats.propertiesByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="text-foreground">{statusT(status)}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg text-foreground">
            {t("leadsTitle", { count: stats.totalLeads })}
          </h2>
          <div className="flex flex-col gap-2">
            {Object.entries(stats.leadsByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="text-foreground">{leadStatusT(status)}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
