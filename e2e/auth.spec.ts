import { test, expect } from "@playwright/test";

// Regression coverage for a real gap this session found and fixed: the
// password field had no show/hide toggle at all, so users had to type a
// password blind. This confirms the toggle actually changes the input's
// type (not just its icon) and preserves the typed value.
test("login password field can be toggled between hidden and visible", async ({ page }) => {
  await page.goto("/en/login");
  await page.waitForTimeout(2000);

  const passwordField = page.locator('input[autocomplete="current-password"]');
  await passwordField.fill("mysecret123");
  await expect(passwordField).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Show password" }).click();
  await expect(passwordField).toHaveAttribute("type", "text");
  await expect(passwordField).toHaveValue("mysecret123");

  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(passwordField).toHaveAttribute("type", "password");
});

// Regression coverage for a real gap this session found and fixed: the
// reset-password page rendered a fully working-looking "set new password"
// form unconditionally, even for a visitor with no valid recovery session
// (a stale bookmark, an expired or already-used email link). Submitting
// that form used to fail with a raw, confusing Supabase error. The page now
// checks for a session server-side and shows an actionable "link expired"
// state instead of the form.
test("reset-password page shows an expired-link state without a recovery session", async ({
  page,
}) => {
  await page.goto("/en/reset-password");
  await page.waitForTimeout(1500);

  await expect(page.getByText("This link has expired")).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Request a New Link" })).toHaveAttribute(
    "href",
    "/en/forgot-password",
  );
});
