import { test, expect } from "@playwright/test";
import path from "node:path";

// Regression coverage for a real bug this session found and fixed: leaving
// Net Area / Construction Year blank used to silently freeze the wizard on
// that step (z.coerce.number() turned "" into 0, which failed .positive()/
// .min() checks even though the fields are optional). This test
// deliberately leaves them blank.
test("completes the sell-property wizard leaving optional fields blank", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/en/sell-property");
  await expect(page.locator("h1")).toHaveText("Sell or Rent Out Your Property");
  await page.waitForTimeout(3000);

  const next = () => page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 1: Purpose — "Sale" is the default, just advance.
  await next();

  // Step 2: Type & location.
  await page.getByRole("button", { name: "Apartment", exact: true }).click();
  await page.locator('select[name="city"]').selectOption({ index: 1 });
  await next();

  // Step 3: Characteristics — grossArea required, netArea/bedrooms/etc left
  // blank on purpose (see comment above).
  await page.locator('input[name="grossArea"]').fill("85");
  await next();

  // Step 4: Condition — all optional, left blank.
  await next();

  // Step 5: Price.
  await page.locator('input[name="price"]').fill("100000");
  await next();

  // Step 6: Photos — at least one required. Uploads to real Supabase
  // storage, so give it real network time rather than a UI-only timeout.
  await page.setInputFiles('input[type="file"]', path.join(__dirname, "fixtures/test-photo.png"));
  await expect(page.locator('button[aria-label="Remove photo"]')).toBeVisible({ timeout: 30_000 });
  await next();

  // Step 7: Contact info.
  await page.locator('input[name="ownerName"]').fill("Playwright Test Owner");
  await page.locator('input[name="ownerPhone"]').fill("+355691234567");
  await page.locator('input[name="ownerEmail"]').fill("owner-e2e@example.com");
  await next();

  // Step 8: Review — confirm we actually reached it (not stuck on step 3/4)
  // and that the Terms/Privacy links from Phase 2 render here too. Scoped
  // to <main> since the footer (present on every page) has its own
  // Terms/Privacy links with the same accessible names.
  await expect(page.getByRole("heading", { name: "Review and submit" })).toBeVisible();
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
    "href",
    "/en/terms",
  );
  await expect(main.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
    "href",
    "/en/privacy",
  );

  // Click the visible label (the real interactive surface — the checkbox
  // input itself is sr-only), then explicitly wait for React state to
  // reflect it checked before submitting. react-hook-form's
  // setValue(shouldValidate: true) is async; clicking straight through to
  // Submit risked a race where agreeToTerms was still false client-side.
  await page.getByText("I confirm the information above is accurate.").click();
  await expect(page.locator('input[type="checkbox"]')).toBeChecked();

  await page.getByRole("button", { name: "Submit for Review" }).click();

  // The submit round-trip includes a live Nominatim geocoding call (see
  // lib/geocode.ts) plus admin-notification email lookups — 20s wasn't
  // enough on a slow box (observed one real submission taking 25.3s
  // server-side alone).
  await expect(page.getByRole("heading", { name: /thank you|success/i })).toBeVisible({
    timeout: 45_000,
  });
});
