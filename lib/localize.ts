import type { AppLocale } from "@/i18n/routing";

/** Picks the English field when the locale is "en" and it's populated, else falls back to Albanian. */
export function localize(
  sq: string,
  en: string | null | undefined,
  locale: AppLocale,
): string {
  return locale === "en" && en ? en : sq;
}
