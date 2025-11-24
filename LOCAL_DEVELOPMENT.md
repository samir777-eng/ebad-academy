# Local Development Guide

This guide explains how to develop locally without affecting the production database.

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Local Database
```bash
npm run db:local:setup
```

This will:
- Create a local SQLite database (`dev.db`)
- Run Prisma migrations
- Seed the database with:
  - 4 Levels (Level 1-4)
  - 6 Branches (Aqeedah, Fiqh, Seerah, Tafseer, Hadith, Tarbiyah)
  - Admin user: `admin@local.dev` / `admin123`

### 3. Start Development Server
```bash
npm run dev
```

Or combine setup + start:
```bash
npm run dev:setup
```

## 🌐 Access the App

- **Local URL**: http://localhost:3000
- **Admin Login**: 
  - Email: `admin@local.dev`
  - Password: `admin123`

## 📊 Database Management

### View Database (Prisma Studio)
```bash
npm run db:studio
```

### Reset Local Database
```bash
npm run db:local:reset
```

This will delete the local database and recreate it with fresh seed data.

### Push Schema Changes
```bash
npm run db:push
```

## 🔄 Local vs Production

### Local Development
- **Database**: SQLite (`dev.db`)
- **URL**: http://localhost:3000
- **Environment**: `.env.local`
- **Changes**: Only affect your local machine

### Production
- **Database**: Vercel Postgres
- **URL**: https://ebad-academy.vercel.app
- **Environment**: Vercel environment variables
- **Changes**: Affect live users

## 📝 Workflow

1. **Develop locally** with SQLite database
2. **Test your changes** at http://localhost:3000
3. **Commit and push** to GitHub when ready
4. **Vercel auto-deploys** to production with PostgreSQL

## ⚠️ Important Notes

- The local database (`dev.db`) is **NOT** committed to Git
- Production uses **PostgreSQL**, local uses **SQLite**
- Schema changes work on both databases
- Always test locally before pushing to production

## 🎯 Common Tasks

### Create a New Lesson (Local)
1. Login as admin: `admin@local.dev` / `admin123`
2. Go to: http://localhost:3000/ar/admin
3. Create lessons, quizzes, etc.
4. Test the student experience

### Test Registration
1. Go to: http://localhost:3000/ar/register
2. Create a test student account
3. Test the learning flow

### Debug Issues
```bash
# View database in browser
npm run db:studio

# Check Prisma schema
npx prisma validate

# Generate Prisma client
npm run db:generate
```

## 🚀 Deployment

When you're ready to deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically deploy to production.

---

**Happy coding! 🎉**

