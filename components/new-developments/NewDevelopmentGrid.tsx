import type { AppLocale } from "@/i18n/routing";
import type { NewDevelopmentListItem } from "@/lib/data/new-developments";
import { NewDevelopmentCard } from "./NewDevelopmentCard";

export function NewDevelopmentGrid({
  developments,
  locale,
  priorityCount = 0,
}: {
  developments: NewDevelopmentListItem[];
  locale: AppLocale;
  /** Number of leading cards to mark as high-priority (above-the-fold) images. */
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {developments.map((development, index) => (
        <NewDevelopmentCard
          key={development.id}
          development={development}
          locale={locale}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
