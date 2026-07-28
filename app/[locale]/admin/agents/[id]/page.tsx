import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { AgentDirectoryForm } from "@/components/admin/AgentDirectoryForm";
import { getAgentByIdForAdmin } from "@/lib/data/admin-agents";
import { getAllUsers } from "@/lib/data/admin-users";

export default async function EditAdminAgentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const agent = await getAgentByIdForAdmin(id);
  if (!agent) notFound();

  const [t, users] = await Promise.all([getTranslations("adminAgents"), getAllUsers()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("editAgent")}</h1>
      <AdminNav />

      <div className="mt-8 max-w-2xl">
        <AgentDirectoryForm agent={agent} users={users} />
      </div>
    </Container>
  );
}
