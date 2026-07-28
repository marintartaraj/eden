"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { importLocalFavorites } from "@/lib/actions/favorites";

export function ImportFavoritesBanner() {
  const t = useTranslations("account");
  const { favorites, clearFavorites } = useFavorites();
  const router = useRouter();
  const [importing, setImporting] = useState(false);

  if (favorites.length === 0) return null;

  async function handleImport() {
    setImporting(true);
    const result = await importLocalFavorites(favorites);
    if (result.success) {
      clearFavorites();
      router.refresh();
    }
    setImporting(false);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-foreground">
        {t("importFavoritesPrompt", { count: favorites.length })}
      </p>
      <button
        type="button"
        onClick={handleImport}
        disabled={importing}
        className="flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {importing ? t("importing") : t("importFavorites")}
      </button>
    </div>
  );
}
