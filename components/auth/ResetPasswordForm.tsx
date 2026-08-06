"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import { updatePassword, type AuthErrorCode } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const errorMessageByCode = {
    email_taken: t("resetPasswordError"),
    weak_password: t("errorWeakPassword"),
    same_password: t("errorSamePassword"),
    session_expired: t("errorSessionExpired"),
    unknown: t("resetPasswordError"),
  } satisfies Record<AuthErrorCode, string>;

  async function onSubmit(values: ResetPasswordValues) {
    setErrorMessage(null);
    const result = await updatePassword(values);
    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setErrorMessage(result.code ? errorMessageByCode[result.code] : t("resetPasswordError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("newPasswordPlaceholder")}
        </label>
        <PasswordInput
          id={passwordId}
          autoComplete="new-password"
          placeholder={t("newPasswordPlaceholder")}
          showLabel={common("showPassword")}
          hideLabel={common("hidePassword")}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-danger">{t("passwordLengthError")}</p>}
      </div>

      <div>
        <label htmlFor={confirmPasswordId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("confirmPasswordPlaceholder")}
        </label>
        <PasswordInput
          id={confirmPasswordId}
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          showLabel={common("showPassword")}
          hideLabel={common("hidePassword")}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{t("confirmPasswordError")}</p>
        )}
      </div>

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("saveNewPassword")}
      </Button>
    </form>
  );
}
