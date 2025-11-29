# Ebad Academy - Project Context & Instructions

## 📋 Project Overview

**Ebad Academy** is a comprehensive Islamic education platform built with Next.js 16, Prisma, NextAuth, and bilingual support (Arabic/English).

**Mission**: Create a complete Muslim from scratch - taking someone from outside Islam and teaching them progressively until they become a knowledgeable, practicing Muslim ready to sacrifice for Allah's sake.

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router (Turbopack)
- **Database**:
  - **Production**: Vercel Postgres (PostgreSQL)
  - **Local**: SQLite (`dev.db`)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (credentials provider)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Internationalization**: next-intl (Arabic/English)

### Key Features

- 4 Progressive Levels (Fundamentals → Intermediate → Advanced → Mastery)
- 6 Islamic Knowledge Branches per level:
  - Aqeedah (العقيدة) 🕌
  - Fiqh (الفقه) 📖
  - Seerah (السيرة) 📚
  - Tafseer (التفسير) 📕
  - Hadith (الحديث) 📜
  - Tarbiyah (التربية) 💎
- Interactive lessons with video content
- **Visual Mind Map System** (NEW!)
  - Interactive node-based visualization
  - Custom relationships between concepts
  - Dual editor modes (tree + visual)
  - Rich metadata (dates, locations, participants, sources)
  - Bilingual support with RTL layout
- Self-grading quizzes
- Progress tracking
- Spiritual progress tracker
- Leaderboard system
- Achievement badges
- Action items
- Bookmarks and notes

---

## 🗄️ Database Schema

### Core Models

- **User**: Students and admins
- **Level**: 4 progressive levels
- **Branch**: 6 Islamic knowledge branches
- **Lesson**: Content for each branch/level combination
- **Question**: Quiz questions for lessons
- **UserProgress**: Tracks lesson completion
- **UserLevelStatus**: Tracks level unlocking
- **QuizAttempt**: Quiz results
- **Badge**: Achievement system
- **SpiritualProgress**: Daily worship tracking

### Mind Map Models (NEW!)

- **MindMapNode**: Visual mind map nodes with rich metadata
  - Hierarchical structure (parentId, level, order)
  - Node types (ROOT, CATEGORY, TOPIC, SUBTOPIC, DETAIL)
  - Rich metadata (dates, locations, participants, sources, decisions, outcomes)
  - Visual properties (color, icon, shape, positionX, positionY)
  - Bilingual content (titleAr, titleEn, descriptionAr, descriptionEn)
- **MindMapRelationship**: Custom connections between nodes
  - Relationship types (RELATED, PREREQUISITE, LEADS_TO, EXAMPLE_OF, etc.)
  - Visual styling (color, lineWidth, lineStyle, labelAr, labelEn)
  - Handle positions (sourceHandle, targetHandle)
- **MindMapAttachment**: File attachments for nodes
  - Support for images, documents, videos
  - File metadata (name, type, size, URL)

### Important Relationships

- Lessons belong to both a Branch and a Level
- Users unlock levels progressively
- Level unlocks when ALL lessons in current level are completed with passing quiz scores (≥60%)
- Level 1 is automatically unlocked for new users
- **Mind Map Nodes** have hierarchical parent-child relationships
- **Mind Map Relationships** create custom non-hierarchical connections between nodes

---

## 🎨 Design System

### Colors

