import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { redirect_to } = await searchParams;

  const t = await getTranslations("auth");
  const isSafeRedirect = redirect_to && redirect_to.startsWith("/") && !redirect_to.startsWith("//");
  const redirectTo = isSafeRedirect ? redirect_to : "/account";

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center font-serif text-2xl text-foreground sm:text-3xl">
          {t("loginTitle")}
        </h1>
        <div className="mt-8">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </Container>
  );
}
