import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { getPlatformStats } from "@/lib/data/admin-analytics";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, stats] = await Promise.all([getTranslations("adminDashboard"), getPlatformStats()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AdminNav />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.submissionsNeedingReview}</p>
          <p className="mt-1 text-sm text-muted">{t("statSubmissionsNeedingReview")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.totalProperties}</p>
          <p className="mt-1 text-sm text-muted">{t("statTotalProperties")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.activeProperties}</p>
          <p className="mt-1 text-sm text-muted">{t("statActiveProperties")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.totalUsers}</p>
          <p className="mt-1 text-sm text-muted">{t("statTotalUsers")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-2xl font-semibold text-foreground">{stats.totalAgents}</p>
          <p className="mt-1 text-sm text-muted">{t("statTotalAgents")}</p>
        </div>
      </div>
    </Container>
  );
}
