/**
 * TEST INFRASTRUCTURE SETUP - TestSprite Requirements
 * 
 * This file provides:
 * 1. Enhanced test configuration
 * 2. Test data management 
 * 3. Reporting utilities
 * 4. CI/CD integration helpers
 * 5. Test reliability improvements
 */

import { defineConfig, devices } from '@playwright/test';

// Enhanced Playwright configuration for TestSprite requirements
export default defineConfig({
  // Test directory and patterns
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry configuration - important for TestSprite reliability
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI for better resource management
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration for comprehensive reporting
  reporter: [
    // HTML report for local development
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    
    // JUnit for CI/CD integration
    ['junit', { 
      outputFile: 'test-results/junit-results.xml' 
    }],
    
    // JSON for programmatic analysis
    ['json', { 
      outputFile: 'test-results/test-results.json' 
    }],
    
    // Line reporter for CI
    ['line']
  ],
  
  // Global test configuration
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Global test timeout
    actionTimeout: 15000,
    
    // Navigation timeout for slow networks
    navigationTimeout: 30000,
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Capture video on failure
    video: 'retain-on-failure',
    
    // Capture trace for debugging
    trace: 'retain-on-failure',
    
    // Ignore HTTPS errors in development
    ignoreHTTPSErrors: true,
    
    // Custom test data
    extraHTTPHeaders: {
      // Add authentication headers if needed
      'X-Test-Environment': process.env.NODE_ENV || 'test'
    }
  },

  // Projects for different browsers and configurations
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // TestSprite: Enhanced viewport for Islamic education content
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'firefox-desktop', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Mobile devices - critical for Muslim majority countries
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Common Android device in Muslim countries
      },
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        // Common iOS device globally  
      },
    },

    // Tablet testing
    {
      name: 'tablet-safari',
      use: { 
        ...devices['iPad Pro'],
      },
    },

    // RTL-specific testing for Arabic interface
    {
      name: 'rtl-testing',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
        timezoneId: 'Asia/Riyadh',
      },
      testMatch: '**/critical-priority.spec.ts',
    },

    // Performance testing configuration
    {
      name: 'performance-testing',
      use: {
        ...devices['Desktop Chrome'],
        // Slow down for performance testing
        launchOptions: {
          slowMo: 0,
        }
      },
      testMatch: '**/performance-comprehensive.spec.ts',
    },

    // Security testing configuration  
    {
      name: 'security-testing',
      use: {
        ...devices['Desktop Chrome'],
        // Enable additional security checks
        extraHTTPHeaders: {
          'X-Security-Test': 'true'
        }
      },
      testMatch: '**/security-comprehensive.spec.ts',
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/test-utils/global-setup'),
  globalTeardown: require.resolve('./tests/test-utils/global-teardown'),

  // Test output directories
  outputDir: 'test-results/artifacts',

  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Expect configuration
  expect: {
    // Global expect timeout
    timeout: 10000,
    
    // Screenshot comparison configuration
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 1000
    }
  },
});