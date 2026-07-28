import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { SubmissionReviewPanel } from "@/components/admin/SubmissionReviewPanel";
import { getSubmissionByIdForAdmin } from "@/lib/data/admin-submissions";
import { getAllAgents } from "@/lib/data/agents";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const submission = await getSubmissionByIdForAdmin(id);
  if (!submission) notFound();

  const [t, agents] = await Promise.all([getTranslations("adminSubmissions"), getAllAgents()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("detailTitle")}</h1>
      <AdminNav />

      <div className="mt-8 max-w-2xl">
        <SubmissionReviewPanel submission={submission} agents={agents} />
      </div>
    </Container>
  );
}
