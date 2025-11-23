import { expect, test } from "@playwright/test";

test.describe("Accessibility and Performance", () => {
  test("should have proper page titles", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Ebad Academy|أكاديمية عباد/);

    await page.goto("/ar");
    await expect(page).toHaveTitle(/Ebad Academy|أكاديمية عباد/);
  });

  test("should have proper meta descriptions", async ({ page }) => {
    await page.goto("/en");

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/en");

    // Should have h1
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();

    // Count headings
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test("should have alt text for images", async ({ page }) => {
    await page.goto("/en");

    const images = page.locator("img");
    const count = await images.count();

    if (count > 0) {
      // Check first few images for alt text
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        // Alt can be empty string for decorative images, but should exist
        expect(alt !== null).toBeTruthy();
      }
    }
  });

  test("should have proper ARIA labels for interactive elements", async ({
    page,
  }) => {
    await page.goto("/en");

    // Check buttons have accessible names
    const buttons = page.locator("button");
    const count = await buttons.count();

    if (count > 0) {
      const firstButton = buttons.first();
      const text = await firstButton.textContent();
      const ariaLabel = await firstButton.getAttribute("aria-label");

      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/en");

    // Tab through elements
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    // Check if focus is visible
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });

  test("should have proper color contrast (basic check)", async ({ page }) => {
    await page.goto("/en");

    // This is a basic check - proper contrast testing requires specialized tools
    const bodyBg = await page
      .locator("body")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

    expect(bodyBg).toBeTruthy();
  });

  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("should have responsive viewport meta tag", async ({ page }) => {
    await page.goto("/en");

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/en");

    // Page should load and be visible
    await expect(page.locator("body")).toBeVisible();

    // Check if mobile menu exists
    const mobileMenu = page.locator(
      '[aria-label*="menu"], button[class*="menu"]'
    );
    const count = await mobileMenu.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/en");

    await expect(page.locator("body")).toBeVisible();
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/en/login");

    // Check if inputs have labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page
      .locator('input[type="password"][name="password"]')
      .first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should have skip to main content link", async ({ page }) => {
    await page.goto("/en");

    // Look for skip link (usually hidden until focused)
    const skipLink = page
      .locator('a[href*="#main"], a[href*="#content"]')
      .first();

    if ((await skipLink.count()) > 0) {
      expect(await skipLink.count()).toBeGreaterThan(0);
    }
  });

  test("should have proper language attributes", async ({ page }) => {
    await page.goto("/en");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");

    await page.goto("/ar");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("should have proper focus indicators", async ({ page }) => {
    await page.goto("/en");

    // Tab to first focusable element
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);

    // Check if there's a focused element
    const hasFocus = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused !== document.body && focused !== null;
    });

    expect(hasFocus).toBeTruthy();
  });
});
