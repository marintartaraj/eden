import { test, expect } from "@playwright/test";

// Requires E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD for an existing admin
// account — deliberately not hardcoded (this file is committed to source
// control). Set them locally in .env.test.local or as CI secrets; the test
// skips itself when they're absent rather than failing the whole suite.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD not set");

test("logs in as admin, reaches the dashboard, and opens a submission", async ({ page }) => {
  // Several admin routes compiling fresh in one flow (login, dashboard,
  // submissions list, submission detail) can outrun the default per-test
  // budget on a cold dev-server cache.
  test.setTimeout(150_000);

  await page.goto("/en/login");
  await page.waitForTimeout(1000);

  await page.locator('input[name="email"]').fill(ADMIN_EMAIL!);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Log In", exact: true }).click();

  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 30_000 });

  await page.goto("/en/admin");
  await expect(page.locator("h1")).toHaveText("Admin Dashboard");
  await expect(page.getByText("Needs Review")).toBeVisible();

  // A visible element only proves the DOM exists, not that hydration
  // finished — clicking the nav link before the Link component's handler
  // is attached falls back to nothing happening at all (no navigation, no
  // error). Same root cause and fix as inquiry.spec.ts.
  await page.waitForTimeout(6000);
  await page.getByRole("link", { name: "Submissions", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Submissions");

  const firstSubmission = page.locator('a[href*="/admin/submissions/"]').first();
  if (await firstSubmission.isVisible().catch(() => false)) {
    await page.waitForTimeout(6000);
    await firstSubmission.click();
    await expect(page.getByText(/^Status:/)).toBeVisible({ timeout: 30_000 });
  }
});
