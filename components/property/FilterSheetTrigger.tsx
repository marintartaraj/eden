"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPanel } from "./FilterPanel";
import type { PropertiesQuery } from "@/lib/filters/property-filters";
import type { Database } from "@/types/supabase";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type NeighborhoodRow = Database["public"]["Tables"]["neighborhoods"]["Row"];

export function FilterSheetTrigger({
  cities,
  neighborhoods,
  query,
  basePath,
  forcedPurpose,
  initialOpen,
  triggerLabel,
  closeLabel,
}: {
  cities: CityRow[];
  neighborhoods: NeighborhoodRow[];
  query: PropertiesQuery;
  basePath: string;
  forcedPurpose?: "sale" | "rent";
  initialOpen?: boolean;
  triggerLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(!!initialOpen);

  return (
    <div className="lg:hidden">
      <Button variant="secondary" onClick={() => setOpen(true)} className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-base font-medium text-foreground">{triggerLabel}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="p-2 text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterPanel
              cities={cities}
              neighborhoods={neighborhoods}
              query={query}
              basePath={basePath}
              forcedPurpose={forcedPurpose}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
