import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildHref, type PropertiesQuery } from "@/lib/filters/property-filters";
import { cn } from "@/lib/utils";

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set(
    [1, total, current, current - 1, current + 1, current - 2, current + 2].filter(
      (p) => p >= 1 && p <= total,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export async function Pagination({
  query,
  pageCount,
  basePath,
}: {
  query: PropertiesQuery;
  pageCount: number;
  basePath: string;
}) {
  if (pageCount <= 1) return null;

  const t = await getTranslations("pagination");
  const current = query.page;
  const pages = getPageNumbers(current, pageCount);

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label={t("page", { page: current, total: pageCount })}>
      <Link
        href={buildHref(basePath, query, { page: Math.max(1, current - 1) })}
        aria-label={t("previous")}
        aria-disabled={current === 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent",
          current === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, query, { page: p })}
            aria-current={p === current}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
              p === current
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-border/40",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(basePath, query, { page: Math.min(pageCount, current + 1) })}
        aria-label={t("next")}
        aria-disabled={current === pageCount}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent",
          current === pageCount && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
