"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Root-level fallback for errors thrown by app/[locale]/layout.tsx itself
// (e.g. getMessages()/getCurrentUser() failing) — app/[locale]/error.tsx
// only catches errors in its children, not the layout that wraps it. This
// file replaces the entire document, so it can't rely on next-intl (no
// locale context exists yet) or the compiled globals.css reliably loading —
// plain markup and inline styles only, kept deliberately minimal.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#666", maxWidth: "28rem" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "9999px",
            background: "#1a1a1a",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
