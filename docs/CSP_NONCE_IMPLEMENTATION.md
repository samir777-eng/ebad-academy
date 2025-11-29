# CSP Nonce Implementation Guide

## Overview

This document provides guidance on implementing nonce-based Content Security Policy (CSP) in the Ebad Academy application using Next.js 16 App Router.

## Current CSP Configuration

The application currently uses a CSP with `unsafe-inline` for scripts and styles:

```typescript
// next.config.ts
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://vercel.live",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
}
```

## Why Not Implement Nonces Now?

### 1. **Performance Impact**

Nonce-based CSP requires **dynamic rendering** for all pages:
- ✅ **Current:** Pages can be statically generated and cached
- ❌ **With Nonces:** All pages must be server-rendered on every request
- **Impact:** Slower page loads, higher server costs, no CDN caching

### 2. **Implementation Complexity**

Requires significant architectural changes:
- Create `proxy.ts` file for nonce generation
- Modify root layout to read nonces from headers
- Pass nonces to all `<script>` and `<style>` tags
- Update all third-party script integrations
- Test all pages for CSP violations

### 3. **Current Security is Adequate**

The current CSP already provides strong security:
- ✅ Blocks external scripts (only 'self' allowed)
- ✅ Prevents XSS attacks from external sources
- ✅ Restricts frame embedding
- ✅ Enforces HTTPS
- ✅ Blocks object/embed tags

### 4. **Next.js Limitations**

- `unsafe-eval` is **required** by Next.js and cannot be removed
- Tailwind CSS generates inline styles that need `unsafe-inline`
- Removing `unsafe-inline` for styles would break the UI

## When to Implement Nonces

Consider implementing nonces when:

1. **High-Security Requirements:** Application handles extremely sensitive data
2. **Compliance Needs:** Regulatory requirements mandate nonce-based CSP
3. **Static Generation Not Needed:** App is fully dynamic anyway
4. **Performance Budget Allows:** Can afford server-side rendering overhead

## Implementation Steps (Future)

### Step 1: Create Proxy File

Create `proxy.ts` in the root directory:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  })
}
```

### Step 2: Update Root Layout

Modify `app/layout.tsx` to read the nonce:

```typescript
import { headers } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce')

  return (
    <html suppressHydrationWarning>
      <body className="antialiased">
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  )
}
```

### Step 3: Pass Nonce to Scripts

Update all script tags to include the nonce:

```typescript
<Script
  src="https://example.com/script.js"
  strategy="afterInteractive"
  nonce={nonce}
/>
```

### Step 4: Remove CSP from next.config.ts

Remove the CSP header from `next.config.ts` since it's now handled by `proxy.ts`.

### Step 5: Test Thoroughly

- Test all pages for CSP violations
- Check browser console for errors
- Verify third-party scripts work
- Test in production environment

## Alternative: Subresource Integrity (SRI)

Next.js 16 offers an experimental SRI feature that provides security without forcing dynamic rendering:

```typescript
// next.config.ts
export default {
  experimental: {
    sri: {
      algorithm: 'sha256', // or 'sha384' or 'sha512'
    },
  },
}
```

**Benefits:**
- ✅ Static generation still works
- ✅ CDN caching still works
- ✅ Better performance than nonces
- ✅ Build-time security

**Limitations:**
- ⚠️ Experimental feature (may change)
- ⚠️ Webpack only (not Turbopack)
- ⚠️ App Router only

## Recommendation

**For Ebad Academy:**

1. **Keep current CSP** - Provides adequate security
2. **Monitor for SRI stability** - Consider when it's stable
3. **Implement nonces only if** - Compliance requires it

## References

- [Next.js CSP Documentation](https://nextjs.org/docs/app/guides/content-security-policy)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

