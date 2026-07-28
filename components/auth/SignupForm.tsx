"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import { signUp } from "@/lib/actions/auth";
import type { AppLocale } from "@/i18n/routing";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

export function SignupForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as AppLocale;
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", honeypot: "" },
  });

  async function onSubmit(values: SignUpValues) {
    setStatus("idle");
    setErrorMessage(null);
    const result = await signUp(values, locale, turnstileToken);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.message ?? t("signupError"));
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-medium text-foreground">{t("checkEmailTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("checkEmailBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <Input placeholder={t("fullNamePlaceholder")} {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{t("fullNameError")}</p>}
      </div>

      <div>
        <Input type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-danger">{t("emailError")}</p>}
      </div>

      <div>
        <Input type="password" placeholder={t("passwordPlaceholder")} {...register("password")} />
        {errors.password && <p className="mt-1 text-xs text-danger">{t("passwordLengthError")}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{t("confirmPasswordError")}</p>
        )}
      </div>

      <HoneypotField register={register} name="honeypot" />
      <TurnstileWidget onVerify={setTurnstileToken} />

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("signingUp") : t("signUp")}
      </Button>

      <p className="text-center text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-foreground underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
