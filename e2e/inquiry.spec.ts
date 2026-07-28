import { test, expect } from "@playwright/test";

test("submits a general inquiry from the contact page", async ({ page }) => {
  await page.goto("/en/contact", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText("Contact Us");

  // react-hook-form's onSubmit isn't wired until the client bundle
  // hydrates — interacting too early falls back to a native (unhandled)
  // form submit that never reaches the server action. A visible element
  // only proves the DOM exists, not that hydration finished, so wait
  // explicitly (this dev box's compile times make a fixed delay more
  // reliable here than trying to detect hydration precisely).
  //
  // Selectors use placeholder text rather than input[type="text"]: the
  // name field has no explicit type="text" attribute (defaults to text
  // implicitly), and CSS attribute selectors only match attributes that
  // are literally present in the markup — [type="text"] silently skips it.
  await page.getByPlaceholder("Your name").waitFor({ state: "visible" });
  await page.waitForTimeout(6000);

  await page.getByPlaceholder("Your name").fill("Playwright E2E Test");
  await page.getByPlaceholder("Your email").fill("e2e-test@example.com");
  await page.getByPlaceholder("Phone number (optional)").fill("+355691234567");
  await page
    .getByPlaceholder("Your message (optional)")
    .fill("Automated end-to-end smoke test — please ignore.");

  await page.getByRole("button", { name: "Send Inquiry" }).click();

  await expect(page.getByText("Thank you!")).toBeVisible({ timeout: 20_000 });
});

test("blocks submission when the honeypot field is filled (bot simulation)", async ({ page }) => {
  await page.goto("/en/contact", { waitUntil: "networkidle" });
  await page.getByPlaceholder("Your name").waitFor({ state: "visible" });
  await page.waitForTimeout(6000);

  await page.getByPlaceholder("Your name").fill("Bot Name");
  await page.getByPlaceholder("Your email").fill("bot@example.com");

  // The honeypot input is the only field with tabindex="-1" in the form.
  const honeypot = page.locator('form input[tabindex="-1"]');
  await honeypot.fill("http://spam.example");

  await page.getByRole("button", { name: "Send Inquiry" }).click();
  await page.waitForTimeout(2000);

  // Rejected client-side by Zod before the server action ever runs, so the
  // success state never appears.
  await expect(page.getByText("Thank you!")).not.toBeVisible();
});
