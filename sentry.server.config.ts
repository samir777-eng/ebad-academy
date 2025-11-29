// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a83f69b727247869794ef2256ec1c817@o4510263942709248.ingest.us.sentry.io/4510446649540608",

  // Adjust sample rate for production (1.0 = 100% of transactions)
  // In production, you may want to reduce this to 0.1 (10%) to reduce costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false, // Changed to false for privacy

  // Set environment
  environment: process.env.NODE_ENV || "development",

  // Filter out errors we don't want to track
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Ignore specific error types
    if (error instanceof Error) {
      // Ignore network errors
      if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        return null;
      }

      // Ignore cancelled requests
      if (
        error.message.includes("AbortError") ||
        error.message.includes("cancelled")
      ) {
        return null;
      }
    }

    return event;
  },

  // Filter out breadcrumbs we don't need
  beforeBreadcrumb(breadcrumb) {
    // Don't send console logs as breadcrumbs
    if (breadcrumb.category === "console") {
      return null;
    }
    return breadcrumb;
  },
});
