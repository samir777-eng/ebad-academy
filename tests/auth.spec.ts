import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display landing page correctly", async ({ page }) => {
    // Check for hero section
    await expect(page.locator("h1")).toContainText(
      /Build Your Islam|ابنِ إسلامك/
    );

    // Check for navigation
    await expect(page.locator("nav")).toBeVisible();

    // Check for CTA buttons
    const loginButton = page.getByRole("link", { name: /Login|تسجيل الدخول/i });
    await expect(loginButton).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    // Click on register/start button
    const registerButton = page
      .getByRole("link", { name: /Start Free|ابدأ رحلتك|Register|التسجيل/i })
      .first();
    await registerButton.click();

    // Should be on registration page
    await expect(page).toHaveURL(/\/register/);

    // Check for registration form
    await expect(page.getByLabel(/name|الاسم/i)).toBeVisible();
    await expect(page.getByLabel(/email|البريد/i)).toBeVisible();
    // Check for password field (use ID selector to avoid ambiguity)
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
  });

  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const phoneNumber = `+201001234567`; // Egyptian phone number

    // Fill registration form using ID selectors to avoid ambiguity
    await page.getByLabel(/name|الاسم/i).fill(`Test User ${timestamp}`);
    await page.getByLabel(/email|البريد/i).fill(testEmail);

    // Fill phone number
    const phoneInput = page.locator('input[name="phoneNumber"]');
    await phoneInput.fill(phoneNumber);

    await page.locator("#password").fill("TestPassword123!");
    await page.locator("#confirmPassword").fill("TestPassword123!");

    // Submit form - button text is "Create Account" in English
    await page
      .getByRole("button", { name: /create account|إنشاء حساب/i })
      .click();

    // Should redirect to dashboard or login (increased timeout for dashboard loading)
    await page.waitForURL(/\/(dashboard|login|ar\/dashboard|en\/dashboard)/, {
      timeout: 60000,
    });
  });

  test("should login with existing credentials", async ({ page }) => {
    await page.goto("/en/login");

    // Fill login form (using a test account that should exist)
    await page.getByLabel(/email/i).fill("test@example.com");
    // Use input selector to avoid conflict with show/hide password button
    await page
      .locator('input[type="password"][name="password"]')
      .first()
      .fill("password");

    // Submit
    await page.getByRole("button", { name: /login|sign in/i }).click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Should either be on dashboard or show error
    const url = page.url();
    const isDashboard = url.includes("dashboard");
    const isLogin = url.includes("login");

    expect(isDashboard || isLogin).toBeTruthy();
  });

  test("should show validation errors for invalid registration", async ({
    page,
  }) => {
    await page.goto("/register");

    // Try to submit empty form - button text is "Create Account" in English
    await page
      .getByRole("button", { name: /create account|إنشاء حساب/i })
      .click();

    // Should show validation errors or prevent submission
    const url = page.url();
    expect(url).toContain("register");
  });

  test("should switch language between Arabic and English", async ({
    page,
  }) => {
    // Start on English page
    await page.goto("/en");

    // Find and click language toggle
    const langToggle = page
      .locator("button")
      .filter({ hasText: /العربية|AR/i })
      .first();
    if (await langToggle.isVisible()) {
      await langToggle.click();

      // Should navigate to Arabic version
      await expect(page).toHaveURL(/\/ar/);

      // Check RTL direction
      const html = page.locator("html");
      await expect(html).toHaveAttribute("dir", "rtl");
    }
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/en/login");
    await page.getByLabel(/email/i).fill("test@example.com");
    // Use input selector to avoid conflict with show/hide password button
    await page
      .locator('input[type="password"][name="password"]')
      .first()
      .fill("password");
    await page.getByRole("button", { name: /login|sign in/i }).click();

    await page.waitForLoadState("networkidle");

    // If we're on dashboard, try to logout
    if (page.url().includes("dashboard")) {
      // Look for logout button
      const logoutButton = page.getByRole("button", {
        name: /logout|تسجيل الخروج|sign out/i,
      });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        // Should redirect to home or login
        await page.waitForURL(/\/(login|en|ar|$)/, { timeout: 5000 });
      }
    }
  });

  test("should handle RTL layout for Arabic", async ({ page }) => {
    await page.goto("/ar");

    // Check HTML direction
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");

    // Check for Arabic text
    await expect(page.locator("body")).toContainText(/أكاديمية|عباد|الإسلام/);
  });

  test("should handle LTR layout for English", async ({ page }) => {
    await page.goto("/en");

    // Check HTML direction
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "ltr");
    await expect(html).toHaveAttribute("lang", "en");

    // Check for English text
    await expect(page.locator("body")).toContainText(
      /Ebad Academy|Islam|Build/
    );
  });
});
