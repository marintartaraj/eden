"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";
import { signIn } from "@/lib/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setErrorMessage(null);
    const result = await signIn(values);
    if (result.success) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setErrorMessage(t("loginError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("emailPlaceholder")}
        </label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{t("emailError")}</p>}
      </div>

      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("passwordPlaceholder")}
        </label>
        <PasswordInput
          id={passwordId}
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          showLabel={common("showPassword")}
          hideLabel={common("hidePassword")}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{t("passwordError")}</p>}
      </div>

      <Link href="/forgot-password" className="self-end text-xs text-muted hover:text-foreground">
        {t("forgotPasswordLink")}
      </Link>

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("loggingIn") : t("login")}
      </Button>

      <p className="text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-foreground underline">
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
