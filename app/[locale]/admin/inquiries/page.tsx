import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { LeadList } from "@/components/agent/LeadList";
import { getAllLeads } from "@/lib/data/admin-leads";
import { assignLead } from "@/lib/actions/admin-leads";
import { getAllAgents } from "@/lib/data/agents";

export default async function AdminInquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, leads, agents] = await Promise.all([
    getTranslations("agentLeads"),
    getAllLeads("general"),
    getAllAgents(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("inquiriesTitle")}</h1>
      <AdminNav />
      <div className="mt-8">
        <LeadList leads={leads} agents={agents} onAssign={assignLead} />
      </div>
    </Container>
  );
}
