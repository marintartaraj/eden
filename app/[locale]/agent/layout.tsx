import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { AppLocale } from "@/i18n/routing";

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const appLocale = locale as AppLocale;
  const current = await getCurrentUser();

  if (!current) {
    return redirect({
      href: { pathname: "/login", query: { redirect_to: "/agent" } },
      locale: appLocale,
    });
  }
  if (current.profile.account_status !== "active") {
    return redirect({ href: "/account-suspended", locale: appLocale });
  }
  if (current.profile.role !== "agent" && current.profile.role !== "admin") {
    return redirect({ href: "/access-denied", locale: appLocale });
  }

  return <>{children}</>;
}
