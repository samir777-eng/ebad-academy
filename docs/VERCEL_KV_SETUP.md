# Vercel KV Database Setup Guide

## Overview

This guide walks you through creating a Vercel KV (Redis-compatible) database for the Ebad Academy application. The KV database is used for production-ready rate limiting in serverless environments.

## Prerequisites

- ✅ Vercel account (free or paid)
- ✅ Project deployed to Vercel (or ready to deploy)
- ✅ Access to Vercel dashboard

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in to your account
3. Navigate to your project (or create a new one)

### Step 2: Navigate to Storage Tab

1. In your project dashboard, click on the **"Storage"** tab in the top navigation
2. You'll see options for different storage types:
   - Postgres
   - Blob
   - **KV** ← Select this one
   - Edge Config

### Step 3: Create KV Database

1. Click **"Create Database"** button
2. Select **"KV"** (Redis-compatible key-value store)
3. Configure the database:
   - **Database Name:** `ebad-academy-kv` (or your preferred name)
   - **Region:** Choose the same region as your Postgres database
     - Recommended: `iad1` (Washington, D.C., USA) for US East
     - Or choose the region closest to your users
4. Click **"Create"** button

### Step 4: Connect to Project

1. After creation, you'll see the database details page
2. Click **"Connect Project"** button
3. Select your project from the dropdown
4. Choose the environment(s):
   - ✅ **Production** (required)
   - ✅ **Preview** (recommended)
   - ⚠️ **Development** (optional - local dev uses in-memory storage)
5. Click **"Connect"** button

### Step 5: Verify Environment Variables

Vercel will automatically add these environment variables to your project:

```bash
KV_REST_API_URL="https://your-kv-instance.kv.vercel-storage.com"
KV_REST_API_TOKEN="your-token-here"
KV_REST_API_READ_ONLY_TOKEN="your-readonly-token-here"
```

**To verify:**

1. Go to **Settings** → **Environment Variables**
2. Confirm the three KV variables are present
3. They should be set for Production (and Preview if you selected it)

### Step 6: Redeploy Your Application

**Important:** Environment variables are only available after redeployment.

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 7: Test Rate Limiting

After deployment, test that rate limiting works:

```bash
# Test login rate limiting (5 requests per 15 minutes)
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Results:**
- First 5 requests: Return 401 (Unauthorized - wrong password)
- 6th request: Return 429 (Too Many Requests - rate limited)

### Step 8: Monitor KV Usage

1. Go to **Storage** tab
2. Click on your KV database
3. View metrics:
   - **Requests:** Number of read/write operations
   - **Storage:** Amount of data stored
   - **Bandwidth:** Data transferred

## Pricing

### Free Tier (Hobby Plan)

- ✅ **30 GB bandwidth** per month
- ✅ **256 MB storage**
- ✅ **100,000 commands** per day
- ✅ Perfect for development and small applications

### Pro Plan

- ✅ **512 GB bandwidth** per month
- ✅ **512 MB storage**
- ✅ **Unlimited commands**
- ✅ $20/month

**For Ebad Academy:** Free tier should be sufficient for initial launch.

## Troubleshooting

### Issue: Environment variables not showing up

**Solution:**
1. Wait 1-2 minutes after connecting
2. Refresh the page
3. Check Settings → Environment Variables
4. Redeploy if still not visible

### Issue: Rate limiting not working

**Solution:**
1. Check that KV environment variables are set
2. Verify deployment includes the latest code
3. Check browser console for errors
4. Review deployment logs for KV connection errors

### Issue: "KV connection failed" error

**Solution:**
1. Verify KV_REST_API_URL is correct
2. Verify KV_REST_API_TOKEN is correct
3. Check that database is in the same region as your deployment
4. Ensure database is connected to the correct project

### Issue: Rate limiting works locally but not in production

**Solution:**
- Local development uses in-memory storage (by design)
- Production uses Vercel KV
- Verify environment variables are set in production
- Check deployment logs for KV errors

## Best Practices

1. **Same Region:** Always create KV in the same region as your Postgres database
2. **Monitor Usage:** Check KV metrics weekly to avoid hitting limits
3. **Backup Strategy:** KV is ephemeral - don't store critical data
4. **Rate Limit Tuning:** Adjust limits based on actual usage patterns
5. **Error Handling:** Application gracefully handles KV failures (fail-open)

## Next Steps

After setting up KV:

1. ✅ Test rate limiting in production
2. ✅ Monitor KV usage and performance
3. ✅ Adjust rate limits if needed
4. ✅ Set up alerts for high usage
5. ✅ Document any custom rate limit configurations

## References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis Commands Reference](https://redis.io/commands/)
- [Rate Limiting Best Practices](https://vercel.com/guides/rate-limiting-edge-middleware)

---

**Created:** 2025-11-28  
**Last Updated:** 2025-11-28  
**Status:** Production Ready

