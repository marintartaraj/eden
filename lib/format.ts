import type { AppLocale } from "@/i18n/routing";

// price_period is an unconstrained `string | null` DB column (see
// types/supabase.ts) — every value written today is literally "month", but
// the function used to key off truthiness alone and always append "/mo",
// which would silently mislabel a future "week"/"year" value. Keying off
// the actual value (with no suffix at all for anything unrecognized) fails
// safe instead of failing wrong.
const PRICE_PERIOD_SUFFIXES: Record<string, { en: string; sq: string }> = {
  day: { en: "/day", sq: "/ditë" },
  week: { en: "/wk", sq: "/javë" },
  month: { en: "/mo", sq: "/muaj" },
  year: { en: "/yr", sq: "/vit" },
};

export function formatPrice(
  price: number,
  currency: string,
  locale: AppLocale,
  pricePeriod?: string | null,
) {
  const formatted = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  if (!pricePeriod) return formatted;
  const suffix = PRICE_PERIOD_SUFFIXES[pricePeriod];
  if (!suffix) return formatted;

  return `${formatted}${locale === "sq" ? suffix.sq : suffix.en}`;
}

export function formatArea(value: number, locale: AppLocale) {
  const formatted = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-US").format(value);
  return `${formatted} m²`;
}

// Month + year only — right for contexts where day-level precision would
// be noise (a "last updated" notice, a construction delivery estimate) but
// wrong for anything a user needs to actually distinguish by day (see
// formatDateWithDay below).
export function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(value));
}

// For timestamps a user needs to tell apart within the same month — when
// an inquiry/viewing was filed, when a submission was sent. formatDate's
// month+year-only precision is a real bug in these contexts: two requests
// made in the same month become indistinguishable.
export function formatDateWithDay(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
