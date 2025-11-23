# Ebad Academy - أكاديمية عباد

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

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio
```

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

