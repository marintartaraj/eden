import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "@/components/auth/SignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signUpTitle") };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center font-serif text-2xl text-foreground sm:text-3xl">
          {t("signUpTitle")}
        </h1>
        <div className="mt-8">
          <SignupForm />
        </div>
      </div>
    </Container>
  );
}
