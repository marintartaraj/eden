"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { PropertyCardClient } from "./PropertyCardClient";
import type { PropertyListItem } from "@/lib/data/properties";
import type { AppLocale } from "@/i18n/routing";

export function FavoritesGrid({ locale }: { locale: AppLocale }) {
  const t = useTranslations("favorites");
  const commonT = useTranslations("common");
  const { favorites } = useFavorites();
  const [fetched, setFetched] = useState<PropertyListItem[] | null>(null);

  useEffect(() => {
    if (favorites.length === 0) return;

    let cancelled = false;
    fetch(`/api/properties?ids=${favorites.join(",")}`)
      .then((res) => res.json())
      .then((data: PropertyListItem[]) => {
        if (!cancelled) setFetched(data);
      });

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const properties = favorites.length === 0 ? [] : fetched;

  if (properties === null) {
    return <p className="text-sm text-muted">{commonT("loading")}</p>;
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-24 text-center">
        <p className="text-muted">{t("empty")}</p>
        <Link
          href="/properties"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("browseCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCardClient key={property.id} property={property} locale={locale} />
      ))}
    </div>
  );
}
