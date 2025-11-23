import { test as base } from "@playwright/test";

// Extend base test with custom fixtures
export const test = base.extend({
  // Add custom fixtures here if needed
});

export { expect } from "@playwright/test";

// Helper functions for tests
export async function loginAsUser(
  page: any,
  email: string = "test@example.com",
  password: string = "password"
) {
  await page.goto("/en/login");
  await page.getByLabel(/email/i).fill(email);
  // Use input selector to avoid conflict with show/hide password button
  await page
    .locator('input[type="password"][name="password"]')
    .first()
    .fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForLoadState("networkidle");
}

export async function loginAsAdmin(page: any) {
  await loginAsUser(page, "admin@example.com", "admin123");
}

export async function createTestUser(page: any) {
  const timestamp = Date.now();
  const email = `test${timestamp}@example.com`;
  const password = "TestPassword123!";
  const name = `Test User ${timestamp}`;
  const phoneNumber = `+201001234567`; // Egyptian phone number

  await page.goto("/register");
  await page.getByLabel(/name|الاسم/i).fill(name);
  await page.getByLabel(/email|البريد/i).fill(email);

  // Fill phone number
  const phoneInput = page.locator('input[name="phoneNumber"]');
  await phoneInput.fill(phoneNumber);

  // Use input selector to avoid conflict with show/hide password button
  await page
    .locator('input[type="password"][name="password"]')
    .first()
    .fill(password);
  await page
    .locator('input[type="password"][name="confirmPassword"]')
    .first()
    .fill(password);
  await page.getByRole("button", { name: /register|التسجيل|sign up/i }).click();

  return { email, password, name };
}

export async function logout(page: any) {
  const logoutButton = page.getByRole("button", {
    name: /logout|تسجيل الخروج|sign out/i,
  });
  if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForLoadState("networkidle");
  }
}

export async function switchLanguage(page: any, targetLang: "ar" | "en") {
  const currentUrl = page.url();
  const newUrl = currentUrl.replace(/\/(ar|en)\//, `/${targetLang}/`);
  await page.goto(newUrl);
}

export async function waitForDashboard(page: any) {
  // Wait for dashboard URL - removed networkidle requirement as it's too strict
  await page.waitForURL(/dashboard/, { timeout: 60000 });
  // Wait for DOM to be ready instead of networkidle
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
}

export async function navigateToLesson(page: any, lessonId: number) {
  await page.goto(`/en/lesson/${lessonId}`);
  await page.waitForLoadState("networkidle");
}

export async function navigateToQuiz(page: any, lessonId: number) {
  await page.goto(`/en/quiz/${lessonId}`);
  await page.waitForLoadState("networkidle");
}

export async function answerQuizQuestion(page: any, answerIndex: number = 0) {
  const answerButtons = page
    .locator("button")
    .filter({ hasText: /Option|الخيار/ });
  const count = await answerButtons.count();

  if (count > answerIndex) {
    await answerButtons.nth(answerIndex).click();
    await page.waitForTimeout(500);
  }
}

export async function submitQuiz(page: any) {
  const submitButton = page.getByRole("button", {
    name: /submit|إرسال|finish|إنهاء/i,
  });
  if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}

export async function checkIfElementExists(
  page: any,
  selector: string
): Promise<boolean> {
  return (await page.locator(selector).count()) > 0;
}

export async function getBodyText(page: any): Promise<string> {
  return (await page.locator("body").textContent()) || "";
}

export async function takeScreenshotOnFailure(page: any, testInfo: any) {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot();
    await testInfo.attach("screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  }
}

// Database helpers (if needed)
export async function cleanupTestData() {
  // Add database cleanup logic here if needed
  // This would use Prisma to clean up test data
}

export async function seedTestData() {
  // Add test data seeding logic here if needed
}