- Primary: Blue gradient (#3B82F6 → #1E40AF)
- Secondary: Purple (#8B5CF6)
- Accent: Teal (#14B8A6)
- Background: Dark navy (#0F172A)
- Text: White/Gray scale

### Mind Map Node Colors

- ROOT: Purple gradient (#8B5CF6 → #6D28D9)
- CATEGORY: Blue gradient (#3B82F6 → #1E40AF)
- TOPIC: Teal gradient (#14B8A6 → #0D9488)
- SUBTOPIC: Green gradient (#10B981 → #059669)
- DETAIL: Orange gradient (#F59E0B → #D97706)

### Components

- Glassmorphism effects
- Gradient backgrounds
- Animated hover states
- Responsive cards
- Progress indicators
- Interactive buttons
- **Mind Map Nodes**: Rounded corners, shadows, gradient backgrounds, hover effects
- **Custom Edges**: Colored lines, adjustable width, arrow markers, bilingual labels

---

## 🔐 Authentication

### NextAuth Configuration

- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT
- **CSRF Protection**: Disabled (`skipCSRFCheck: true`) - critical for deployment
- **Location**: `lib/auth.ts`

### User Roles

- **student**: Default role for new registrations
- **admin**: Can access admin panel, create lessons, manage content

### Admin Accounts

- **Production**: `samireldirini@gmail.com` (your account)
- **Local Dev**: `admin@local.dev` / `admin123`

---

## 🌐 Deployment

### Production

- **Platform**: Vercel
- **URL**: <https://ebad-academy.vercel.app>
- **Database**: Vercel Postgres (Neon Serverless)
- **Auto-Deploy**: Pushes to `main` branch trigger deployment
- **GitHub**: <https://github.com/samir777-eng/ebad-academy>

### Environment Variables (Production)

```
POSTGRES_URL - Vercel Postgres connection (pooled)
POSTGRES_URL_NON_POOLING - Direct connection for migrations
NEXTAUTH_URL - https://ebad-academy.vercel.app
NEXTAUTH_SECRET - (set in Vercel)
```

### Local Development

- **URL**: <http://localhost:3000>
- **Database**: SQLite (`dev.db`)
- **Environment**: `.env.local`

---

## 🚀 Development Workflow

### Local Setup

```bash
# Install dependencies
npm install

# Setup local database (SQLite)
npm run db:local:setup

# Start dev server
npm run dev
```

### Database Commands

```bash
npm run db:studio          # Open Prisma Studio
npm run db:local:reset     # Reset local database
npm run db:push            # Push schema changes
npm run db:generate        # Generate Prisma client
```

### Testing

```bash
npm test                   # Run all tests
npm run test:ui            # Playwright UI mode
npm run test:auth          # Auth tests only
```

### Deployment

```bash
git add .
git commit -m "Your changes"
git push                   # Auto-deploys to Vercel
```

---

## 🔧 Critical Configuration

### Prisma Schema Switching

- **Local**: Uses SQLite provider
- **Production**: Uses PostgreSQL provider
- **Location**: `prisma/schema.prisma`

**Important**: The schema is currently set to SQLite for local development. Production deployment automatically uses PostgreSQL via environment variables.

### Database Migration Strategy

- **Production**: Uses `prisma db push` (no migration files)
- **Script**: `scripts/migrate-db.js` runs during Vercel build
- **Seed**: `app/api/setup-db/route.ts` initializes levels/branches

---

## 📁 Key Files & Directories

### Authentication

- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `app/api/register/route.ts` - User registration

### Database

- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma client singleton
- `scripts/migrate-db.js` - Production migration script
- `scripts/seed-local-db.js` - Local database seeding

### API Routes

- `app/api/setup-db/route.ts` - Initialize database (levels/branches)
- `app/api/register/route.ts` - User registration
- `app/api/dashboard/*` - Dashboard data endpoints

### Pages

- `app/[locale]/page.tsx` - Landing page
- `app/[locale]/dashboard/page.tsx` - Student dashboard
- `app/[locale]/admin/*` - Admin panel
- `app/[locale]/lesson/[id]/page.tsx` - Lesson viewer
- `app/[locale]/branch/[slug]/page.tsx` - Branch overview

---

## 🐛 Known Issues & Solutions

### Issue: Registration Returns "Something went wrong"

**Cause**: Database tables don't exist or connection issues
**Solution**:

1. Check database connection
2. Run migrations: `npm run db:push`
3. Seed database: Call `/api/setup-db` endpoint

### Issue: Lessons Appear Locked

**Cause**: No lesson content in database
**Solution**: Create lessons via admin panel or seed sample data

### Issue: Prepared Statement Errors (PostgreSQL)

**Cause**: Connection pooling conflicts
**Solution**: Use `POSTGRES_URL_NON_POOLING` for direct connections

### Issue: CSRF Token Errors

**Cause**: NextAuth CSRF validation
**Solution**: Set `skipCSRFCheck: true` in `lib/auth.ts` (already done)

---

## 📊 Current Status

### ✅ Completed

- Full application architecture
- Authentication system
- Database schema
- 4 Levels + 6 Branches structure
- User registration
- Admin role system
- Local development environment
- Production deployment
- Security fixes (SQL injection, XSS, rate limiting)
- 51+ passing tests

### ⏳ Pending

- Lesson content creation (database is empty)
- Sample lessons for testing
- Admin panel lesson creation UI testing

---

## 🎯 Next Steps

1. **Create Lesson Content**

   - Login to admin panel: <https://ebad-academy.vercel.app/ar/admin>
   - Or locally: <http://localhost:3000/ar/admin>
   - Create lessons for each branch/level

2. **Test Student Experience**

   - Register test student account
   - Complete lessons and quizzes
   - Verify level unlocking works

3. **Content Population**
   - Add quiz questions
   - Upload video content
   - Create achievement badges

---

## 📝 Important Notes

- **Database Separation**: Local (SQLite) and Production (PostgreSQL) are completely separate
- **Admin Access**: Your email `samireldirini@gmail.com` has admin role in production
- **Auto-Deploy**: Every push to GitHub triggers Vercel deployment
- **Security**: All major vulnerabilities fixed (SQL injection, XSS, rate limiting)
- **Testing**: 51+ tests passing locally
- **Bilingual**: All content supports Arabic (primary) and English

---

## 🔗 URLs

- **Production**: <https://ebad-academy.vercel.app>
- **Local Dev**: <http://localhost:3000>
- **GitHub**: <https://github.com/samir777-eng/ebad-academy>
- **Vercel Dashboard**: <https://vercel.com/samir777-engs-projects/ebad-academy>

---

---

## 🔍 Technical Deep Dive

### Level Unlocking Logic

**Location**: `lib/level-unlock.ts`

A level is unlocked when:

1. ALL lessons in current level have `completed: true` in UserProgress
2. ALL lessons have a passing quiz attempt (score ≥ 60%)
3. Both conditions must be met for EACH lesson

When unlocked:

- Next level's `UserLevelStatus.isUnlocked` set to `true`
- All previous levels also unlocked (ensures progression)
- Completion percentage calculated

### Security Implementations

**Input Sanitization**: `app/api/register/route.ts`

- Removes HTML tags, script content
- Blocks SQL injection patterns
- Email and phone validation

**Rate Limiting**: Implemented on auth endpoints
**XSS Protection**: Content sanitization throughout
**CSRF**: Disabled for NextAuth (required for Vercel deployment)

### Database Connection Strategy

**Production**:

- Uses `POSTGRES_URL_NON_POOLING` to avoid prepared statement conflicts
- Prisma schema: `provider = "postgresql"`
- Connection string from Vercel environment

**Local**:

- Uses `DATABASE_URL="file:./dev.db"`
- Prisma schema: `provider = "sqlite"`
- File-based database

### Routing Structure

```
app/
├── [locale]/              # Internationalized routes
│   ├── page.tsx          # Landing page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── dashboard/        # Student dashboard
│   │   ├── page.tsx
│   │   └── levels/[levelId]/  # Level detail
│   ├── lesson/[id]/      # Lesson viewer
│   ├── branch/[slug]/    # Branch overview
│   ├── admin/            # Admin panel
│   └── profile/          # User profile
└── api/
    ├── auth/             # NextAuth routes
    ├── register/         # Registration endpoint
    ├── setup-db/         # Database initialization
    ├── dashboard/        # Dashboard data APIs
    └── admin/
        └── mindmap/      # Mind Map API (NEW!)
            ├── tree/     # Get hierarchical tree
            ├── nodes/    # CRUD operations
            ├── nodes/[id]/  # Single node operations
            ├── relationships/  # Custom connections
            ├── attachments/    # File uploads
            └── reorder/  # Bulk reordering
```

### Translation System

**Library**: next-intl
**Files**:

- `messages/ar.json` - Arabic translations
- `messages/en.json` - English translations
  **Usage**: `const t = useTranslations('namespace')`

### Styling Approach

- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Supported via `dark:` classes
- **RTL Support**: Arabic layout with `dir="rtl"`
- **Responsive**: Mobile-first design
- **Theme**: Primary (cyan) + Secondary (teal) gradient

---

## 🗂️ Database Seeding

### Production Seed

**Endpoint**: `/api/setup-db`
**Creates**:

- 4 Levels
- 6 Branches
- Sets admin role for `samireldirini@gmail.com`

### Local Seed

**Script**: `scripts/seed-local-db.js`
**Creates**:

- 4 Levels
- 6 Branches
- Admin user: `admin@local.dev` / `admin123`
- Unlocks Level 1 for admin

---

## 🧪 Testing Strategy

### Test Files

- `tests/auth.spec.ts` - Authentication tests
- `tests/security.spec.ts` - Security vulnerability tests
- `tests/api.spec.ts` - API endpoint tests

### Test Coverage

- ✅ User registration
- ✅ Login/logout
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Rate limiting
- ✅ Admin authorization
- ✅ Input sanitization

### Running Tests

```bash
npm test                    # All tests
npm run test:ui             # Interactive mode
npm run test:auth           # Auth only
npm run test:debug          # Debug mode
```

---

## 🚨 Troubleshooting

### Local Development Issues

**Problem**: "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

**Problem**: Database schema out of sync

```bash
npm run db:push
```

**Problem**: Need fresh database

```bash
npm run db:local:reset
```

### Production Issues

**Problem**: "Application error" on Vercel

- Check Vercel logs
- Verify environment variables
- Ensure database connection works

**Problem**: Registration fails

- Check `/api/setup-db` was called
- Verify database tables exist
- Check Vercel Postgres connection

**Problem**: Lessons locked

- Database has no lesson content
- Create lessons via admin panel
- Or seed sample lessons

---

## 📦 Dependencies

### Core

- next@16.0.3
- react@19.0.0
- prisma@6.2.0
- next-auth@5.0.0-beta.25
- next-intl@3.27.2

### UI

- tailwindcss@3.4.17
- lucide-react@0.468.0
- @radix-ui/\* (various components)

### Utilities

- bcryptjs@2.4.3
- zod@3.24.1
- date-fns@4.1.0

### Testing

- @playwright/test@1.49.1

---

## 🎨 Design System

### Colors

- **Primary**: Cyan (600-400)
- **Secondary**: Teal (600-400)
- **Success**: Green
- **Error**: Red
- **Warning**: Yellow

### Typography

- **Font**: System fonts (antialiased)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

### Components

- Cards with hover effects
- Gradient buttons
- Progress bars
- Modal dialogs
- Toast notifications

---

## 🔐 Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting on auth endpoints
- ✅ **Rate limiting on Mind Map API** (100/min reads, 30/min writes, 10/min bulk)
- ✅ Input validation and sanitization
- ✅ **DOMPurify sanitization for Mind Map content**
- ✅ HTTPS only (production)
- ✅ Secure session management
- ✅ Role-based access control
- ✅ **Admin-only access for Mind Map editing**
- ✅ **CSRF protection with origin validation**

---

## 🗺️ Mind Map System (NEW!)

### Features

**Visual Editor:**

- Interactive ReactFlow-based visualization
- Dual view modes (tree + visual)
- Drag-and-drop node positioning
- Grid background with snap-to-grid
- Connection line width control (1-10px)
- Fullscreen editing mode
- MiniMap for navigation
- Export to PNG

**Node System:**

- 5 node types (ROOT, CATEGORY, TOPIC, SUBTOPIC, DETAIL)
- Rich metadata (dates, locations, participants, sources, decisions, outcomes)
- Bilingual content (Arabic/English)
- Visual properties (color, icon, shape, position)
- Hierarchical parent-child relationships

**Custom Relationships:**

- 7 relationship types (RELATED, PREREQUISITE, LEADS_TO, EXAMPLE_OF, CONTRADICTS, ELABORATES, PART_OF)
- Custom colors and line styles
- Adjustable line width
- Bilingual labels
- Arrow markers for directionality

**Student View:**

- Read-only interactive visualization
- Node detail panel with rich metadata
- Relationship visualization
- Export functionality
- Fullscreen mode
- Keyboard navigation (Tab, Enter, Space)
- Screen reader support

### API Endpoints

All endpoints require admin authentication and have rate limiting:

- `GET /api/admin/mindmap/tree?lessonId={id}` - Get hierarchical tree (100/min)
- `GET /api/admin/mindmap/nodes?lessonId={id}` - List nodes with pagination (100/min)
- `POST /api/admin/mindmap/nodes` - Create new node (30/min)
- `GET /api/admin/mindmap/nodes/[id]` - Get single node (100/min)
- `PUT /api/admin/mindmap/nodes/[id]` - Update node (30/min)
- `DELETE /api/admin/mindmap/nodes/[id]` - Delete node (30/min)
- `POST /api/admin/mindmap/relationships` - Create relationship (30/min)
- `DELETE /api/admin/mindmap/relationships` - Delete relationship (30/min)
- `POST /api/admin/mindmap/attachments` - Upload attachment (30/min)
- `DELETE /api/admin/mindmap/attachments` - Delete attachment (30/min)
- `POST /api/admin/mindmap/reorder` - Bulk reorder nodes (10/min)

### Components

**Admin:**

- `SimpleMindMapEditor` - Tree-based editor with metadata forms
- `AdminVisualMindMapEditor` - ReactFlow visual editor with drag-and-drop
- `MindMapNodeComponent` - Custom node component with handles

**Student:**

- `MindMapViewer` - Wrapper with error boundary and loading states
- `VisualMindMap` - Read-only ReactFlow visualization
- `MindMapNodeComponent` - Read-only node display

### Documentation

Comprehensive documentation available in `/docs`:

- **COMPLETED_FEATURES.md** - All implemented features with statistics
- **FUTURE_FEATURES.md** - 20+ planned features with roadmap
- **README.md** - Documentation index and quick start

### Security Features

- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod schemas
- ✅ DOMPurify sanitization for XSS prevention
- ✅ Admin-only access control
- ✅ CSRF protection
- ✅ Depth limit for recursive operations (max 100 levels)
- ✅ Transaction support for data integrity

### Performance Optimizations

- ✅ Database indexes for common queries
- ✅ Optimized tree building (single query + in-memory)
- ✅ Pagination for large datasets
- ✅ Position persistence for layout
- ✅ No N+1 query problems

---

**Last Updated**: 2025-01-28
**Developer**: Samir Eldirini (<samireldirini@gmail.com>)
**AI Assistant**: Augment Agent (Claude Sonnet 4.5)
