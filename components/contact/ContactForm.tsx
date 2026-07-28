"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { submitInquiry } from "@/lib/actions/inquiry";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

export function ContactForm() {
  const t = useTranslations("detail.inquiry");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");

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
    const result = await submitInquiry(null, values, turnstileToken);
    if (result.success) {
      setStatus("success");
      reset({ type: "general", name: "", email: "", phone: "", message: "", honeypot: "" });
    } else {
      setStatus("error");
    }
  }

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
        <Input placeholder={t("namePlaceholder")} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-danger">{t("nameError")}</p>}
      </div>

      <div>
        <Input type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-danger">{t("emailError")}</p>}
      </div>

      <Input type="tel" placeholder={t("phonePlaceholder")} {...register("phone")} />

      <textarea
        placeholder={t("messagePlaceholder")}
        rows={5}
        {...register("message")}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />

      <HoneypotField register={register} name="honeypot" />
      <TurnstileWidget onVerify={setTurnstileToken} />

      {status === "error" && <p className="text-xs text-danger">{t("errorMessage")}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
