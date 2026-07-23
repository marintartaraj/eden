import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { getAllAgents } from "@/lib/data/agents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("agents") };
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, agents] = await Promise.all([getTranslations("agentsPage"), getAllAgents()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-8">
        {agents.length > 0 ? (
          <AgentGrid agents={agents} />
        ) : (
          <p className="text-sm text-muted">{t("empty")}</p>
        )}
      </div>
    </Container>
  );
}
