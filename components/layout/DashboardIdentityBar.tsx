import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function DashboardIdentityBar({
  namespace,
  name,
  role,
}: {
  namespace: "adminDashboard" | "agentDashboard";
  name: string;
  role: "admin" | "agent";
}) {
  const t = await getTranslations(namespace);
  const rolesT = await getTranslations("adminUsers.roles");

  return (
    <div className="border-b border-border bg-card">
      <Container className="flex items-center justify-between gap-3 py-2 text-sm text-muted">
        <span>{t("loggedInAs", { name })}</span>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {rolesT(role)}
        </span>
      </Container>
    </div>
  );
}
