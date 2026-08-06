import { test, expect } from "@playwright/test";

// Regression coverage for a real bug this session found and fixed: the
// filter panel's `draft` state was seeded from the `query` prop only once,
// at mount, so it never re-synced when the URL's filters changed via some
// other control (sort, view, pagination, browser back). This test exercises
// the active-filter-chip UI added alongside that fix, which reads directly
// off the applied `query` (not the panel's draft), so it also verifies the
// chips accurately reflect what's actually applied.
test("shows an active-filter chip for an applied filter and removes it on click", async ({
  page,
}) => {
  await page.goto("/en/properties?bedrooms=3");
  await page.waitForTimeout(2000);

  const chip = page.getByRole("button", { name: "Remove 3+ Bedrooms filter" });
  await expect(chip).toBeVisible();

  await chip.click();
  await expect(page).toHaveURL(/\/en\/properties(?!\?.*bedrooms)/);
  await expect(chip).not.toBeVisible();
});

// Regression coverage for the same underlying bug: an edit left sitting in
// the filter panel's draft (not yet applied) must not survive an unrelated
// navigation that changes the applied query — the panel should resync to
// whatever the URL actually says, not keep showing a stale, inapplicable
// selection.
test("filter panel draft resyncs after an unrelated navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/properties");
  await page.waitForTimeout(2000);

  const aside = page.getByRole("main").locator("aside");
  const apartmentChip = aside.getByRole("button", { name: "Apartment", exact: true });
  await apartmentChip.click();
  await expect(apartmentChip).toHaveAttribute("aria-pressed", "true");

  // Sort is a navigation that goes through router.push directly (not
  // through the filter panel's own applyFilters), so this exercises the
  // draft-resync path rather than the normal apply flow.
  await page.getByLabel("Sort by").selectOption("price_asc");
  await page.waitForURL(/sort=price_asc/);
  await page.waitForTimeout(500);

  await expect(apartmentChip).toHaveAttribute("aria-pressed", "false");
});
