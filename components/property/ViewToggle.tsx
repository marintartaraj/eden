"use client";

import { Grid3x3, List, Map as MapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildHref, type PropertiesQuery, type ViewMode } from "@/lib/filters/property-filters";
import { cn, FOCUS_RING } from "@/lib/utils";

export const VIEW_MODE_STORAGE_KEY = "eden:lastViewMode";

export function ViewToggle({
  query,
  basePath,
}: {
  query: PropertiesQuery;
  basePath: string;
}) {
  const t = useTranslations("view");
  const options = [
    { key: "grid" as const, icon: Grid3x3, label: t("grid") },
    { key: "list" as const, icon: List, label: t("list") },
    { key: "map" as const, icon: MapIcon, label: t("map") },
  ];

  function rememberView(key: ViewMode) {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, key);
    } catch {
      // Storage unavailable — the click still navigates normally, it just
      // won't be remembered for next time.
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-1">
      {options.map(({ key, icon: Icon, label }) => (
        <Link
          key={key}
          href={buildHref(basePath, query, { view: key })}
          aria-label={label}
          aria-current={query.view === key ? "true" : undefined}
          onClick={() => rememberView(key)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
            FOCUS_RING,
            query.view === key
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}
