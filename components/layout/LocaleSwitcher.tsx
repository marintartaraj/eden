"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  // next-intl's usePathname() strips the locale prefix but never included
  // the query string in the first place (it wraps Next.js's own
  // usePathname(), which never does either) — switching locale on, say,
  // /properties?bedrooms=3 silently dropped the filters unless the query
  // string is preserved explicitly here.
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-1 text-xs font-medium">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-current={l === locale ? "true" : undefined}
          onClick={() => router.replace({ pathname, query }, { locale: l })}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            l === locale
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
