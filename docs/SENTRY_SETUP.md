# Sentry Error Tracking Setup

## Overview

Sentry is configured for comprehensive error tracking and monitoring in production. This document explains the setup, configuration, and usage.

## 🎯 What's Configured

### 1. **Sentry SDK Installation**

- Package: `@sentry/nextjs` (latest version)
- Installed via Sentry wizard
- Zero vulnerabilities

### 2. **Configuration Files**

#### Server-Side Configuration (`sentry.server.config.ts`)

- Tracks server-side errors
- Sample rate: 100% in development, 10% in production
- Filters out development errors
- Ignores network errors and cancelled requests
- Privacy-focused (PII disabled)

#### Edge Runtime Configuration (`sentry.edge.config.ts`)

- Tracks middleware and edge route errors
- Same filtering and sampling as server config
- Optimized for edge runtime

#### Client-Side Instrumentation (`instrumentation-client.ts`)

- Tracks client-side errors
- Enables Session Replay (video-like error reproduction)
- Performance monitoring enabled

#### Server Instrumentation (`instrumentation.ts`)

- Initializes Sentry on server startup
- Registers server-side error tracking

### 3. **Error Boundaries Integration**

Both `ErrorBoundary.tsx` and `error-boundary.tsx` are integrated with Sentry:

- Automatically captures React component errors
- Sends errors to Sentry with component stack traces
- Logs to console in development only
- Shows user-friendly error UI

### 4. **Global Error Handler**

`app/global-error.tsx` catches unhandled errors:

- Captures exceptions with Sentry
- Displays generic error page
- Works across the entire application

## 🔧 Configuration Details

### Error Filtering

**Errors Ignored:**

- All errors in development environment
- Network errors (NetworkError, Failed to fetch)
- Cancelled requests (AbortError, cancelled)
- Console logs (not sent as breadcrumbs)

### Sampling Rates

**Development:**

- Traces: 100% (all transactions tracked)
- Errors: 0% (filtered out by `beforeSend`)

**Production:**

- Traces: 10% (to reduce costs)
- Errors: 100% (all errors tracked)

### Privacy Settings

- `sendDefaultPii: false` - User PII is NOT sent to Sentry
- Only error messages and stack traces are sent
- No user emails, IPs, or personal data

## 🧪 Testing Sentry

### ⚠️ Important: Development vs Production Behavior

**In Development Mode (NODE_ENV=development):**

- ❌ Errors are **NOT sent to Sentry** (filtered by `beforeSend` returning `null`)
- ✅ This is **intentional** to save Sentry quota and reduce noise
- ⚠️ You'll see a red error message: "network requests to Sentry are being blocked"
- ✅ This message means our filtering is **working correctly**!
- 💡 Errors are still logged to browser console for local debugging

**In Production Mode (NODE_ENV=production):**

- ✅ All errors are sent to Sentry (100% sample rate)
- ✅ Session replays recorded (10% of sessions, 100% of error sessions)
- ✅ Performance traces sampled at 10%
- ✅ Full error tracking and monitoring active

### Test Page

**URLs:**

- Arabic: `http://localhost:3000/ar/sentry-example-page`
- English: `http://localhost:3000/en/sentry-example-page`

**Features:**

1. Test button to trigger sample errors
2. Tests both frontend and backend error tracking
3. Checks Sentry connectivity
4. Shows success/error messages

**Test API Route:**

- Endpoint: `/api/sentry-example-api`
- Throws sample backend error
- Tests server-side error tracking

### Manual Testing (Development)

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Visit test page:**

   ```
   http://localhost:3000/ar/sentry-example-page
   ```

3. **Click "Throw Sample Error" button**

   - ⚠️ You'll see: "network requests to Sentry are being blocked"
   - ✅ This is **expected** - errors are filtered in development
   - 💡 Check browser console to see the error logged locally

4. **Expected behavior:**
   - Error appears in browser console
   - Red warning message about blocked requests
   - No errors sent to Sentry dashboard

### Manual Testing (Production)

1. **Deploy to production** (Vercel, etc.)

