import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env";

Sentry.init({
  dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!publicEnv.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
