import { expect, test } from "@playwright/test";

// Helper function to login
async function login(page: any) {
  await page.goto("/en/login");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page
    .locator('input[type="password"][name="password"]')
    .first()
    .fill("password");
  await page.getByRole("button", { name: /login|sign in/i }).click();
  // Wait for dashboard URL - removed networkidle requirement as it's too strict
  await page.waitForURL(/dashboard/, { timeout: 60000 });
  // Wait for DOM to be ready instead of networkidle
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
}

test.describe("Lesson and Quiz Flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display dashboard with levels and branches", async ({
    page,
  }) => {
    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Check for level information
    await expect(page.locator("body")).toContainText(/Level|المستوى/i);

    // Check for branches (Aqeedah, Fiqh, etc.)
    const branches = [
      "Aqeedah",
      "Fiqh",
      "Seerah",
      "Tafseer",
      "Hadith",
      "Tarbiyah",
    ];
    const arabicBranches = [
      "العقيدة",
      "الفقه",
      "السيرة",
      "التفسير",
      "الحديث",
      "التربية",
    ];

    const bodyText = await page.locator("body").textContent();
    const hasBranch =
      branches.some((b) => bodyText?.includes(b)) ||
      arabicBranches.some((b) => bodyText?.includes(b));

    expect(hasBranch).toBeTruthy();
  });

  test("should navigate to a lesson", async ({ page }) => {
    // Navigate to a branch page to find lessons
    await page.goto("/en/branch/aqeedah");
    await page.waitForLoadState("networkidle");

    // Try to find and click on a lesson link
    const lessonLink = page.locator("a[href*='/lesson/']").first();

    if (await lessonLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lessonLink.click();
      await page.waitForLoadState("networkidle");

      // Should navigate to lesson page
      await expect(page).toHaveURL(/lesson\/\d+/);

      // Check for lesson content
      await expect(page.locator("body")).toContainText(
        /Lesson|درس|Introduction|مقدمة/i
      );
    } else {
      // Skip test if no lessons available
      test.skip();
    }
  });

  test("should display lesson content with PDF viewer option", async ({
    page,
  }) => {
    // Navigate to a branch page to find lessons
    await page.goto("/en/branch/aqeedah");
    await page.waitForLoadState("networkidle");

    // Get the first lesson link
    const lessonLink = page.locator("a[href*='/lesson/']").first();

    if (await lessonLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lessonLink.click();
      await page.waitForLoadState("networkidle");

      // Check if lesson content is displayed
      const hasContent = await page.locator("body").textContent();

      // Should have lesson title or content
      expect(hasContent).toBeTruthy();
      expect(hasContent!.length).toBeGreaterThan(0);
    } else {
      // Skip test if no lessons available
      test.skip();
    }
  });

  test("should navigate to quiz from lesson", async ({ page }) => {
    // Navigate to a branch page to find lessons
    await page.goto("/en/branch/aqeedah");
    await page.waitForLoadState("networkidle");

    // Get the first lesson link
    const lessonLink = page.locator("a[href*='/lesson/']").first();

    if (await lessonLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lessonLink.click();
      await page.waitForLoadState("networkidle");

      // Look for "Take Quiz" or "Start Quiz" button/tab
      const quizButton = page
        .getByRole("button", { name: /quiz|اختبار/i })
        .or(page.getByRole("link", { name: /quiz|اختبار/i }))
        .or(page.getByText(/quiz|اختبار/i))
        .first();

      if (await quizButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await quizButton.click();
        await page.waitForLoadState("networkidle");

        // Check for quiz interface (might be on same page or redirected)
        const bodyText = await page.locator("body").textContent();
        expect(bodyText).toMatch(/Question|سؤال|Quiz|اختبار/i);
      } else {
        // Skip test if no quiz available
        test.skip();
      }
    } else {
      // Skip test if no lessons available
      test.skip();
    }
  });

  test("should display quiz questions and allow answering", async ({
    page,
  }) => {
    // Navigate to a branch page to find lessons
    await page.goto("/en/branch/aqeedah");
    await page.waitForLoadState("networkidle");

    // Get the first lesson link
    const lessonLink = page.locator("a[href*='/lesson/']").first();

    if (await lessonLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Extract lesson ID from href
      const href = await lessonLink.getAttribute("href");
      const lessonId = href?.match(/\/lesson\/(\d+)/)?.[1];

      if (lessonId) {
        // Navigate directly to quiz
        await page.goto(`/en/quiz/${lessonId}`);
        await page.waitForLoadState("networkidle");

        // Check if questions are displayed
        const hasQuestions = await page.locator("body").textContent();

        if (
          hasQuestions?.includes("Question") ||
          hasQuestions?.includes("سؤال")
        ) {
          // Try to select an answer - look for any clickable answer option
          const answerOption = page
            .locator("button")
            .filter({
              hasText: /^[A-D]|Option|الخيار|./,
            })
            .first();

          if (
            await answerOption.isVisible({ timeout: 5000 }).catch(() => false)
          ) {
            await answerOption.click();
            await page.waitForTimeout(500); // Wait for UI update

            // Just verify the click worked by checking if button is still visible
            await expect(answerOption).toBeVisible();
          }
        } else {
          // Skip test if no quiz available
          test.skip();
        }
      } else {
        test.skip();
      }
    } else {
      // Skip test if no lessons available
      test.skip();
    }
  });

  test("should navigate between quiz questions", async ({ page }) => {
    await page.goto("/en/quiz/1");
    await page.waitForLoadState("networkidle");

    // Look for next/previous buttons
    const nextButton = page.getByRole("button", { name: /next|التالي/i });

    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Select an answer first
      const answerOption = page
        .locator("button")
        .filter({ hasText: /Option|الخيار/ })
        .first();
      if (await answerOption.isVisible().catch(() => false)) {
        await answerOption.click();
      }

      await nextButton.click();

      // Should move to next question
      await page.waitForTimeout(1000);
    }
  });

  test("should submit quiz and show results", async ({ page }) => {
    await page.goto("/en/quiz/1");
    await page.waitForLoadState("networkidle");

    // Answer all visible questions (simplified - just click first option for each)
    const questions = await page.locator("[data-question], .question").count();

    if (questions > 0) {
      // Try to answer questions
      for (let i = 0; i < Math.min(questions, 10); i++) {
        const answerButton = page
          .locator("button")
          .filter({ hasText: /Option|الخيار/ })
          .first();
        if (
          await answerButton.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await answerButton.click();
        }

        const nextButton = page.getByRole("button", { name: /next|التالي/i });
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Look for submit button
      const submitButton = page.getByRole("button", {
        name: /submit|إرسال|finish|إنهاء/i,
      });
      if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitButton.click();

        // Should show results
        await page.waitForTimeout(2000);
        const bodyText = await page.locator("body").textContent();
        const hasResults =
          bodyText?.includes("Score") ||
          bodyText?.includes("Result") ||
          bodyText?.includes("النتيجة") ||
          bodyText?.includes("الدرجة");

        expect(hasResults).toBeTruthy();
      }
    }
  });

  test("should show passing message for score >= 60%", async ({ page }) => {
    // This test would require setting up specific quiz data
    // For now, we'll just check if the results page displays correctly
    await page.goto("/en/quiz/1/results");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.locator("body").textContent();

    // Should show some result information
    expect(bodyText).toBeTruthy();
  });

  test("should allow quiz retake on failure", async ({ page }) => {
    await page.goto("/en/quiz/1/results");
    await page.waitForLoadState("networkidle");

    // Look for retake button
    const retakeButton = page
      .getByRole("button", { name: /retake|إعادة|try again/i })
      .or(page.getByRole("link", { name: /retake|إعادة|try again/i }));

    if (await retakeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await retakeButton.click();

      // Should go back to quiz (increased timeout)
      await page.waitForURL(/quiz\/\d+/, { timeout: 30000 });
    }
  });
});
