import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env";

// Sentry DSNs are meant to be public (rate-limited server-side by Sentry),
// unlike API keys — safe to read from NEXT_PUBLIC_*. Disabled entirely
// until NEXT_PUBLIC_SENTRY_DSN is set (see .env.local.example).
Sentry.init({
  dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!publicEnv.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
