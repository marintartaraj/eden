import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { AgentDirectoryForm } from "@/components/admin/AgentDirectoryForm";

export default async function NewAdminAgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("adminAgents");

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("newAgent")}</h1>
      <AdminNav />

      <div className="mt-8 max-w-2xl">
        <AgentDirectoryForm users={[]} />
      </div>
    </Container>
  );
}
