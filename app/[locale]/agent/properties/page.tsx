import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AgentNav } from "@/components/agent/AgentNav";
import { SearchablePaginatedList } from "@/components/ui/SearchablePaginatedList";
import { Link } from "@/i18n/navigation";
import { getMyAssignedProperties } from "@/lib/data/agent-properties";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export default async function AgentPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, statusT, properties] = await Promise.all([
    getTranslations("agentProperties"),
    getTranslations("agentProperties.status"),
    getMyAssignedProperties(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
        <Link
          href="/agent/properties/new"
          className="flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("newProperty")}
        </Link>
      </div>
      <AgentNav />

      <div className="mt-8">
        <SearchablePaginatedList
          items={properties.map((property) => (
            <Link
              key={property.id}
              href={`/agent/properties/${property.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <p className="font-medium text-foreground">
                  {localize(property.title_sq, property.title_en, appLocale)}
                </p>
                <p className="text-sm text-muted">
                  {formatPrice(property.price, property.currency, appLocale, property.price_period)}
                </p>
              </div>
              <span className="rounded-full bg-border px-3 py-1 text-xs font-medium text-foreground">
                {statusT(property.status)}
              </span>
            </Link>
          ))}
          searchText={properties.map((property) =>
            localize(property.title_sq, property.title_en, appLocale),
          )}
          searchPlaceholder={t("searchPlaceholder")}
          emptyMessage={t("empty")}
        />
      </div>
    </Container>
  );
}
