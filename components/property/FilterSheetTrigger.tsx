"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPanel } from "./FilterPanel";
import type { PropertiesQuery } from "@/lib/filters/property-filters";
import type { Database } from "@/types/supabase";
import { cn, FOCUS_RING } from "@/lib/utils";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  function closeSheet() {
    triggerRef.current?.focus();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button ref={triggerRef} variant="secondary" onClick={() => setOpen(true)} className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={triggerLabel}
          className="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)]"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-base font-medium text-foreground">{triggerLabel}</span>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={closeLabel}
              className={cn("rounded-md p-2.5 text-foreground", FOCUS_RING)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <FilterPanel
              cities={cities}
              neighborhoods={neighborhoods}
              query={query}
              basePath={basePath}
              forcedPurpose={forcedPurpose}
              onClose={closeSheet}
            />
          </div>
        </div>
      )}
    </div>
  );
}
