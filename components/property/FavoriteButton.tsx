"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, FOCUS_RING } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  label,
}: {
  propertyId: string;
  label: string;
}) {
  const local = useFavorites();
  const auth = useAuth();

  const active = auth.user ? auth.isFavorite(propertyId) : local.isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (auth.user) {
          auth.toggleFavorite(propertyId);
        } else {
          local.toggleFavorite(propertyId);
        }
      }}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-danger",
        FOCUS_RING,
        active && "text-danger",
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