2. **Visit test page in production:**

   ```
   https://your-domain.com/ar/sentry-example-page
   ```

3. **Click "Throw Sample Error" button**

   - ✅ Errors will be sent to Sentry
   - ✅ No blocking message

4. **Check Sentry dashboard:**
   - Visit: https://barbarossa.sentry.io/issues/?project=4510446649540608
   - ✅ Errors should appear within seconds
   - You should see the error appear (if not in development mode)

## 📊 Sentry Dashboard

**Project:** barbarossa/javascript-nextjs
**Issues Page:** https://barbarossa.sentry.io/issues/?project=4510446649540608

**Features Available:**

- Error tracking with stack traces
- Performance monitoring
- Session Replay (video-like reproduction)
- Application logs
- Release tracking

## 🚀 Production Deployment

### Environment Variables

**Required:**

- DSN is already configured in `sentry.*.config.ts` files
- No additional environment variables needed

**Optional (for source maps):**

- `SENTRY_AUTH_TOKEN` - Stored in `.env.sentry-build-plugin` (gitignored)
- `SENTRY_ORG` - Your Sentry organization name
- `SENTRY_PROJECT` - Your Sentry project name

### Vercel Integration

**Recommended:** Use Sentry Vercel Integration

- URL: https://vercel.com/integrations/sentry
- Automatically sets up auth token for deployments
- Enables source map uploading
- Simplifies configuration

### Source Maps

Source maps are automatically uploaded during build:

- Configured in `next.config.ts`
- Uses Sentry webpack plugin
- Helps debug minified production code
- Shows original source code in Sentry

## 🔍 Monitoring Best Practices

### 1. **Check Sentry Regularly**

- Review errors daily in production
- Set up email/Slack alerts for critical errors
- Monitor error trends and patterns

### 2. **Use Releases**

- Tag deployments with release versions
- Track which errors appear in which releases
- Easier to identify regressions

### 3. **Add Context to Errors**

- Use `Sentry.setContext()` to add custom data
- Tag errors with user roles, features, etc.
- Makes debugging easier

### 4. **Performance Monitoring**

- Review slow transactions
- Identify performance bottlenecks
- Optimize based on real user data

## 📝 Example: Manual Error Tracking

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code here
  riskyOperation();
} catch (error) {
  // Capture error with additional context
  Sentry.captureException(error, {
    tags: {
      feature: "quiz-submission",
      userId: user.id,
    },
    contexts: {
      quiz: {
        lessonId: lesson.id,
        score: score,
      },
    },
  });

  // Show user-friendly error message
  toast.error("Failed to submit quiz. Please try again.");
}
```

## 🛠️ Troubleshooting

### Errors Not Appearing in Sentry

**Check:**

1. Are you in development mode? (Errors are filtered out)
2. Is the error being caught by an error boundary?
3. Is the error type being filtered out?
4. Check browser console for Sentry connectivity issues

### Source Maps Not Working

**Solutions:**

1. Ensure `SENTRY_AUTH_TOKEN` is set
2. Check `.env.sentry-build-plugin` exists
3. Verify Sentry webpack plugin in `next.config.ts`
4. Use Vercel Sentry integration

### High Sentry Costs

**Reduce:**

1. Lower `tracesSampleRate` (currently 10% in production)
2. Add more error filters in `beforeSend`
3. Filter out noisy errors
4. Use Sentry's quota management

## 📚 Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Next.js Integration:** https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **Error Filtering:** https://docs.sentry.io/platforms/javascript/configuration/filtering/
- **Performance Monitoring:** https://docs.sentry.io/platforms/javascript/performance/

## ✅ Summary

Sentry is fully configured and ready for production:

- ✅ SDK installed and configured
- ✅ Error boundaries integrated
- ✅ Error filtering configured
- ✅ Privacy settings optimized
- ✅ Test page available
- ✅ Documentation complete
- ✅ Production-ready

**Next Steps:**

1. Test the error tracking on `/sentry-example-page`
2. Deploy to production
3. Set up Sentry alerts
4. Monitor errors regularly
