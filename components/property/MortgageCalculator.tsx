"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export function MortgageCalculator({ price, currency }: { price: number; currency: string }) {
  const t = useTranslations("detail.mortgage");
  const locale = useLocale() as AppLocale;

  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [years, setYears] = useState(20);

  const monthlyPayment = useMemo(() => {
    const principal = price * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  }, [price, downPaymentPercent, interestRate, years]);

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("title")}</h2>
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-muted">
            {t("downPayment")} ({downPaymentPercent}%)
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={downPaymentPercent}
              onChange={(event) => setDownPaymentPercent(Number(event.target.value))}
              className="accent-accent"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            {t("interestRate")} ({interestRate}%)
            <input
              type="range"
              min={1}
              max={10}
              step={0.1}
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
              className="accent-accent"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            {t("loanTerm")} ({years} {t("years")})
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={years}
              onChange={(event) => setYears(Number(event.target.value))}
              className="accent-accent"
            />
          </label>
        </div>

        <div className="rounded-xl bg-background p-4 text-center">
          <p className="text-sm text-muted">{t("estimatedPayment")}</p>
          <p className="mt-1 font-serif text-2xl text-foreground">
            {formatPrice(Math.round(monthlyPayment), currency, locale, "month")}
          </p>
        </div>

        <p className="text-xs text-muted">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
