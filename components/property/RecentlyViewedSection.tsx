"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRecentlyViewed } from "@/lib/hooks/useRecentlyViewed";
import { RecentlyViewedCard } from "./RecentlyViewedCard";
import type { AppLocale } from "@/i18n/routing";

export function RecentlyViewedSection({ excludeId }: { excludeId: string }) {
  const t = useTranslations("detail");
  const locale = useLocale() as AppLocale;
  const { items } = useRecentlyViewed();
  const filtered = items.filter((item) => item.id !== excludeId);

  if (filtered.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("recentlyViewed")}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {filtered.map((item) => (
          <RecentlyViewedCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </section>
  );
}
