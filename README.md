# Eden

A real estate listings platform for Albania — property search, agent
directory, an owner-submission pipeline with admin review, and an agent
dashboard for managing listings and leads. Bilingual (Albanian/English) via
`next-intl`.

## Tech stack

- **Next.js 16** (App Router, webpack dev server — see [Known quirks](#known-quirks-of-this-nextjs-version) below)
- **Supabase** — Postgres, Auth, Storage
- **next-intl** for i18n (`sq` default, `en` prefixed)
- **Tailwind CSS v4**, **React Hook Form** + **Zod**
- **MapLibre GL** (CARTO tiles) for property location maps
- **Vitest** for unit tests, **Playwright** for e2e
- Optional integrations, all free-tier and disabled until configured:
  **Cloudflare Turnstile** (CAPTCHA), **Sentry** (error monitoring),
  **Resend** (transactional email)

## Prerequisites

- Node.js 20+ (22+ recommended — `@supabase/supabase-js` warns on 20)
- A Supabase project (see [Database setup](#database-setup))

## Getting started

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `localhost`, not
`127.0.0.1` — this fork's dev server rejects cross-origin dev requests,
which silently breaks client-side hydration and HMR if the origin doesn't
match what the server expects.

## Environment variables

See `.env.local.example` for the full list with inline explanations. In
short:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only — never expose to the client. Used by admin actions (`lib/supabase/admin.ts`) and email-notification recipient lookups. |
| `NEXT_PUBLIC_SITE_URL` | No | Used for auth email redirect links when a request has no Origin header. Falls back to `http://localhost:3000`. Set to your real deployed URL in production. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | No | CAPTCHA on the inquiry/sell-property/signup forms. Forms work without it, just unprotected against bots. |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Error monitoring. Errors log to the server console either way. |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | No | Transactional email (new inquiry/submission notifications, status-change emails). Nothing else breaks if unset. |

All env vars are validated at startup (`lib/env.ts` / `lib/env.server.ts`) —
a missing required var fails loudly at boot rather than silently falling
back.

## Database setup

Migrations live in `supabase/migrations/`, applied in filename (timestamp)
order. To set up a fresh Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Either:
   - **Supabase CLI**: `supabase login`, `supabase link --project-ref <ref>`, `supabase db push`, or
   - **SQL Editor** (no CLI login needed): open each file in
     `supabase/migrations/` in order and run it in your project's SQL
     Editor. After running a migration that adds new functions/RPCs, run
     `NOTIFY pgrst, 'reload schema';` so PostgREST picks them up
     immediately (otherwise it can take a minute or more on its own).
3. Copy the project's URL/keys (Project Settings → API) into `.env.local`.

The `2026072*_seed_*.sql` migrations insert demo content (cities,
neighborhoods, sample properties, agents). Skip them for a real production
database, or edit them down to just the reference data (cities,
neighborhoods, amenities) you actually want.

### Environment separation

**Use a separate Supabase project for local development/staging and for
production.** Every environment described above should point at its own
project — don't develop against the same database real users hit. Vercel
(or whatever host you use) should have distinct env var sets for Preview
and Production deployments pointing at the corresponding project.

## Known quirks of this Next.js version

This is a Next.js build with some behavior that differs from what you might
expect from mainline Next.js docs or training-data knowledge. Confirmed
differences hit while building this project:

- **`error.tsx` uses `unstable_retry`, not `reset`.** The `reset` prop
  still exists but `unstable_retry` is what these docs recommend (added in
  16.2.0).
- **A plain root `app/not-found.tsx` doesn't work here** because this app
  has no single root `app/layout.tsx` (the root layout lives at
  `app/[locale]/layout.tsx`, a dynamic segment). Use
  `app/global-not-found.tsx` with `experimental.globalNotFound: true` in
  `next.config.ts` instead — see that file's comments.
- **`not-found.js`/`loading.js` accept no props at all**, not even
  `params`.

When something behaves unexpectedly, check
`node_modules/next/dist/docs/` for this installed version before assuming
standard Next.js behavior.

## Testing

```bash
npm test              # unit tests (Vitest) — lib/validations, formatting, etc.
npm run test:watch    # unit tests, watch mode
npm run test:e2e      # e2e (Playwright) — starts its own dev server
```

E2e tests hit real Supabase data. The admin-flow test
(`e2e/admin.spec.ts`) needs `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` for an
existing admin account (set locally in `.env.test.local`, or as CI
secrets) — it skips itself cleanly when they're absent rather than failing
the suite.

## CI

`.github/workflows/ci.yml` runs typecheck + lint + unit tests on every
push/PR. The e2e job additionally needs `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` as repository secrets — ideally
pointing at a dedicated test Supabase project, not production. It skips
cleanly without them.

## Deployment

Deploy on [Vercel](https://vercel.com) — zero-config for this stack. Set
the environment variables above per-environment (Preview vs Production),
each pointing at its own Supabase project as described in
[Environment separation](#environment-separation).
