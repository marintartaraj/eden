"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { importLocalFavorites } from "@/lib/actions/favorites";
import { cn, FOCUS_RING } from "@/lib/utils";

const DISMISSED_KEY = "eden:dismissedImportFavoritesBanner";

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function ImportFavoritesBanner() {
  const t = useTranslations("account");
  const { favorites, clearFavorites } = useFavorites();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  // Safe as a lazy initializer (not an effect): `useFavorites()`'s server
  // snapshot is always `[]`, so this component always renders `null`
  // during SSR regardless of `dismissed` — there's no client/server output
  // to mismatch, since the branch that reads `dismissed` is never reached
  // server-side in the first place.
  const [dismissed, setDismissed] = useState(readDismissed);

  if (favorites.length === 0 || dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Best-effort; the dismissal still applies for this page view.
    }
  }

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          className={cn(
            "flex h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
            FOCUS_RING,
          )}
        >
          {importing ? t("importing") : t("importFavorites")}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("dismissImportBanner")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground",
            FOCUS_RING,
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
