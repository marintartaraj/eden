"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { Step1Purpose } from "./steps/Step1Purpose";
import { Step2TypeLocation } from "./steps/Step2TypeLocation";
import { Step3Characteristics } from "./steps/Step3Characteristics";
import { Step4Condition } from "./steps/Step4Condition";
import { Step5Price } from "./steps/Step5Price";
import { Step6Photos } from "./steps/Step6Photos";
import { Step7Contact } from "./steps/Step7Contact";
import { Step8Review } from "./steps/Step8Review";
import {
  propertySubmissionSchema,
  STEP_FIELDS,
  type PropertySubmissionInput,
  type PropertySubmissionOutput,
} from "@/lib/validations/property-submission";
import { submitPropertyListing } from "@/lib/actions/property-submission";
import { reserveSubmissionUploadToken } from "@/lib/actions/upload-token";
import type { Database } from "@/types/supabase";
import { HoneypotField } from "@/components/ui/HoneypotField";
import { TurnstileWidget, TURNSTILE_ENABLED } from "@/components/ui/TurnstileWidget";
import type { SubmitFailureReason } from "@/lib/actions/result";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

const TOTAL_STEPS = 8;
const STEP_KEYS = [
  "purpose",
  "typeLocation",
  "characteristics",
  "condition",
  "price",
  "photos",
  "contact",
  "review",
] as const;

export function SellPropertyForm({
  cities,
  neighborhoods,
  isAuthenticated,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("sellProperty");
  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [failureReason, setFailureReason] = useState<SubmitFailureReason | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Fetched once, up front — a plain client-generated UUID no longer
  // authorizes a storage upload on its own (see
  // 20260731100000_fix_anonymous_storage_upload_gap.sql), so the photo step
  // needs a real, rate-limited reservation token instead. Requested on
  // mount rather than on reaching step 6 so it's ready well before the user
  // gets there.
  useEffect(() => {
    reserveSubmissionUploadToken().then(setSubmissionId);
  }, []);

  const methods = useForm<PropertySubmissionInput, unknown, PropertySubmissionOutput>({
    resolver: zodResolver(propertySubmissionSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "sale",
      hasElevator: false,
      hasParking: false,
      photos: [],
      agreeToTerms: false,
      honeypot: "",
    },
  });

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await methods.trigger(fields);
    if (!valid) return;
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  // Moves focus and scroll to the new step on every Next/Back — skipped on
  // the wizard's own initial mount so it doesn't fight the browser's normal
  // page-load focus behavior (e.g. the Phase 7 skip-to-content link).
  // StepIndicator's `role="status"` label change covers the screen-reader
  // announcement; this covers sighted keyboard users, who'd otherwise stay
  // scrolled wherever the Next/Back button happened to be.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepContainerRef.current?.focus();
    stepContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function onSubmit(values: PropertySubmissionOutput) {
    setSubmitState("submitting");
    setFailureReason(null);
    const result = await submitPropertyListing(values, turnstileToken);
    if (result.success) {
      setSubmitState("success");
      setReference(result.reference ?? null);
    } else {
      setSubmitState("error");
      setFailureReason(result.reason);
    }
  }

  const submitErrorMessage = {
    validation_error: t("submitErrorValidation"),
    verification_failed: t("submitErrorVerification"),
    verification_unavailable: t("submitErrorVerificationUnavailable"),
    rate_limited: t("submitErrorRateLimited"),
    database_error: t("submitError"),
    server_error: t("submitError"),
  } satisfies Record<SubmitFailureReason, string>;

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <h2 className="font-serif text-xl text-foreground">{t("success.title")}</h2>
        <p className="max-w-md text-sm text-muted">{t("success.body")}</p>
        {reference && (
          <p className="mt-1 text-sm text-foreground">
            {t("success.referenceLabel")}{" "}
            <span className="font-mono font-medium">{reference}</span>
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {t("success.backHome")}
          </Link>
          {isAuthenticated && (
            <Link
              href="/account/submissions"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-accent"
            >
              {t("success.trackSubmission")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    <Step1Purpose key="1" />,
    <Step2TypeLocation key="2" cities={cities} neighborhoods={neighborhoods} />,
    <Step3Characteristics key="3" />,
    <Step4Condition key="4" />,
    <Step5Price key="5" />,
    <Step6Photos key="6" submissionId={submissionId} />,
    <Step7Contact key="7" />,
    <Step8Review key="8" cities={cities} neighborhoods={neighborhoods} />,
  ];

  return (
    <FormProvider {...methods}>
      <StepIndicator current={step} total={TOTAL_STEPS} label={t(`steps.${STEP_KEYS[step]}`)} />
      <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
        <div
          ref={stepContainerRef}
          tabIndex={-1}
          aria-label={t(`steps.${STEP_KEYS[step]}`)}
          className="focus:outline-none"
        >
          {steps[step]}
        </div>

        <HoneypotField register={methods.register} name="honeypot" />
        {step === TOTAL_STEPS - 1 && (
          <div className="mt-4">
            <TurnstileWidget onVerify={setTurnstileToken} />
          </div>
        )}

        {submitState === "error" && failureReason && (
          <p className="mt-4 text-sm text-danger">{submitErrorMessage[failureReason]}</p>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0}>
            {t("back")}
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" onClick={goNext}>
              {t("next")}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                submitState === "submitting" || (TURNSTILE_ENABLED && !turnstileToken)
              }
            >
              {submitState === "submitting" ? t("submitting") : t("submit")}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
