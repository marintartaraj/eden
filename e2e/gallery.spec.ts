import { test, expect } from "@playwright/test";

// Regression coverage for a real gap this session found and fixed: the
// property-detail photo lightbox was a plain full-screen <div> with no
// role="dialog"/aria-modal, no focus trap, no scroll lock, and no
// Escape-to-close — only a visible X button worked. This mirrors the same
// fix already applied to MobileNav.tsx in an earlier phase.
test("property gallery lightbox opens as a real dialog and closes on Escape", async ({ page }) => {
  await page.goto("/en/properties");
  await page.waitForTimeout(2000);

  const firstProperty = page.locator('a[href*="/properties/"]').first();
  await firstProperty.click();
  await page.waitForURL(/\/en\/properties\/[a-z0-9-]+$/);
  await page.waitForTimeout(1500);

  const mainPhoto = page.locator("button").filter({ has: page.locator("img") }).first();
  await mainPhoto.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
