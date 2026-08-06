"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { VIEW_MODE_STORAGE_KEY } from "./ViewToggle";

/**
 * Restores a returning visitor's last-used grid/list/map view when they
 * land on a properties listing with no explicit `?view=` param — without
 * this, the view always resets to grid on a fresh navigation (`view` is
 * derived purely from the URL, defaulting to "grid" whenever absent).
 * Reads `useSearchParams()` directly (not the already-parsed/defaulted
 * `PropertiesQuery`) specifically to distinguish "no `view` param at all"
 * from "explicitly `?view=grid`".
 */
export function ViewModeRestorer({ basePath }: { basePath: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.has("view")) return;

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    } catch {
      return;
    }
    if (stored !== "list" && stored !== "map") return;

    const params = new URLSearchParams(searchParams);
    params.set("view", stored);
    router.replace(`${basePath}?${params.toString()}`);
  }, [searchParams, basePath, router]);

  return null;
}
