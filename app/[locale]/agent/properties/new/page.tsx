import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { AgentPropertyForm } from "@/components/agent/AgentPropertyForm";
import { getCities, getNeighborhoods } from "@/lib/data/locations";

export default async function NewAgentPropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cities, neighborhoods] = await Promise.all([
    getTranslations("agentProperties"),
    getCities(),
    getNeighborhoods(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("newProperty")}</h1>
      <AgentNav />
      <div className="mt-8 max-w-3xl">
        <AgentPropertyForm cities={cities} neighborhoods={neighborhoods} />
      </div>
    </Container>
  );
}
