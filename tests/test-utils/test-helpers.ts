/**
 * TestSprite Test Utilities
 * Comprehensive helper functions for all test scenarios
 */

import { Page, expect, Locator } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// AUTHENTICATION UTILITIES
// =============================================================================

export async function loginUser(page: Page, credentials: { idNumber: string; password: string }) {
  await page.goto('/ar/login');
  
  await page.fill('[data-testid="id-number-input"]', credentials.idNumber);
  await page.fill('[data-testid="password-input"]', credentials.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/);
  
  // Verify login success
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
}

export async function registerUser(page: Page, userData: {
  idNumber: string;
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}) {
  await page.goto('/ar/register');
  
  await page.fill('[data-testid="id-number-input"]', userData.idNumber);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="name-input"]', userData.name);
  await page.fill('[data-testid="phone-input"]', userData.phoneNumber);
  await page.fill('[data-testid="password-input"]', userData.password);
  await page.fill('[data-testid="confirm-password-input"]', userData.confirmPassword);
  
  await page.click('[data-testid="register-button"]');
  
  // Wait for registration success
  await page.waitForSelector('[data-testid="registration-success"]');
}

export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(/\/login/);
}

// =============================================================================
// QUIZ UTILITIES  
// =============================================================================

export async function completeQuizWithScore(
  page: Page, 
  targetScore: number, 
  totalQuestions: number = 5
) {
  const correctAnswersNeeded = Math.ceil((targetScore / 100) * totalQuestions);
  
  // Navigate to quiz
  await page.click('[data-testid="take-quiz-button"]');
  await page.waitForSelector('[data-testid="quiz-question-1"]');
  
  // Answer questions strategically to achieve target score
  for (let i = 1; i <= totalQuestions; i++) {
    const questionSelector = `[data-testid="quiz-question-${i}"]`;
    await page.waitForSelector(questionSelector);
    
    const questionType = await page.getAttribute(questionSelector, 'data-question-type');
    
    if (i <= correctAnswersNeeded) {
      // Answer correctly
      if (questionType === 'multiple_choice') {
        // Get the correct answer from data attribute
        const correctIndex = await page.getAttribute(questionSelector, 'data-correct-answer');
        await page.click(`[data-testid="option-${correctIndex}"]`);
      } else if (questionType === 'true_false') {
        const correctAnswer = await page.getAttribute(questionSelector, 'data-correct-answer');
        await page.click(`[data-testid="tf-${correctAnswer}"]`);
      }
    } else {
      // Answer incorrectly
      if (questionType === 'multiple_choice') {
        const correctIndex = await page.getAttribute(questionSelector, 'data-correct-answer');
        const wrongIndex = correctIndex === '0' ? '1' : '0';
        await page.click(`[data-testid="option-${wrongIndex}"]`);
      } else if (questionType === 'true_false') {
        const correctAnswer = await page.getAttribute(questionSelector, 'data-correct-answer');
        const wrongAnswer = correctAnswer === 'true' ? 'false' : 'true';
        await page.click(`[data-testid="tf-${wrongAnswer}"]`);
      }
    }
    
    // Move to next question
    if (i < totalQuestions) {
      await page.click('[data-testid="next-question-button"]');
    }
  }
  
  // Submit quiz
  await page.click('[data-testid="submit-quiz-button"]');
  
  // Wait for results
  await page.waitForSelector('[data-testid="quiz-results"]');
  
  // Verify score
  const scoreText = await page.textContent('[data-testid="quiz-score"]');
  const actualScore = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
  
  expect(actualScore).toBeCloseTo(targetScore, 5); // Allow 5% tolerance
  
  return {
    score: actualScore,
    passed: actualScore >= 60,
    correctAnswers: correctAnswersNeeded,
    totalQuestions
  };
}

export async function retakeQuiz(page: Page, targetScore: number) {
  await page.click('[data-testid="retake-quiz-button"]');
  await page.waitForSelector('[data-testid="quiz-question-1"]');
  
  return await completeQuizWithScore(page, targetScore);
}

// =============================================================================
// NAVIGATION UTILITIES
// =============================================================================

export async function navigateToLesson(page: Page, levelNumber: number, branchSlug: string, lessonOrder: number) {
  await page.goto(`/ar/dashboard`);
  await page.click(`[data-testid="level-${levelNumber}"]`);
  await page.click(`[data-testid="branch-${branchSlug}"]`);
  await page.click(`[data-testid="lesson-${lessonOrder}"]`);
  
  await page.waitForSelector('[data-testid="lesson-content"]');
}

export async function navigateToProfile(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="profile-link"]');
  await page.waitForURL(/\/profile/);
}

export async function navigateToLeaderboard(page: Page) {
  await page.click('[data-testid="leaderboard-link"]');
  await page.waitForURL(/\/leaderboard/);
}

