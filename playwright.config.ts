import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// .env.local carries real Turnstile keys (verified working against
// Cloudflare's live API), which would otherwise block every e2e run that
// submits a protected form — the widget can't complete a real interactive
// challenge under Playwright, headless or not, by design. .env.test.local
// overrides just the Turnstile pair with Cloudflare's documented
// always-pass test keys (https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
// so the app runs with Turnstile genuinely wired up, not disabled.
function loadTestEnvOverrides(): Record<string, string> {
  try {
    const content = readFileSync(path.join(__dirname, ".env.test.local"), "utf8");
    const overrides: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) overrides[match[1]] = match[2];
    }
    return overrides;
  } catch {
    return {};
  }
}

const testEnvOverrides = loadTestEnvOverrides();
// e2e/admin.spec.ts reads E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD from this
// (the test runner's own) process.env, not the spawned webServer's — apply
// the same overrides here too, or admin.spec.ts silently self-skips
// whenever the shell that launched `playwright test` didn't happen to have
// them exported.
Object.assign(process.env, testEnvOverrides);

// This box (and CI in general, on a first/cold run) can take a long time to
// compile routes on demand in dev mode — timeouts here are generous on
// purpose rather than flaky. Use `localhost`, not `127.0.0.1`: this fork
// blocks cross-origin dev requests, which silently breaks all client-side
// hydration/HMR if the origin doesn't match what the dev server expects.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    // Observed up to ~65s for a cold admin-route compile on this box —
    // generous on purpose, see the file-level comment above.
    navigationTimeout: 90_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: testEnvOverrides,
  },
});
