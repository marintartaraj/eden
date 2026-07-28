import { defineConfig, devices } from "@playwright/test";

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
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
