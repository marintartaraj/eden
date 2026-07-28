"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteSavedSearch } from "@/lib/actions/saved-searches";
import type { Database } from "@/types/supabase";

type SavedSearch = Database["public"]["Tables"]["saved_searches"]["Row"];

export function SavedSearchList({ searches }: { searches: SavedSearch[] }) {
  const t = useTranslations("savedSearches");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (searches.length === 0) {
    return <p className="text-sm text-muted">{t("empty")}</p>;
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSavedSearch(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {searches.map((search) => {
        const filters = search.filters as { basePath?: string; queryString?: string } | null;
        const href = filters?.basePath
          ? filters.queryString
            ? `${filters.basePath}?${filters.queryString}`
            : filters.basePath
          : "/properties";
        return (
          <div
            key={search.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Link href={href} className="text-sm font-medium text-foreground hover:underline">
              {search.name}
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(search.id)}
              disabled={isPending}
              aria-label={t("delete")}
              className="text-muted transition-colors hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
