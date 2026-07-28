import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { LeadList } from "@/components/agent/LeadList";
import { getMyAssignedLeads } from "@/lib/data/agent-leads";

export default async function AgentInquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, leads] = await Promise.all([
    getTranslations("agentLeads"),
    getMyAssignedLeads("general"),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("inquiriesTitle")}</h1>
      <AgentNav />
      <div className="mt-8">
        <LeadList leads={leads} />
      </div>
    </Container>
  );
}
