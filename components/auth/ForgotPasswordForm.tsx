"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/actions/auth";
import type { AppLocale } from "@/i18n/routing";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as AppLocale;
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    await requestPasswordReset(values, locale);
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-medium text-foreground">{t("checkEmailTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("resetEmailSentBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <Input type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-danger">{t("emailError")}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("sending") : t("sendResetLink")}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-foreground underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
