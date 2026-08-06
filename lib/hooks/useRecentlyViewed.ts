"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "eden:recently-viewed";
const CHANGE_EVENT = "eden:recently-viewed-changed";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  titleSq: string;
  titleEn: string | null;
  price: number;
  currency: string;
  pricePeriod: string | null;
  purpose: "sale" | "rent";
  coverImageUrl: string | null;
  cityNameSq: string | null;
  cityNameEn: string | null;
  neighborhoodNameSq: string | null;
  neighborhoodNameEn: string | null;
  grossArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  referenceCode: string | null;
  viewedAt: number;
};

function readItems(): RecentlyViewedItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

export function useRecentlyViewed() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const items = useMemo<RecentlyViewedItem[]>(() => {
    try {
      return JSON.parse(raw) as RecentlyViewedItem[];
    } catch {
      return [];
    }
  }, [raw]);

  const recordView = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    const current = readItems();
    const next = [
      { ...item, viewedAt: Date.now() },
      ...current.filter((i) => i.id !== item.id),
    ].slice(0, MAX_ITEMS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private browsing, quota exceeded, disabled) —
      // failing silently beats throwing out of a passive tracking effect.
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { items, recordView };
}
