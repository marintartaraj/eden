"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { toggleFavorite as toggleFavoriteAction } from "@/lib/actions/favorites";

type AuthContextValue = {
  user: { id: string } | null;
  favoriteIds: Set<string>;
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  initialFavoriteIds,
  children,
}: {
  user: { id: string } | null;
  initialFavoriteIds: string[];
  children: React.ReactNode;
}) {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));

  // useState's lazy initializer only runs on mount — without this, favoriteIds
  // never learns about server-side changes (e.g. importLocalFavorites) that
  // land via a fresh `initialFavoriteIds` prop after router.refresh(). Adjusting
  // state during render (React's documented pattern for this) instead of in an
  // effect avoids an extra render/commit cycle.
  const initialKey = initialFavoriteIds.join(",");
  const [prevInitialKey, setPrevInitialKey] = useState(initialKey);
  if (initialKey !== prevInitialKey) {
    setPrevInitialKey(initialKey);
    setFavoriteIds(new Set(initialFavoriteIds));
  }

  const isFavorite = useCallback((propertyId: string) => favoriteIds.has(propertyId), [favoriteIds]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    const result = await toggleFavoriteAction(propertyId);
    if (!result.success) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(propertyId)) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
