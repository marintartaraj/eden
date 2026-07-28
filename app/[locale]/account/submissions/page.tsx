import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { Link } from "@/i18n/navigation";
import { getMySubmissions } from "@/lib/data/submissions";
import { localize } from "@/lib/localize";
import { formatPrice } from "@/lib/format";
import type { AppLocale } from "@/i18n/routing";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const appLocale = locale as AppLocale;

  const [t, submissions] = await Promise.all([getTranslations("submissions"), getMySubmissions()]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AccountNav />

      <div className="mt-8">
        {submissions.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((submission) => {
              const title = submission.property
                ? localize(submission.property.title_sq, submission.property.title_en, appLocale)
                : t("untitled");
              return (
                <Link
                  key={submission.id}
                  href={`/account/submissions/${submission.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    {submission.property && (
                      <p className="text-sm text-muted">
                        {formatPrice(
                          submission.property.price,
                          submission.property.currency,
                          appLocale,
                        )}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-border px-3 py-1 text-xs font-medium text-foreground">
                    {t(`status.${submission.status}`)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
