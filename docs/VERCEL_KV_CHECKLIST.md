# Vercel KV Setup Checklist

Quick reference checklist for setting up Vercel KV database.

## Pre-Setup

- [ ] Vercel account created
- [ ] Project deployed to Vercel (or ready to deploy)
- [ ] Access to Vercel dashboard

## Setup Steps

### 1. Create KV Database

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Navigate to your project
- [ ] Click **Storage** tab
- [ ] Click **Create Database**
- [ ] Select **KV**
- [ ] Name: `ebad-academy-kv`
- [ ] Region: Same as Postgres (e.g., `iad1`)
- [ ] Click **Create**

### 2. Connect to Project

- [ ] Click **Connect Project**
- [ ] Select your project
- [ ] Check **Production** environment
- [ ] Check **Preview** environment (optional)
- [ ] Click **Connect**

### 3. Verify Environment Variables

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Confirm `KV_REST_API_URL` exists
- [ ] Confirm `KV_REST_API_TOKEN` exists
- [ ] Confirm `KV_REST_API_READ_ONLY_TOKEN` exists

### 4. Redeploy

- [ ] Go to **Deployments** tab
- [ ] Click **Redeploy** on latest deployment
- [ ] Wait for deployment to complete
- [ ] Verify deployment succeeded

### 5. Test Rate Limiting

- [ ] Test login endpoint (should rate limit after 5 attempts)
- [ ] Test admin endpoints (should rate limit after 10 attempts)
- [ ] Check deployment logs for KV connection
- [ ] Verify no errors in browser console

### 6. Monitor

- [ ] Go to **Storage** tab
- [ ] Click on KV database
- [ ] Check metrics dashboard
- [ ] Verify requests are being logged
- [ ] Set up usage alerts (optional)

## Verification Commands

### Test Login Rate Limiting

```bash
# Replace YOUR_DOMAIN with your actual domain
for i in {1..6}; do
  curl -X POST https://YOUR_DOMAIN/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected:** First 5 return 401, 6th returns 429

### Check KV Connection in Logs

```bash
# In Vercel dashboard
# Go to Deployments → Latest → Logs
# Search for: "Rate limit check"
```

## Troubleshooting

### Environment Variables Not Showing

- [ ] Wait 1-2 minutes
- [ ] Refresh the page
- [ ] Redeploy the application

### Rate Limiting Not Working

- [ ] Check environment variables are set
- [ ] Verify latest code is deployed
- [ ] Check deployment logs for errors
- [ ] Test with curl commands above

### KV Connection Failed

- [ ] Verify KV_REST_API_URL is correct
- [ ] Verify KV_REST_API_TOKEN is correct
- [ ] Check database region matches deployment
- [ ] Ensure database is connected to project

## Success Criteria

- ✅ KV database created
- ✅ Connected to project
- ✅ Environment variables set
- ✅ Application redeployed
- ✅ Rate limiting works in production
- ✅ No errors in logs
- ✅ Metrics showing in dashboard

## Next Steps After Setup

- [ ] Monitor KV usage for first week
- [ ] Adjust rate limits if needed
- [ ] Set up usage alerts
- [ ] Document any custom configurations
- [ ] Test all rate-limited endpoints

## Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Full Setup Guide](./VERCEL_KV_SETUP.md)
- [Deployment Guide](../DEPLOYMENT.md)

---

**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy  
**Cost:** Free (Hobby plan)

