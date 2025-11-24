# 🚀 Quick Start Guide

## For New AI Assistant Sessions

When starting a new chat, read these files first:
1. **instructionsAugment.md** - Complete project context
2. **LOCAL_DEVELOPMENT.md** - Local development guide
3. This file - Quick reference

---

## 📋 Project Summary

**Ebad Academy** - Islamic education platform with 4 levels, 6 branches per level.

**Tech**: Next.js 16, Prisma, NextAuth, Tailwind, TypeScript, next-intl (AR/EN)

**Databases**:
- Local: SQLite (`dev.db`)
- Production: Vercel Postgres

---

## 🔑 Key Information

### URLs
- **Production**: https://ebad-academy.vercel.app
- **Local**: http://localhost:3000
- **GitHub**: https://github.com/samir777-eng/ebad-academy

### Admin Accounts
- **Production**: `samireldirini@gmail.com`
- **Local**: `admin@local.dev` / `admin123`

### Database Structure
- 4 Levels (progressive unlocking)
- 6 Branches: Aqeedah, Fiqh, Seerah, Tafseer, Hadith, Tarbiyah
- Lessons, Quizzes, Progress tracking, Badges

---

## ⚡ Common Commands

### Local Development
```bash
npm run dev:setup      # Setup + start (first time)
npm run dev            # Start dev server
npm run db:studio      # View database
npm run db:local:reset # Reset local database
```

### Testing
```bash
npm test              # Run all tests
npm run test:ui       # Interactive mode
```

### Deployment
```bash
git add .
git commit -m "message"
git push              # Auto-deploys to Vercel
```

---

## 🐛 Common Issues

### "Lessons are locked"
→ No lesson content in database. Create via admin panel.

### "Something went wrong" on registration
→ Database not initialized. Check connection or run migrations.

### Local database issues
→ Run `npm run db:local:reset`

### Production database issues
→ Check Vercel environment variables and Postgres connection

---

## 📁 Important Files

### Configuration
- `prisma/schema.prisma` - Database schema (currently SQLite for local)
- `.env.local` - Local environment variables
- `lib/auth.ts` - NextAuth config (CSRF disabled)

### Database
- `scripts/seed-local-db.js` - Local database seeding
- `app/api/setup-db/route.ts` - Production database initialization

### Key Logic
- `lib/level-unlock.ts` - Level progression logic
- `app/api/register/route.ts` - User registration (with security)

---

## 🎯 Current Status

### ✅ Working
- Authentication system
- User registration
- Database structure (levels/branches)
- Local development environment
- Production deployment
- Security (SQL injection, XSS, rate limiting)

### ⏳ Needs Content
- Lessons (database is empty)
- Quiz questions
- Achievement badges

---

## 🔄 Workflow

1. **Develop locally** (SQLite) - changes don't affect production
2. **Test thoroughly** at http://localhost:3000
3. **Commit and push** when ready
4. **Vercel auto-deploys** to production (PostgreSQL)

---

## 📞 Contact

**Developer**: Samir Eldirini
**Email**: samireldirini@gmail.com

---

## 📚 Full Documentation

- **instructionsAugment.md** - Complete technical context
- **LOCAL_DEVELOPMENT.md** - Detailed local setup guide
- **README.md** - Project overview (if exists)

---

**Remember**: Local and production databases are completely separate!

