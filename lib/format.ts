import type { AppLocale } from "@/i18n/routing";

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

  const perMonth = locale === "sq" ? "/muaj" : "/mo";
  return `${formatted}${perMonth}`;
}

export function formatArea(value: number, locale: AppLocale) {
  const formatted = new Intl.NumberFormat(locale === "sq" ? "sq-AL" : "en-US").format(value);
  return `${formatted} m²`;
}
