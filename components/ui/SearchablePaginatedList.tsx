"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

/**
 * Adds client-side search + pagination around a list whose rows are
 * server-rendered React elements. Only plain data (not functions) can cross
 * the Server→Client Component boundary, so this takes the already-rendered
 * row elements (each still carrying its own stable `key` from the server
 * map) plus a parallel array of plain search text — filtering/paginating by
 * index rather than needing a render-prop.
 */
export function SearchablePaginatedList({
  items,
  searchText,
  searchPlaceholder,
  emptyMessage,
}: {
  items: React.ReactNode[];
  searchText?: string[];
  searchPlaceholder?: string;
  emptyMessage: string;
}) {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredIndexes = useMemo(() => {
    const all = items.map((_, i) => i);
    if (!query.trim() || !searchText) return all;
    const q = query.trim().toLowerCase();
    return all.filter((i) => searchText[i]?.toLowerCase().includes(q));
  }, [query, items, searchText]);

  const pageCount = Math.max(1, Math.ceil(filteredIndexes.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageIndexes = filteredIndexes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {searchText && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {filteredIndexes.length === 0 ? (
        <p className="text-sm text-muted">{t("noSearchResults")}</p>
      ) : (
        <div className="flex flex-col gap-3">{pageIndexes.map((i) => items[i])}</div>
      )}

      {pageCount > 1 && (
        <nav
          className="mt-2 flex items-center justify-center gap-2"
          aria-label={t("pageOf", { page: currentPage, total: pageCount })}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label={t("previousPage")}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent",
              currentPage === 1 && "pointer-events-none opacity-40",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">
            {t("pageOf", { page: currentPage, total: pageCount })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            aria-label={t("nextPage")}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent",
              currentPage === pageCount && "pointer-events-none opacity-40",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
