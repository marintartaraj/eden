import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { Link } from "@/i18n/navigation";
import { getAllProperties } from "@/lib/data/admin-properties";
import { PROPERTY_STATUSES } from "@/lib/validations/admin-property";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export default async function AdminPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, statusT, properties] = await Promise.all([
    getTranslations("adminProperties"),
    getTranslations("agentProperties.status"),
    getAllProperties(status),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AdminNav />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/properties"
          className={`rounded-full px-4 py-1.5 text-sm ${!status ? "bg-accent text-accent-foreground" : "bg-card text-muted"}`}
        >
          {t("allStatuses")}
        </Link>
        {PROPERTY_STATUSES.map((s) => (
          <Link
            key={s}
            href={{ pathname: "/admin/properties", query: { status: s } }}
            className={`rounded-full px-4 py-1.5 text-sm ${status === s ? "bg-accent text-accent-foreground" : "bg-card text-muted"}`}
          >
            {statusT(s)}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {properties.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
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
          </div>
        )}
      </div>
    </Container>
  );
}
