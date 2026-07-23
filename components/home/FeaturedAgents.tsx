import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { getFeaturedAgents } from "@/lib/data/agents";

export async function FeaturedAgents() {
  const [t, agents] = await Promise.all([getTranslations("home"), getFeaturedAgents(4)]);

  if (agents.length === 0) return null;

  return (
    <section className="bg-card py-16">
      <Container>
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">{t("agentsTitle")}</h2>
          <p className="mt-2 text-muted">{t("agentsSubtitle")}</p>
        </div>

        <AgentGrid agents={agents} />
      </Container>
    </section>
  );
}
