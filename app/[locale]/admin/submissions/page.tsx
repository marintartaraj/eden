import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { SearchablePaginatedList } from "@/components/ui/SearchablePaginatedList";
import { Link } from "@/i18n/navigation";
import { getAllSubmissions } from "@/lib/data/admin-submissions";
import { localize } from "@/lib/localize";
import { submissionStatusClasses } from "@/lib/status-styles";
import type { AppLocale } from "@/i18n/routing";

const FILTERS = [
  "submitted",
  "pending_review",
  "more_info_required",
  "published",
  "rejected",
  "withdrawn",
] as const;

export default async function AdminSubmissionsPage({
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

  const [t, statusT, submissions] = await Promise.all([
    getTranslations("adminSubmissions"),
    getTranslations("submissions.status"),
    getAllSubmissions(status),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("title")}</h1>
      <AdminNav />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/submissions"
          className={`rounded-full px-4 py-1.5 text-sm ${!status ? "bg-accent text-accent-foreground" : "bg-card text-muted"}`}
        >
          {t("allStatuses")}
        </Link>
        {FILTERS.map((s) => (
          <Link
            key={s}
            href={{ pathname: "/admin/submissions", query: { status: s } }}
            className={`rounded-full px-4 py-1.5 text-sm ${status === s ? "bg-accent text-accent-foreground" : "bg-card text-muted"}`}
          >
            {statusT(s)}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SearchablePaginatedList
          items={submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/admin/submissions/${submission.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div>
                <p className="font-medium text-foreground">
                  {submission.property
                    ? localize(submission.property.title_sq, submission.property.title_en, appLocale)
                    : t("noProperty")}
                </p>
                <p className="text-sm text-muted">
                  {submission.submitted_by_user_id
                    ? t("submittedByAccount")
                    : t("submittedByGuest", { name: submission.guest_name ?? "" })}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${submissionStatusClasses(submission.status)}`}
              >
                {statusT(submission.status)}
              </span>
            </Link>
          ))}
          searchText={submissions.map((submission) =>
            submission.property
              ? localize(submission.property.title_sq, submission.property.title_en, appLocale)
              : (submission.guest_name ?? ""),
          )}
          searchPlaceholder={t("searchPlaceholder")}
          emptyMessage={t("empty")}
        />
      </div>
    </Container>
  );
}
