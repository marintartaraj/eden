"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { submitInquiry } from "@/lib/actions/inquiry";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { TurnstileWidget, TURNSTILE_ENABLED } from "@/components/ui/TurnstileWidget";
import type { SubmitFailureReason } from "@/lib/actions/result";

export function ContactForm() {
  const t = useTranslations("detail.inquiry");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [failureReason, setFailureReason] = useState<SubmitFailureReason | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      type: "general",
      name: "",
      email: "",
      phone: "",
      message: "",
      honeypot: "",
    },
  });

  async function onSubmit(values: InquiryFormValues) {
    setStatus("idle");
    setFailureReason(null);
    const result = await submitInquiry(null, values, turnstileToken);
    if (result.success) {
      setStatus("success");
      reset({ type: "general", name: "", email: "", phone: "", message: "", honeypot: "" });
    } else {
      setStatus("error");
      setFailureReason(result.reason);
    }
  }

  const errorMessage = {
    validation_error: t("errorValidation"),
    verification_failed: t("errorVerification"),
    verification_unavailable: t("errorVerificationUnavailable"),
    rate_limited: t("errorRateLimited"),
    database_error: t("errorMessage"),
    server_error: t("errorMessage"),
  } satisfies Record<SubmitFailureReason, string>;

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-medium text-foreground">{t("successTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
    >
      <div>
        <label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("nameLabel")}
        </label>
        <Input id={nameId} autoComplete="name" placeholder={t("namePlaceholder")} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-danger">{t("nameError")}</p>}
      </div>

      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("emailLabel")}
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
        <label htmlFor={phoneId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("phoneLabel")}
        </label>
        <Input
          id={phoneId}
          type="tel"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          {...register("phone")}
        />
      </div>

      <div>
        <label htmlFor={messageId} className="mb-1.5 block text-sm font-medium text-foreground">
          {t("messageLabel")}
        </label>
        <textarea
          id={messageId}
          placeholder={t("messagePlaceholder")}
          rows={5}
          {...register("message")}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <HoneypotField register={register} name="honeypot" />
      <TurnstileWidget onVerify={setTurnstileToken} />

      {status === "error" && failureReason && (
        <p className="text-xs text-danger">{errorMessage[failureReason]}</p>
      )}

      <Button type="submit" disabled={isSubmitting || (TURNSTILE_ENABLED && !turnstileToken)}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
