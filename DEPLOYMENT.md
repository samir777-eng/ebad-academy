# 🚀 Deployment Guide - Ebad Academy

This guide will walk you through deploying Ebad Academy to production using Vercel.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- PostgreSQL database (we'll use Vercel Postgres)
- Cloudflare R2 or AWS S3 account (for file storage)

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

Make sure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 1.2 Verify Tests Pass

Run tests locally to ensure everything works:

```bash
npm run test:unit -- --run
npm run build
```

All 159 tests should pass, and the build should succeed.

---

## Step 2: Set Up Vercel Project

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Find and select your `ebad-academy` repository
4. Click **"Import"**

### 2.3 Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 20.x

---

## Step 3: Set Up Production Database

### 3.1 Create Vercel Postgres Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a region close to your users (e.g., US East for North America)
5. Click **"Create"**

### 3.2 Connect Database to Project

1. Vercel will automatically add these environment variables:

   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

2. Add `DATABASE_URL` manually:
   - Go to **Settings** → **Environment Variables**
   - Add: `DATABASE_URL` = (copy value from `POSTGRES_PRISMA_URL`)

---

## Step 4: Set Up Vercel KV (Rate Limiting)

**📚 Detailed Guide:** See [docs/VERCEL_KV_SETUP.md](./docs/VERCEL_KV_SETUP.md) for complete instructions
**✅ Quick Checklist:** See [docs/VERCEL_KV_CHECKLIST.md](./docs/VERCEL_KV_CHECKLIST.md) for step-by-step checklist

### 4.1 Create KV Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"**
3. Select **"KV"** (Redis-compatible key-value store)
4. Database name: `ebad-academy-kv`
5. Choose same region as your Postgres database (e.g., `iad1`)
6. Click **"Create"**

### 4.2 Connect KV to Project

1. Click **"Connect Project"** button
2. Select your project from dropdown
3. Choose environments:
   - ✅ Production (required)
   - ✅ Preview (recommended)
4. Click **"Connect"**

Vercel will automatically add these environment variables:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 4.3 Verify KV Setup

After connecting, verify the environment variables:

1. Go to **Settings** → **Environment Variables**
2. Confirm all three KV variables are present
3. Redeploy your application to activate KV

**Note:** Local development uses in-memory storage. KV is only used in production.

---

## Step 5: Configure Environment Variables

### 5.1 Required Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Authentication (REQUIRED)

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-with-command-below>
```

Generate secret:

```bash
openssl rand -base64 32
```

#### Cron Job Security (REQUIRED)

```
CRON_SECRET=<generate-with-command-below>
```

Generate secret:

```bash
openssl rand -base64 32
```

#### File Storage (REQUIRED for uploads)

**Option A: Cloudflare R2**

```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=ebad-academy
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

**Option B: AWS S3**

```
R2_ACCOUNT_ID=your-aws-account-id
R2_ACCESS_KEY_ID=your-aws-access-key
R2_SECRET_ACCESS_KEY=your-aws-secret-key
R2_BUCKET_NAME=ebad-academy
R2_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

### 5.2 Set Environment for All Environments

Make sure to set environment variables for:

- ✅ **Production**
- ✅ **Preview** (optional, for testing)
- ✅ **Development** (optional, for local dev)

---

## Step 6: Initialize Database Schema

### 6.1 Run Prisma Migrations

After deployment, you need to initialize the database schema.

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

**Option B: Using Vercel Dashboard**

1. Go to your project → **Settings** → **Functions**
2. Add a temporary API route to run migrations
3. Call the route once, then delete it

---

## Step 7: Deploy

### 7.1 Deploy to Production

Click **"Deploy"** in Vercel dashboard, or push to main branch:

```bash
git push origin main
```

Vercel will automatically:

1. ✅ Install dependencies
2. ✅ Run ESLint
3. ✅ Run tests (via GitHub Actions)
4. ✅ Build the application
5. ✅ Deploy to production

### 7.2 Verify Deployment

1. Wait for deployment to complete (~2-3 minutes)
2. Click the deployment URL
3. Verify the site loads correctly
4. Test key features:
   - ✅ Homepage loads
   - ✅ Login works
   - ✅ Dashboard accessible
   - ✅ Lessons load
   - ✅ Quizzes work

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Add Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `ebadacademy.com`)
4. Follow DNS configuration instructions

### 8.2 Update Environment Variables

Update `NEXTAUTH_URL` to use your custom domain:

```
NEXTAUTH_URL=https://ebadacademy.com
```

---

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database schema initialized
- [ ] Site loads without errors
- [ ] Login/authentication works
- [ ] Admin panel accessible
- [ ] Lessons and quizzes functional
- [ ] File uploads work (if configured)
- [ ] Cron jobs scheduled (check Vercel dashboard)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (if applicable)

---

## Monitoring & Maintenance

### View Logs

```bash
vercel logs <deployment-url>
```

Or view in Vercel dashboard → **Deployments** → Select deployment → **Logs**

### Monitor Performance

- Go to **Analytics** tab in Vercel dashboard
- Monitor page load times, errors, and traffic

### Update Application

```bash
git add .
git commit -m "Update: description"
git push origin main
```

Vercel will automatically deploy updates.

---

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure environment variables are set

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Check Prisma schema matches database
- Run `npx prisma migrate deploy`

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Rate Limiting Not Working

- Verify KV database is created
- Check `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- Restart deployment

---

## Security Recommendations

1. ✅ **Use strong secrets** - Generate with `openssl rand -base64 32`
2. ✅ **Enable HTTPS** - Automatic with Vercel
3. ✅ **Set CRON_SECRET** - Protect cron endpoints
4. ✅ **Use environment variables** - Never commit secrets
5. ✅ **Monitor logs** - Check for suspicious activity
6. ✅ **Keep dependencies updated** - Run `npm audit` regularly

---

**🎉 Congratulations! Your Ebad Academy is now live!**

For support, check:

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
