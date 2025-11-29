# 🚀 Production Deployment Guide

**Project:** Ebad Academy Website  
**Date:** 2025-01-28  
**Status:** Ready for Production Deployment

---

## ✅ Pre-Deployment Checklist

All critical security and performance fixes have been applied. Follow this guide to deploy safely to production.

---

## 🔐 Step 1: Configure Environment Variables in Vercel

### Required Environment Variables

Navigate to **Vercel Dashboard > Your Project > Settings > Environment Variables** and add:

```bash
# 1. NextAuth Secret (CRITICAL)
NEXTAUTH_SECRET="hJpA4U/JU4BRPVQnXLKrNo0WTOOq6p1N3My1gFsdbb4="

# 2. Cron Job Secret (CRITICAL)
# Generate with: openssl rand -base64 32
CRON_SECRET="<your-generated-secret>"

# 3. Production Database (REQUIRED)
DATABASE_URL="<your-postgres-connection-string>"
POSTGRES_URL_NON_POOLING="<your-postgres-direct-connection>"

# 4. NextAuth URL (REQUIRED)
NEXTAUTH_URL="https://your-domain.com"
```

### Optional but Recommended

```bash
# Email Service (for notifications)
# Configure based on your email provider

# File Storage (Cloudflare R2 or AWS S3)
R2_ACCOUNT_ID="<your-account-id>"
R2_ACCESS_KEY_ID="<your-access-key>"
R2_SECRET_ACCESS_KEY="<your-secret-key>"
R2_BUCKET_NAME="<your-bucket-name>"
R2_PUBLIC_URL="<your-public-url>"
```

---

## 📊 Step 2: Create Vercel KV Database

**CRITICAL:** Rate limiting requires Vercel KV in production.

1. Go to **Vercel Dashboard > Storage > Create Database**
2. Select **KV (Redis)**
3. Choose a name (e.g., `ebad-academy-kv`)
4. Select your region (same as your deployment)
5. Click **Create**

Vercel will automatically add these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

---

## 🗄️ Step 3: Run Database Migrations

After deploying, run migrations to create indexes and schema:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Option 2: Via GitHub Actions (recommended)
# Add this to your deployment workflow
```

---

## 🧪 Step 4: Test Critical Flows

Before going live, test these critical security features:

### 1. Admin Route Protection
```bash
# Test as non-admin user
1. Login as regular student
2. Try to access /admin routes
3. Should redirect to dashboard
```

### 2. Rate Limiting
```bash
# Test login rate limiting
1. Make 6 login attempts within 15 minutes
2. 6th attempt should return 429 Too Many Requests
3. Check response headers for rate limit info
```

### 3. Quiz Transaction Rollback
```bash
# Test database transaction
1. Submit a quiz with invalid data
2. Verify no partial data is saved
3. Check database consistency
```

### 4. Input Sanitization
```bash
# Test XSS protection
1. Try to save lesson notes with <script> tags
2. Verify tags are stripped/sanitized
3. Check spiritual progress notes
```

### 5. Cron Job Authentication
```bash
# Test webhook security
1. Call /api/cron/inactivity-reminder without auth
2. Should return 401 Unauthorized
3. Call with correct Bearer token
4. Should return 200 OK
```

---

## 🔍 Step 5: Verify Production Configuration

### Check Environment
```bash
# Verify NODE_ENV is set to production
echo $NODE_ENV  # Should output: production
```

### Verify KV Connection
```bash
# In Vercel dashboard, check KV database shows "Connected"
# Test rate limiting endpoint to confirm KV is working
```

### Check Logs
```bash
# Verify no console.log output in production
# Only logger.error should appear for actual errors
```

---

## 📋 Step 6: Post-Deployment Verification

### Security Checks
- [ ] Admin routes blocked for non-admin users
- [ ] Rate limiting active on login endpoint
- [ ] No console.log statements in production logs
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] CRON_SECRET is set and working
- [ ] Input sanitization working on all forms

### Performance Checks
- [ ] Database queries using indexes (check query times)
- [ ] Session expiration set to 30 days
- [ ] Session auto-refresh working (24 hours)
- [ ] KV rate limiting responding quickly

### Data Integrity Checks
- [ ] Quiz submissions atomic (test rollback)
- [ ] User progress updates consistent
- [ ] No partial database writes

---

## 🚨 Rollback Plan

If issues occur after deployment:

### Immediate Rollback
```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find previous stable deployment
3. Click "..." menu
4. Select "Promote to Production"
```

### Database Rollback
```bash
# If migrations cause issues
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 📊 Monitoring

### Key Metrics to Watch

1. **Rate Limit Hits**
   - Monitor 429 responses
   - Adjust limits if legitimate users affected

2. **Database Performance**
   - Query times should be <100ms with indexes
   - Monitor slow query logs

3. **Error Rates**
   - Watch for spikes in 500 errors
   - Check logger.error output

4. **Session Expiration**
   - Monitor user re-login frequency
   - Adjust maxAge if needed

---

## 🎯 Success Criteria

Deployment is successful when:

✅ All environment variables configured  
✅ Vercel KV database created and connected  
✅ Database migrations applied successfully  
✅ All 5 critical flows tested and passing  
✅ No console.log in production logs  
✅ Rate limiting working with KV  
✅ Admin routes protected  
✅ Input sanitization active  
✅ Quiz transactions atomic  
✅ No security vulnerabilities detected

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test KV connection in Vercel dashboard
4. Review `FIXES_APPLIED.md` for implementation details
5. Check `SECURITY_IMPROVEMENTS_SUMMARY.md` for overview

---

**Ready to deploy! 🚀**

