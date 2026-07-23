import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildHref, type PropertiesQuery } from "@/lib/filters/property-filters";

export async function MapViewPlaceholder({
  query,
  basePath,
}: {
  query: PropertiesQuery;
  basePath: string;
}) {
  const t = await getTranslations("results");

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <MapPin className="h-6 w-6" />
      </div>
      <h2 className="font-serif text-xl text-foreground">{t("mapComingSoonTitle")}</h2>
      <p className="max-w-md text-sm text-muted">{t("mapComingSoonBody")}</p>
      <Link
        href={buildHref(basePath, query, { view: "grid" })}
        className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("backToGrid")}
      </Link>
    </div>
  );
}
