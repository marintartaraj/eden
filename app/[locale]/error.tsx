"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

// This fork replaced the standard `reset` prop with `unstable_retry` as of
// Next.js 16.2 — see node_modules/next/dist/docs/.../file-conventions/error.md.
export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("errorPages");

  useEffect(() => {
    console.error(error);
    // Dynamic import: keeps @sentry/nextjs out of this route's initial
    // bundle when it's disabled (see instrumentation-client.ts).
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <Container className="py-16 text-center">
      <h1 className="font-serif text-2xl text-foreground sm:text-3xl">{t("errorTitle")}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("errorBody")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:border-accent"
        >
          {t("backHome")}
        </Link>
      </div>
    </Container>
  );
}
