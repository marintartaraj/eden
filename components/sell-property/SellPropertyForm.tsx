"use client";

import { useState } from "react";
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
import type { Database } from "@/types/supabase";

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
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
}) {
  const t = useTranslations("sellProperty");
  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [submissionId] = useState(() => crypto.randomUUID());

  const methods = useForm<PropertySubmissionInput, unknown, PropertySubmissionOutput>({
    resolver: zodResolver(propertySubmissionSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "sale",
      hasElevator: false,
      hasParking: false,
      photos: [],
      agreeToTerms: false,
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

  async function onSubmit(values: PropertySubmissionOutput) {
    setSubmitState("submitting");
    const result = await submitPropertyListing(values);
    setSubmitState(result.success ? "success" : "error");
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <h2 className="font-serif text-xl text-foreground">{t("success.title")}</h2>
        <p className="max-w-md text-sm text-muted">{t("success.body")}</p>
        <Link
          href="/"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("success.backHome")}
        </Link>
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
        {steps[step]}

        {submitState === "error" && (
          <p className="mt-4 text-sm text-danger">{t("submitError")}</p>
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
            <Button type="submit" disabled={submitState === "submitting"}>
              {submitState === "submitting" ? t("submitting") : t("submit")}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
