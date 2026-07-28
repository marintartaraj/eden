"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/auth";
import { updatePassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setErrorMessage(null);
    const result = await updatePassword(values);
    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setErrorMessage(result.message ?? t("resetPasswordError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <Input type="password" placeholder={t("newPasswordPlaceholder")} {...register("password")} />
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

      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("saveNewPassword")}
      </Button>
    </form>
  );
}
