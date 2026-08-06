import { test, expect } from "@playwright/test";

// Regression coverage for a real gap this session found and fixed: the
// grid/list/map view was derived purely from the `?view=` URL param, with
// no persistence — switching to List then navigating away and back (with
// no explicit `?view=` in the new URL) silently reset to grid every time.
test("remembers the last-used view mode across navigations", async ({ page }) => {
  await page.goto("/en/properties");
  await page.waitForTimeout(2000);

  await page.getByRole("link", { name: "List" }).click();
  await expect(page).toHaveURL(/view=list/);

  // Navigate elsewhere, then back with no explicit ?view= in the URL.
  await page.goto("/en");
  await page.waitForTimeout(1000);
  await page.goto("/en/properties");
  await expect(page).toHaveURL(/view=list/, { timeout: 10_000 });
});

test("an explicit ?view= in the URL is never overridden by a stored preference", async ({
  page,
}) => {
  await page.goto("/en/properties");
  await page.evaluate(() => window.localStorage.setItem("eden:lastViewMode", "map"));
  await page.goto("/en/properties?view=grid");
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/view=grid/);
});
