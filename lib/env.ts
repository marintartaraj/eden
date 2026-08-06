import { z } from "zod";

// .env.local.example documents every optional var as a blank `KEY=` line
// (not an absent line) for a new setup to fill in later — but a blank line
// parses as "", not undefined, and z's `.optional()` only ever treats
// undefined as absent. Without this, every optional var below throws at
// module load (crashing any request that touches it) until the line is
// either filled in or deleted outright, which defeats the entire point of
// making these opt-in.
export const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

// Client-safe env vars only (NEXT_PUBLIC_*) — this module is imported from
// both server and browser code (lib/supabase/client.ts), so it must never
// validate secrets. See lib/env.server.ts for those.
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
