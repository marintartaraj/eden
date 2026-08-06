import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("resetPasswordTitle") };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  // The recovery link exchanges its code for a session in
  // app/auth/callback/route.ts before redirecting here — a visitor who
  // lands on this page without that (a stale bookmark, an already-used or
  // expired link, or a session that's since logged out) would otherwise see
  // a fully working-looking form that fails confusingly on submit.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center font-serif text-2xl text-foreground sm:text-3xl">
          {t("resetPasswordTitle")}
        </h1>
        <div className="mt-8">
          {user ? (
            <ResetPasswordForm />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
              <p className="font-medium text-foreground">{t("resetLinkInvalidTitle")}</p>
              <p className="text-sm text-muted">{t("resetLinkInvalidBody")}</p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                {t("requestNewLink")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