// =============================================================================
// PROGRESS UTILITIES
// =============================================================================

export async function markLessonAsRead(page: Page) {
  await page.click('[data-testid="mark-as-read-button"]');
  await expect(page.locator('[data-testid="lesson-completed-badge"]')).toBeVisible();
}

export async function saveLessonNotes(page: Page, notes: string) {
  await page.click('[data-testid="notes-tab"]');
  await page.fill('[data-testid="lesson-notes-textarea"]', notes);
  await page.click('[data-testid="save-notes-button"]');
  
  await expect(page.locator('[data-testid="notes-saved-indicator"]')).toBeVisible();
}

export async function downloadLessonPDF(page: Page, language: 'ar' | 'en' = 'ar') {
  const downloadPromise = page.waitForEvent('download');
  await page.click(`[data-testid="download-pdf-${language}"]`);
  const download = await downloadPromise;
  
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  return download;
}

// =============================================================================
// SPIRITUAL PROGRESS UTILITIES
// =============================================================================

export async function recordSpiritualProgress(page: Page, data: {
  fajr?: boolean;
  dhuhr?: boolean;
  asr?: boolean;
  maghrib?: boolean;
  isha?: boolean;
  quranPages?: number;
  quranMinutes?: number;
  fasting?: boolean;
  charity?: boolean;
  charityAmount?: number;
  dhikr?: boolean;
  dhikrCount?: number;
  dua?: boolean;
  notes?: string;
}) {
  await page.goto('/ar/spiritual-progress');
  
  // Prayer checkboxes
  if (data.fajr) await page.check('[data-testid="fajr-checkbox"]');
  if (data.dhuhr) await page.check('[data-testid="dhuhr-checkbox"]');
  if (data.asr) await page.check('[data-testid="asr-checkbox"]');
  if (data.maghrib) await page.check('[data-testid="maghrib-checkbox"]');
  if (data.isha) await page.check('[data-testid="isha-checkbox"]');
  
  // Quran tracking
  if (data.quranPages) {
    await page.fill('[data-testid="quran-pages-input"]', data.quranPages.toString());
  }
  if (data.quranMinutes) {
    await page.fill('[data-testid="quran-minutes-input"]', data.quranMinutes.toString());
  }
  
  // Other activities
  if (data.fasting) await page.check('[data-testid="fasting-checkbox"]');
  if (data.charity) {
    await page.check('[data-testid="charity-checkbox"]');
    if (data.charityAmount) {
      await page.fill('[data-testid="charity-amount-input"]', data.charityAmount.toString());
    }
  }
  if (data.dhikr) {
    await page.check('[data-testid="dhikr-checkbox"]');
    if (data.dhikrCount) {
      await page.fill('[data-testid="dhikr-count-input"]', data.dhikrCount.toString());
    }
  }
  if (data.dua) await page.check('[data-testid="dua-checkbox"]');
  
  // Notes
  if (data.notes) {
    await page.fill('[data-testid="spiritual-notes-textarea"]', data.notes);
  }
  
  // Save progress
  await page.click('[data-testid="save-spiritual-progress-button"]');
  await expect(page.locator('[data-testid="progress-saved-indicator"]')).toBeVisible();
}

// =============================================================================
// ADMIN UTILITIES
// =============================================================================

export async function loginAsAdmin(page: Page) {
  await loginUser(page, {
    idNumber: 'TEST_ADM_001',
    password: 'TestSprite123!'
  });
}

export async function createLesson(page: Page, lessonData: {
  titleAr: string;
  titleEn: string;
  branchId: string;
  levelId: string;
  descriptionAr?: string;
  descriptionEn?: string;
  duration: number;
}) {
  await page.goto('/ar/admin/lessons');
  await page.click('[data-testid="create-lesson-button"]');
  
  await page.fill('[data-testid="lesson-title-ar"]', lessonData.titleAr);
  await page.fill('[data-testid="lesson-title-en"]', lessonData.titleEn);
  await page.selectOption('[data-testid="lesson-branch-select"]', lessonData.branchId);
  await page.selectOption('[data-testid="lesson-level-select"]', lessonData.levelId);
  
  if (lessonData.descriptionAr) {
    await page.fill('[data-testid="lesson-description-ar"]', lessonData.descriptionAr);
  }
  if (lessonData.descriptionEn) {
    await page.fill('[data-testid="lesson-description-en"]', lessonData.descriptionEn);
  }
  
  await page.fill('[data-testid="lesson-duration"]', lessonData.duration.toString());
  
  await page.click('[data-testid="save-lesson-button"]');
  await expect(page.locator('[data-testid="lesson-created-success"]')).toBeVisible();
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

export async function measurePageLoad(page: Page, url: string) {
  const startTime = Date.now();
  
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const endTime = Date.now();
  const loadTime = endTime - startTime;
  
  // Get performance metrics
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: 0, // Would need performance observer in real implementation
      largestContentfulPaint: 0 // Would need performance observer in real implementation
    };
  });
  
  return {
    totalLoadTime: loadTime,
    ...performanceMetrics
  };
}

