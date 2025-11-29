# Ebad Academy - أكاديمية عباد

[![Tests](https://github.com/samir777-eng/ebad-academy/actions/workflows/test.yml/badge.svg)](https://github.com/samir777-eng/ebad-academy/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive Islamic education platform built with Next.js, designed to take students from the basics of Islam to advanced knowledge through a structured, university-style curriculum.

## 🎯 Project Overview

Ebad Academy is a progressive learning management system featuring:

- **4 Progressive Levels** - Students must complete each level before advancing
- **6 Islamic Sciences** - Aqeedah, Fiqh, Seerah, Tafseer, Hadith Sciences, and Tarbiyah
- **Auto-Graded Quizzes** - 60% passing threshold required
- **Bilingual Support** - Full Arabic and English content
- **Interactive Learning** - PDF downloads, mind maps, and progress tracking

## 🚀 Tech Stack

### Frontend

- **Next.js 16** - App Router with TypeScript
- **Tailwind CSS 3** - Utility-first styling with Islamic-themed colors
- **Framer Motion** - Smooth animations
- **React Query** - Efficient data fetching and caching
- **Zustand** - State management
- **Lucide React** - Beautiful icons

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma 5** - Type-safe ORM
- **SQLite** - Development database (easily switchable to PostgreSQL)
- **NextAuth.js** - Authentication with credentials provider
- **bcryptjs** - Password hashing

## 📦 Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema

The database includes the following models:

- **User** - Student accounts with authentication
- **Level** - 4 progressive learning levels
- **Branch** - 6 Islamic science branches
- **Lesson** - Learning content with bilingual support
- **Question** - Quiz questions with auto-grading
- **UserProgress** - Track student completion and scores
- **UserLevelStatus** - Level unlocking system
- **UserAnswer** - Quiz attempt history
- **Badge** - Achievement system
- **UserBadge** - Earned achievements

## 🎨 Features Implemented

### ✅ Completed

1. **Project Setup**

   - Next.js 16 with App Router
   - TypeScript configuration
   - Tailwind CSS with custom theme
   - ESLint setup

2. **Database & ORM**

   - Complete Prisma schema
   - SQLite database (dev)
   - Seeded data (levels, branches, sample lesson)
   - Database utilities

3. **Authentication**

   - NextAuth.js integration
   - Credentials provider
   - Registration API
   - Password hashing
   - Session management

4. **UI Components**

   - Button component with variants
   - Utility functions (cn)
   - Providers (React Query, Session)
   - Responsive layout
   - RTL support for Arabic

5. **Landing Page**
   - Hero section with bilingual content
   - Islamic-themed design
   - Gradient backgrounds
   - Call-to-action button

### 🚧 To Be Implemented

- Internationalization (next-intl)
- Login/Register pages
- Dashboard with progress tracking
- Lesson viewer with PDF support
- Quiz interface
- Results page with explanations
- Level progression logic
- Admin panel
- Mind map viewer
- Achievements system

## 🎨 Color Palette

```javascript
primary: {
  50: '#f0fdf4',   // Light green
  500: '#22c55e',  // Islamic green
  700: '#15803d',  // Dark green
}
secondary: {
  500: '#3b82f6',  // Blue (knowledge)
}
gold: {
  500: '#f59e0b',  // Badges/achievements
}
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests (when implemented)

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio
```

## 🧪 Testing

The project includes comprehensive unit tests with **159 tests** covering:

- **Utility Libraries**: Sanitization, validation, logging, audit, badge checking, level unlocking
- **Middleware**: HTTPS enforcement, authentication, admin role verification, locale handling
- **API Routes**: Admin user management, quiz submission, lesson CRUD, badge management
- **Caching**: Role cache with TTL and LRU eviction

**Test Coverage**: 83.92% statements, 78.44% branches

```bash
npm run test:unit    # Run all unit tests
npm run test:unit -- --watch  # Run tests in watch mode
npm run test:unit -- --coverage  # Generate coverage report
```

**CI/CD**: Tests run automatically on every push and pull request via GitHub Actions.

## 🚀 Deployment

### Quick Deploy to Vercel

1. **Run pre-deployment check:**

```bash
./scripts/deploy-check.sh
```

2. **Generate production secrets:**

```bash
./scripts/generate-secrets.sh
```

3. **Deploy to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/samir777-eng/ebad-academy)

4. **Follow the detailed guide:**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions including:

- Setting up Vercel Postgres database
- Configuring Vercel KV for rate limiting
- Environment variable configuration
- Database migration
- Custom domain setup

### Required Environment Variables for Production

- `DATABASE_URL` - PostgreSQL connection string (Vercel Postgres)
- `NEXTAUTH_URL` - Your production URL (e.g., https://ebadacademy.com)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `CRON_SECRET` - Generate with `openssl rand -base64 32`
- `KV_REST_API_URL` - Vercel KV (auto-configured)
- `KV_REST_API_TOKEN` - Vercel KV (auto-configured)
- `R2_*` - Cloudflare R2 or AWS S3 credentials (optional, for file uploads)

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## 📚 Database Seeded Data

The seed script creates:

- **6 Branches**: Aqeedah, Fiqh, Seerah, Tafseer, Hadith Sciences, Tarbiyah
- **4 Levels**: Fundamentals, Deepening, Specialization, Mastery
- **1 Sample Lesson**: Introduction to Islamic Creed (Aqeedah, Level 1)
- **1 Sample Question**: Multiple choice about pillars of faith

## 🌐 Bilingual Support

The platform supports both Arabic and English:

- RTL layout for Arabic
- Cairo font for Arabic text
- Inter font for English text
- All content stored in both languages

## 📖 Next Steps

1. **Implement i18n** - Set up next-intl for language switching
2. **Build Auth Pages** - Create login and registration forms
3. **Create Dashboard** - Show user progress and next lessons
4. **Lesson Viewer** - Display content with PDF viewer
5. **Quiz System** - Interactive quiz interface with auto-grading
6. **Level Progression** - Implement unlock logic
7. **Admin Panel** - Content management interface

## 🤲 May Allah Bless This Project

This platform aims to help Muslims learn their religion properly and build a strong foundation in Islamic knowledge.

---

**Built with ❤️ for the Muslim Ummah**
