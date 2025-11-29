// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a83f69b727247869794ef2256ec1c817@o4510263942709248.ingest.us.sentry.io/4510446649540608",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Sampling rates - higher in development for testing, lower in production for cost optimization
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Privacy: Do NOT send user PII (Personally Identifiable Information)
  sendDefaultPii: false,

  // Session Replay sampling
  // 10% of sessions will be recorded in both dev and production
  replaysSessionSampleRate: 0.1,

  // 100% of sessions with errors will be recorded
  replaysOnErrorSampleRate: 1.0,

  // Filter out errors before sending to Sentry
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Don't send errors in development to save quota
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Filter out network errors and cancelled requests
    if (error instanceof Error) {
      if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        return null;
      }

      if (
        error.message.includes("AbortError") ||
        error.message.includes("cancelled")
      ) {
        return null;
      }
    }

    return event;
  },

  // Filter breadcrumbs to reduce noise
  beforeBreadcrumb(breadcrumb) {
    // Don't send console logs as breadcrumbs
    if (breadcrumb.category === "console") {
      return null;
    }
    return breadcrumb;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