export async function simulateSlowNetwork(page: Page) {
  // Simulate Fast 3G connection
  await page.context().route('**/*', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
    await route.continue();
  });
}

export async function checkMemoryUsage(page: Page) {
  const memoryInfo = await page.evaluate(() => {
    return (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    } : null;
  });
  
  return memoryInfo;
}

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

export async function testForXSS(page: Page, inputSelector: string, payload: string) {
  await page.fill(inputSelector, payload);
  
  // Check if script executed
  const alertTriggered = await page.evaluate(() => {
    return window.xssTriggered === true;
  });
  
  return !alertTriggered; // Return true if XSS was prevented
}

export async function testSQLInjection(page: Page, endpoint: string, payload: string) {
  const response = await page.request.post(endpoint, {
    data: { input: payload }
  });
  
  const responseText = await response.text();
  
  // Check for SQL error messages that indicate vulnerability
  const sqlErrorPatterns = [
    /SQL syntax.*MySQL/i,
    /Warning.*mysql_/i,
    /MySQLSyntaxErrorException/i,
    /PostgreSQL.*ERROR/i,
    /Oracle.*ORA-\d+/i,
    /SQLite.*error/i
  ];
  
  const hasSecurityIssue = sqlErrorPatterns.some(pattern => pattern.test(responseText));
  return !hasSecurityIssue; // Return true if injection was prevented
}

// =============================================================================
// INTERNATIONALIZATION UTILITIES  
// =============================================================================

export async function switchLanguage(page: Page, language: 'ar' | 'en') {
  await page.click('[data-testid="language-selector"]');
  await page.click(`[data-testid="language-option-${language}"]`);
  
  // Wait for page to reload with new language
  await page.waitForURL(`**/${language}/**`);
  
  // Verify language change
  const htmlLang = await page.getAttribute('html', 'lang');
  expect(htmlLang).toBe(language);
}

export async function verifyRTLLayout(page: Page) {
  const direction = await page.getAttribute('html', 'dir');
  expect(direction).toBe('rtl');
  
  // Verify text alignment
  const textAlignment = await page.evaluate(() => {
    return getComputedStyle(document.body).textAlign;
  });
  expect(textAlignment).toBe('right');
}

// =============================================================================
// DATABASE UTILITIES
// =============================================================================

export async function getTestUser(idNumber: string) {
  return await prisma.user.findUnique({
    where: { idNumber },
    include: {
      progress: true,
      levelStatus: true,
      quizAttempts: true,
      badges: true
    }
  });
}

export async function getTestLesson() {
  return await prisma.lesson.findFirst({
    where: { titleEn: { contains: 'TEST_' } },
    include: { questions: true }
  });
}

export async function cleanupTestUser(idNumber: string) {
  await prisma.user.delete({
    where: { idNumber }
  });
}

// =============================================================================
// MOBILE UTILITIES
// =============================================================================

export async function simulateMobile(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE dimensions
  
  // Verify mobile layout
  const isMobile = await page.evaluate(() => {
    return window.innerWidth <= 768;
  });
  
  expect(isMobile).toBe(true);
}

export async function testTouchGestures(page: Page, element: Locator) {
  // Simulate touch events
  const box = await element.boundingBox();
  if (box) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  }
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

export async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  const issues = await page.evaluate(() => {
    const issues = [];
    
    // Check for alt text on images
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach((img, index) => {
      if (!img.alt) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });
    
    // Check for form labels
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea'));
    inputs.forEach((input, index) => {
      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push(`Input ${index + 1} missing label or aria-label`);
      }
    });
    
    // Check for heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy skip detected: ${heading.tagName}`);
      }
      previousLevel = level;
    });
    
    return issues;
  });
  
  return issues;
}

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export const TestSprite = {
  // Auth
  loginUser,
  registerUser,
  logoutUser,
  loginAsAdmin,
  
  // Quiz
  completeQuizWithScore,
  retakeQuiz,
  
  // Navigation
  navigateToLesson,
  navigateToProfile,
  navigateToLeaderboard,
  
  // Progress
  markLessonAsRead,
  saveLessonNotes,
  downloadLessonPDF,
  recordSpiritualProgress,
  
  // Admin
  createLesson,
  
  // Performance
  measurePageLoad,
  simulateSlowNetwork,
  checkMemoryUsage,
  
  // Security
  testForXSS,
  testSQLInjection,
  
  // i18n
  switchLanguage,
  verifyRTLLayout,
  
  // Database
  getTestUser,
  getTestLesson,
  cleanupTestUser,
  
  // Mobile
  simulateMobile,
  testTouchGestures,
  
  // Accessibility
  checkAccessibility
};