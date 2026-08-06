import { publicEnv } from "@/lib/env";

// Sentry DSNs are meant to be public (rate-limited server-side by Sentry),
// unlike API keys — safe to read from NEXT_PUBLIC_*. Disabled entirely
// until NEXT_PUBLIC_SENTRY_DSN is set (see .env.local.example).
//
// Dynamic import rather than a static one: this file loads on every single
// page (that's the point of instrumentation-client.ts), so a static
// `import * as Sentry` bundles the SDK into the main chunk unconditionally
// — Lighthouse measured ~60% of that chunk as unused JS on the homepage
// while Sentry sat disabled. The dynamic import lets bundlers split it into
// its own chunk that's only ever fetched when a DSN is actually configured.
if (publicEnv.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  });
}
