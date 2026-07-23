"use client";

import { useEffect } from "react";
import { useRecentlyViewed, type RecentlyViewedItem } from "@/lib/hooks/useRecentlyViewed";

export function RecentlyViewedTracker({ item }: { item: Omit<RecentlyViewedItem, "viewedAt"> }) {
  const { recordView } = useRecentlyViewed();

  useEffect(() => {
    recordView(item);
  }, [item, recordView]);

  return null;
}
