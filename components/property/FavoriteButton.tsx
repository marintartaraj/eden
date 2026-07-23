"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  label,
}: {
  propertyId: string;
  label: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(propertyId);
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-danger",
        active && "text-danger",
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
