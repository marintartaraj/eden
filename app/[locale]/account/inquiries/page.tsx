import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { Link } from "@/i18n/navigation";
import { getMyInquiries } from "@/lib/data/inquiries";
import { localize } from "@/lib/localize";
import { formatDateWithDay } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export default async function InquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, inquiries] = await Promise.all([getTranslations("inquiriesPage"), getMyInquiries()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AccountNav />

      <div className="mt-8">
        {inquiries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-muted">{t("empty")}</p>
            <Link
              href="/properties"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {t("browseCta")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-foreground">
                    {inquiry.property
                      ? localize(inquiry.property.title_sq, inquiry.property.title_en, appLocale)
                      : t("generalInquiry")}
                  </p>
                  <span className="text-xs text-muted">
                    {formatDateWithDay(inquiry.created_at, appLocale)}
                  </span>
                </div>
                {inquiry.message && <p className="mt-2 text-sm text-muted">{inquiry.message}</p>}
                {inquiry.property && (
                  <Link
                    href={`/properties/${inquiry.property.slug}`}
                    className="mt-2 inline-block text-sm text-accent hover:underline"
                  >
                    {t("viewProperty")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
