import { Grid3x3, List, Map as MapIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildHref, type PropertiesQuery } from "@/lib/filters/property-filters";
import { cn } from "@/lib/utils";

export async function ViewToggle({
  query,
  basePath,
}: {
  query: PropertiesQuery;
  basePath: string;
}) {
  const t = await getTranslations("view");
  const options = [
    { key: "grid" as const, icon: Grid3x3, label: t("grid") },
    { key: "list" as const, icon: List, label: t("list") },
    { key: "map" as const, icon: MapIcon, label: t("map") },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-1">
      {options.map(({ key, icon: Icon, label }) => (
        <Link
          key={key}
          href={buildHref(basePath, query, { view: key })}
          aria-label={label}
          aria-current={query.view === key}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
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
