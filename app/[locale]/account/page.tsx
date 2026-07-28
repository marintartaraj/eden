import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AccountNav } from "@/components/account/AccountNav";
import { ImportFavoritesBanner } from "@/components/account/ImportFavoritesBanner";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, current] = await Promise.all([getTranslations("account"), getCurrentUser()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <p className="mt-4 text-sm text-foreground">
        {t("signedInAs", { name: current?.profile.full_name || current?.user.email || "" })}
      </p>
      <p className="mt-1 text-sm text-muted">{t("roleLabel", { role: current?.profile.role ?? "" })}</p>

      <div className="mt-6">
        <LogoutButton
          label={t("logout")}
          className="flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-accent"
        />
      </div>

      <AccountNav />

      <ImportFavoritesBanner />
    </Container>
  );
}
