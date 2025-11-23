# Ebad Academy - Islamic Education Platform

## Project Overview
You are building a comprehensive Islamic education platform called "Ebad Academy" (أكاديمية عباد). The goal is to create a complete Muslim from scratch - taking someone from outside Islam and teaching them progressively until they become a knowledgeable, practicing Muslim ready to sacrifice for Allah's sake.

## Core Concept
A university-style learning management system with:
- 4 progressive levels (cannot advance without completing current level)
- 6 branches per level: Aqeedah, Fiqh, Seerah, Tafseer, Hadith Sciences, Tarbiyah
- Auto-graded quizzes (60% passing threshold)
- PDF downloads and interactive mind maps
- Full bilingual support (Arabic/English)
- Target audience: Gen-Z Muslims and new converts

## Tech Stack

### Frontend
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS + shadcn/ui components
- React Query for data fetching
- Zustand for state management
- next-intl for i18n (Arabic/English)
- react-pdf for PDF viewer
- Excalidraw or D3.js for interactive mind maps
- Framer Motion for animations

### Backend
- Next.js API Routes
- PostgreSQL database
- Prisma ORM
- NextAuth.js (email/password + OAuth)
- AWS S3 or Cloudflare R2 for PDF storage
- Redis for caching (optional)

### Deployment
- Vercel (frontend + API)
- Supabase or Railway (PostgreSQL)
- Cloudflare R2 (file storage)

## Database Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  languagePref  String    @default("ar") // "ar" or "en"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  progress      UserProgress[]
  levelStatus   UserLevelStatus[]
  answers       UserAnswer[]
  badges        UserBadge[]
}

model Level {
  id              Int       @id @default(autoincrement())
  levelNumber     Int       @unique // 1, 2, 3, 4
  nameAr          String
  nameEn          String
  descriptionAr   String
  descriptionEn   String
  order           Int
  
  lessons         Lesson[]
  userStatus      UserLevelStatus[]
}

model Branch {
  id        Int       @id @default(autoincrement())
  nameAr    String    @unique // العقيدة
  nameEn    String    @unique // Aqeedah
  icon      String    // Icon identifier
  slug      String    @unique
  order     Int
  
  lessons   Lesson[]
}

model Lesson {
  id              Int       @id @default(autoincrement())
  branchId        Int
  levelId         Int
  titleAr         String
  titleEn         String
  contentAr       String    @db.Text
  contentEn       String    @db.Text
  pdfUrlAr        String?
  pdfUrlEn        String?
  mindmapData     Json?     // Interactive mind map structure
  duration        Int       // Estimated minutes
  order           Int
  
  branch          Branch    @relation(fields: [branchId], references: [id])
  level           Level     @relation(fields: [levelId], references: [id])
  questions       Question[]
  userProgress    UserProgress[]
  
  @@unique([branchId, levelId, order])
}

model Question {
  id              Int       @id @default(autoincrement())
  lessonId        Int
  questionTextAr  String
  questionTextEn  String
  type            String    // "multiple_choice" or "true_false"
  optionsAr       Json?     // ["option1", "option2", ...] for MCQ
  optionsEn       Json?
  correctAnswer   String    // Index or "true"/"false"
  explanationAr   String?
  explanationEn   String?
  order           Int
  
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userAnswers     UserAnswer[]
}

model UserProgress {
  id              Int       @id @default(autoincrement())
  userId          String
  lessonId        Int
  completed       Boolean   @default(false)
  score           Float?    // Percentage (0-100)
  attempts        Int       @default(0)
  lastAttempt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson          Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, lessonId])
}

model UserLevelStatus {
  id                    Int       @id @default(autoincrement())
  userId                String
  levelId               Int
  isUnlocked            Boolean   @default(false)
  completionPercentage  Float     @default(0)
  unlockedAt            DateTime?
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  level                 Level     @relation(fields: [levelId], references: [id])
  
  @@unique([userId, levelId])
}

model UserAnswer {
  id              Int       @id @default(autoincrement())
  userId          String
  questionId      Int
  answer          String
  isCorrect       Boolean
  attemptDate     DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question        Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model Badge {
  id              Int       @id @default(autoincrement())
  nameAr          String
  nameEn          String
  descriptionAr   String
  descriptionEn   String
  iconUrl         String
  criteria        Json      // Conditions to earn this badge
  
  userBadges      UserBadge[]
}

model UserBadge {
  id              Int       @id @default(autoincrement())
  userId          String
  badgeId         Int
  earnedDate      DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge           Badge     @relation(fields: [badgeId], references: [id])
  
  @@unique([userId, badgeId])
}
```

## Key Features & Business Logic

### 1. Level Progression System
```typescript
// Users start at Level 1 (always unlocked)
// To unlock Level N, user must:
// 1. Complete ALL lessons in Level N-1
// 2. Score >= 60% on ALL quizzes in Level N-1

async function checkAndUnlockNextLevel(userId: string, currentLevelId: number) {
  const allLessons = await prisma.lesson.findMany({
    where: { levelId: currentLevelId }
  });
  
  const userProgress = await prisma.userProgress.findMany({
    where: {
      userId,
      lessonId: { in: allLessons.map(l => l.id) }
    }
  });
  
  const allCompleted = allLessons.every(lesson => {
    const progress = userProgress.find(p => p.lessonId === lesson.id);
    return progress?.completed && (progress?.score ?? 0) >= 60;
  });
  
  if (allCompleted) {
    const nextLevel = await prisma.level.findUnique({
      where: { levelNumber: currentLevelId + 1 }
    });
    
    if (nextLevel) {
      await prisma.userLevelStatus.upsert({
        where: {
          userId_levelId: { userId, levelId: nextLevel.id }
        },
        update: { isUnlocked: true, unlockedAt: new Date() },
        create: {
          userId,
          levelId: nextLevel.id,
          isUnlocked: true,
          unlockedAt: new Date()
        }
      });
    }
  }
  
  return allCompleted;
}
```

### 2. Quiz Submission & Auto-Grading
```typescript
async function submitQuiz(
  userId: string,
  lessonId: number,
  answers: { questionId: number; answer: string }[]
) {
  const questions = await prisma.question.findMany({
    where: { lessonId }
  });
  
  let correctCount = 0;
  const results = [];
  
  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    const isCorrect = answer.answer === question?.correctAnswer;
    
    if (isCorrect) correctCount++;
    
    await prisma.userAnswer.create({
      data: {
        userId,
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        attemptDate: new Date()
      }
    });
    
    results.push({
      questionId: answer.questionId,
      isCorrect,
      explanation: isCorrect 
        ? null 
        : { ar: question.explanationAr, en: question.explanationEn }
    });
  }
  
  const score = (correctCount / questions.length) * 100;
  const passed = score >= 60;
  
  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      completed: passed,
      score,
      attempts: { increment: 1 },
      lastAttempt: new Date()
    },
    create: {
      userId,
      lessonId,
      completed: passed,
      score,
      attempts: 1,
      lastAttempt: new Date()
    }
  });
  
  // Check if this completes the level
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (passed && lesson) {
    await checkAndUnlockNextLevel(userId, lesson.levelId);
  }
  
  return {
    score,
    passed,
    correct: correctCount,
    total: questions.length,
    results
  };
}
```

### 3. Dashboard Progress Calculation
```typescript
async function getDashboardStats(userId: string) {
  const userLevels = await prisma.userLevelStatus.findMany({
    where: { userId },
    include: { level: true }
  });
  
  const currentLevel = userLevels.find(l => l.isUnlocked && !l.completionPercentage === 100)
    || userLevels[0]; // Default to Level 1
  
  const lessonsInCurrentLevel = await prisma.lesson.findMany({
    where: { levelId: currentLevel.levelId },
    include: {
      branch: true,
      userProgress: { where: { userId } }
    }
  });
  
  const branchProgress = {};
  const branches = ['aqeedah', 'fiqh', 'seerah', 'tafseer', 'hadith', 'tarbiyah'];
  
  for (const branchSlug of branches) {
    const branchLessons = lessonsInCurrentLevel.filter(
      l => l.branch.slug === branchSlug
    );
    const completed = branchLessons.filter(
      l => l.userProgress[0]?.completed
    ).length;
    
    branchProgress[branchSlug] = {
      total: branchLessons.length,
      completed,
      percentage: (completed / branchLessons.length) * 100
    };
  }
  
  const totalLessons = lessonsInCurrentLevel.length;
  const completedLessons = lessonsInCurrentLevel.filter(
    l => l.userProgress[0]?.completed
  ).length;
  
  return {
    currentLevel: currentLevel.level,
    overallProgress: (completedLessons / totalLessons) * 100,
    branchProgress,
    totalLessons,
    completedLessons,
    nextLesson: lessonsInCurrentLevel.find(l => !l.userProgress[0]?.completed)
  };
}
```

## Page Structure & Routes

### Public Pages
```
/ - Landing page
/about - About the academy
/login - Login page
/register - Registration
```

### Protected Pages (After Login)
```
/dashboard - Main dashboard
/levels - All levels overview
/level/[levelId] - Specific level (shows 6 branches)
/lesson/[lessonId] - Lesson content + PDF viewer + mind map
/quiz/[lessonId] - Quiz interface
/quiz/[lessonId]/results - Quiz results
/achievements - Badges and achievements
/profile - User profile & settings
```

## Landing Page Structure
```jsx
// Components to include:

1. Hero Section
   - Animated Arabic calligraphy background
   - Headline: "ابنِ إسلامك من الأساس | Build Your Islam From Foundation"
   - Subheadline: "منهج جامعي متكامل لتعليم الإسلام بوعي وعمق"
   - CTA: "ابدأ رحلتك المجانية - Start Free Journey"

2. Vision Section
   - Arabic text explaining the mission
   - Embedded welcome video (YouTube/Vimeo)
   - Key goals (4 cards)

3. Features Section
   - 6 feature cards:
     • 4 Progressive Levels
     • 6 Islamic Sciences
     • Interactive Mind Maps
     • Auto-Graded Quizzes
     • PDF Study Materials
     • Bilingual Content

4. How It Works
   - 3-step process visualization
   1. Register & Start Level 1
   2. Study Lessons & Take Quizzes
   3. Progress Through Levels

5. Testimonials
   - Carousel with student reviews (fake for MVP)
   - Photos + names + countries

6. Statistics
   - Animated counters:
     • X Students
     • Y Lessons
     • Z Countries
     • 4 Levels

7. Final CTA
   - "Join 1000+ Students Worldwide"
   - Registration form inline

8. Footer
   - Social media links
   - Contact info
   - Privacy policy / Terms
```

## Dashboard Layout
```jsx
// Layout structure:

<Sidebar> {/* Fixed left sidebar */}
  - Logo
  - Navigation:
    • Dashboard (Home icon)
    • My Levels (Stack icon)
    • Aqeedah (Book icon)
    • Fiqh (Scale icon)
    • Seerah (User icon)
    • Tafseer (BookOpen icon)
    • Hadith (FileText icon)
    • Tarbiyah (Heart icon)
    • Achievements (Trophy icon)
    • Profile (Settings icon)
  - Language Toggle (AR/EN)
  - Dark Mode Toggle
</Sidebar>

<MainContent>
  <Header>
    - Breadcrumb
    - User menu (notifications, logout)
  </Header>
  
  <DashboardContent>
    {/* Grid layout */}
    
    <CurrentLevelCard> {/* Prominent card */}
      - Level number & name
      - Circular progress chart
      - Stats: X/Y lessons completed
      - "Continue Learning" button
    </CurrentLevelCard>
    
    <BranchProgressGrid> {/* 6 cards */}
      Each card shows:
      - Branch icon & name
      - Progress bar
      - X/Y lessons
      - "Continue" or "Locked" badge
    </BranchProgressGrid>
    
    <NextLessonCard>
      - Thumbnail
      - Lesson title
      - Duration
      - "Start Lesson" CTA
    </NextLessonCard>
    
    <RecentActivityCard>
      - Timeline of last 5 activities
      - Quiz scores
      - Completed lessons
    </RecentActivityCard>
    
    <AchievementsPreview>
      - 3 recent badges
      - "View All" link
    </AchievementsPreview>
  </DashboardContent>
</MainContent>
```

## Lesson Page Structure
```jsx
<LessonLayout>
  <Breadcrumb>
    Level 2 > Aqeedah > Lesson 5: The Six Pillars of Iman
  </Breadcrumb>
  
  <LessonHeader>
    - Title (bilingual)
    - Duration badge
    - PDF download button
    - Bookmark button
  </LessonHeader>
  
  <ContentTabs>
    <Tab label="Content">
      <RichTextContent>
        {/* Render markdown/HTML content */}
        {/* Support: headings, lists, quotes, Arabic text */}
      </RichTextContent>
    </Tab>
    
    <Tab label="PDF Viewer">
      <PDFViewer src={pdfUrl} />
      {/* Use react-pdf with zoom, pagination */}
    </Tab>
    
    <Tab label="Mind Map">
      <InteractiveMindMap data={mindmapData} />
      {/* Collapsible nodes, zoom, pan */}
      {/* Export as image option */}
    </Tab>
  </ContentTabs>
  
  <LessonFooter>
    <CompletionCheckbox>
      "I have finished reading this lesson"
    </CompletionCheckbox>
    
    <NavigationButtons>
      <Button variant="outline">← Previous Lesson</Button>
      <Button variant="primary">Take Quiz →</Button>
    </NavigationButtons>
  </LessonFooter>
</LessonLayout>
```

## Quiz Interface
```jsx
<QuizLayout>
  <QuizHeader>
    <Title>Quiz: The Six Pillars of Iman</Title>
    <ProgressBar current={5} total={15} />
    <Timer>12:34</Timer> {/* Optional */}
  </QuizHeader>
  
  <QuestionCard>
    <QuestionNumber>Question 5 of 15</QuestionNumber>
    <QuestionText>
      {currentQuestion.questionTextAr} {/* or En based on user pref */}
    </QuestionText>
    
    {/* If multiple choice */}
    <OptionsList>
      {options.map((option, idx) => (
        <OptionButton
          key={idx}
          selected={selectedAnswer === idx}
          onClick={() => setSelectedAnswer(idx)}
        >
          {option}
        </OptionButton>
      ))}
    </OptionsList>
    
    {/* If true/false */}
    <TrueFalseButtons>
      <Button>True</Button>
      <Button>False</Button>
    </TrueFalseButtons>
  </QuestionCard>
  
  <NavigationButtons>
    <Button disabled={currentQ === 0}>← Previous</Button>
    <Button onClick={nextQuestion}>
      {isLastQuestion ? "Submit Quiz" : "Next →"}
    </Button>
  </NavigationButtons>
  
  {/* Question navigation dots */}
  <QuestionDots>
    {questions.map((q, idx) => (
      <Dot 
        key={idx}
        answered={answers[idx] !== null}
        current={idx === currentQ}
        onClick={() => goToQuestion(idx)}
      />
    ))}
  </QuestionDots>
</QuizLayout>
```

## Quiz Results Page
```jsx
<ResultsLayout>
  <ResultsHeader>
    {passed ? (
      <SuccessIcon /> {/* Green checkmark */}
      <Title>Congratulations! You Passed!</Title>
    ) : (
      <FailIcon /> {/* Red X */}
      <Title>Keep Trying! You Can Do Better</Title>
    )}
    
    <ScoreDisplay>
      <BigNumber>{score}%</BigNumber>
      <Subtitle>{correct}/{total} Correct</Subtitle>
    </ScoreDisplay>
  </ResultsHeader>
  
  <PassingThreshold>
    <ProgressBar value={score} threshold={60} />
    <Text>Passing score: 60%</Text>
  </PassingThreshold>
  
  <ReviewSection>
    <Title>Review Your Answers</Title>
    {results.map((result, idx) => (
      <AnswerReviewCard key={idx}>
        <QuestionText>{questions[idx].text}</QuestionText>
        <YourAnswer correct={result.isCorrect}>
          {result.answer}
          {result.isCorrect ? <CheckIcon /> : <XIcon />}
        </YourAnswer>
        {!result.isCorrect && (
          <>
            <CorrectAnswer>{questions[idx].correctAnswer}</CorrectAnswer>
            <Explanation>{result.explanation}</Explanation>
          </>
        )}
      </AnswerReviewCard>
    ))}
  </ReviewSection>
  
  <ActionButtons>
    {passed ? (
      <>
        <Button href="/dashboard">Back to Dashboard</Button>
        <Button href={nextLessonUrl}>Next Lesson →</Button>
      </>
    ) : (
      <>
        <Button href={`/lesson/${lessonId}`}>Review Lesson</Button>
        <Button variant="primary">Retake Quiz</Button>
      </>
    )}
  </ActionButtons>
  
  {/* If level completed */}
  {levelCompleted && (
    <LevelCompletionModal>
      <Confetti />
      <Title>🎉 Level {levelNumber} Complete!</Title>
      <Text>You've unlocked Level {levelNumber + 1}</Text>
      <Button>Explore Next Level →</Button>
    </LevelCompletionModal>
  )}
</ResultsLayout>
```

## Interactive Mind Map
```typescript
// Mind map data structure (JSON stored in DB)

interface MindMapNode {
  id: string;
  labelAr: string;
  labelEn: string;
  children?: MindMapNode[];
  color?: string;
  icon?: string;
  expanded?: boolean;
}

// Example for "The Six Pillars of Iman":
{
  id: "root",
  labelAr: "أركان الإيمان الستة",
  labelEn: "The Six Pillars of Iman",
  color: "#4F46E5",
  children: [
    {
      id: "pillar-1",
      labelAr: "الإيمان بالله",
      labelEn: "Belief in Allah",
      children: [
        { id: "p1-1", labelAr: "وحدانيته", labelEn: "His Oneness" },
        { id: "p1-2", labelAr: "أسماؤه وصفاته", labelEn: "His Names & Attributes" },
        { id: "p1-3", labelAr: "ربوبيته", labelEn: "His Lordship" }
      ]
    },
    {
      id: "pillar-2",
      labelAr: "الإيمان بالملائكة",
      labelEn: "Belief in Angels",
      children: [...]
    },
    // ... rest of pillars
  ]
}

// Rendering with react-d3-tree or custom implementation
<MindMapViewer
  data={mindmapData}
  language={userLanguage}
  onNodeClick={handleNodeClick}
  zoomable
  pannable
  exportable
/>
```

## Internationalization (i18n)
```typescript
// Using next-intl

// messages/ar.json
{
  "landing": {
    "hero": {
      "title": "ابنِ إسلامك من الأساس",
      "subtitle": "منهج جامعي متكامل لتعليم الإسلام بوعي وعمق",
      "cta": "ابدأ رحلتك المجانية"
    },
    "features": {
      "title": "لماذا أكاديمية عباد؟",
      "feature1": "4 مستويات تدريجية",
      "feature2": "6 علوم إسلامية"
      // ...
    }
  },
  "dashboard": {
    "welcome": "مرحباً، {{name}}",
    "currentLevel": "المستوى الحالي",
    "progress": "التقدم",
    // ...
  },
  "quiz": {
    "submit": "إرسال الإجابات",
    "score": "نتيجتك",
    "passed": "نجحت!",
    "failed": "حاول مرة أخرى"
  }
}

// messages/en.json
{
  "landing": {
    "hero": {
      "title": "Build Your Islam From Foundation",
      "subtitle": "A comprehensive university-style curriculum",
      "cta": "Start Your Free Journey"
    },
    // ...
  }
}

// Usage in components:
import { useTranslations } from 'next-intl';

function HeroSection() {
  const t = useTranslations('landing.hero');
  
  return (
    <h1>{t('title')}</h1>
  );
}
```

## Styling Guidelines (Tailwind)
```jsx
// Color Palette (Islamic theme)
const colors = {
  primary: {
    50: '#f0fdf4',   // Light green (Islamic color)
    500: '#22c55e',
    700: '#15803d',
    900: '#14532d'
  },
  secondary: {
    500: '#3b82f6',  // Blue (knowledge)
  },
  gold: {
    500: '#f59e0b',  // For badges/achievements
  },
  // Dark mode support
  dark: {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9'
  }
};

// Typography (Arabic + English support)
// Use: font-cairo (Arabic) and font-inter (English)

// Component styling examples:

<Button className="
  px-6 py-3 
  bg-primary-600 hover:bg-primary-700 
  text-white font-semibold
  rounded-lg shadow-lg
  transition-all duration-200
  hover:scale-105
">
  {t('cta')}
</Button>

<Card className="
  bg-white dark:bg-dark-card
  p-6 rounded-xl 
  shadow-sm hover:shadow-md
  border border-gray-100 dark:border-gray-700
  transition-shadow
">
  {children}
</Card>

// RTL support for Arabic
<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

## Authentication Flow
```typescript
// Using NextAuth.js

// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return user;
        }
        return null;
      }
    }),
    GoogleProvider({ // Optional
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error'
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.languagePref = token.languagePref;
      return session;
    }
  }
});

// Registration flow:
// 1. User fills form (name, email, password, language)
// 2. Hash password with bcrypt
// 3. Create user in DB
// 4. Create UserLevelStatus for Level 1 (unlocked by default)
// 5. Redirect to /dashboard
```

## File Upload & Storage (PDFs)
```typescript
// Upload flow using Cloudflare R2 (S3-compatible)

// API route: /api/upload-pdf
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const lessonId = formData.get('lessonId') as string;
  const language = formData.get('language') as string; // 'ar' or 'en'
  
  // Validate admin auth
  const session = await getServerSession();
  if (!session?.user?.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Upload to R2
  const fileName = `lessons/${lessonId}/${language}.pdf`;
  const buffer = await file.arrayBuffer();
  
  await r2Client.putObject({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(buffer),
    ContentType: 'application/pdf'
  });
  
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
  
  // Update lesson in DB
  await prisma.lesson.update({
    where: { id: parseInt(lessonId) },
    data: {
      [language === 'ar' ? 'pdfUrlAr' : 'pdfUrlEn']: publicUrl
    }
  });
  
  return Response.json({ url: publicUrl });
}
```

## Admin Panel Requirements
```typescript
// Create basic admin panel at /admin (protected route)

// Features needed:
// 1. Create/Edit/Delete Levels
// 2. Create/Edit/Delete Lessons
// 3. Upload PDFs (per language)
// 4. Create/Edit Mind Maps (JSON editor)
// 5. Create/Edit Quiz Questions
// 6. View all students & their progress
// 7. Generate reports (completion rates, average scores)

// Admin role in User model:
model User {
  // ... existing fields
  role String @default("student") // "student" or "admin"
}

// Middleware to protect admin routes:
export function middleware(req: NextRequest) {
  const session = await getServerSession();
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute && session?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
```

## Performance Optimizations
```typescript
// 1. Implement pagination for lessons list
// 2. Use React Query for caching API responses
// 3. Lazy load PDF viewer (dynamic import)
// 4. Optimize images with next/image
// 5. Implement Redis caching for dashboard stats
// 6. Use Prisma connection pooling
// 7. Enable Vercel Edge caching for static pages

// Example: React Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    }
  }
});

// Usage in dashboard:
const { data: stats, isLoading } = useQuery({
  queryKey: ['dashboard-stats', userId],
  queryFn: () => fetch('/api/dashboard/stats').then(r => r.json())
});
```

## Testing Strategy
```typescript
// Use Playwright for E2E testing

// Test scenarios:
// 1. User registration flow
// 2. Login/logout
// 3. Complete a lesson
// 4. Take and pass a quiz (score > 60%)
// 5. Take and fail a quiz (score < 60%)
// 6. Level unlock after completing all lessons
// 7. Language switching (AR/EN)
// 8. PDF download
// 9. Mind map interaction
// 10. Dashboard data accuracy

// Example test:
test('Complete lesson and pass quiz to unlock next level', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to a lesson
  await page.click('text=Aqeedah');
  await page.click('text=Lesson 1');
  
  // Mark as read
  await page.check('text=I have finished reading');
  await page.click('text=Take Quiz');
  
  // Answer all questions correctly
  // (This assumes you have test data with known answers)
  await page.click('[data-answer="correct-1"]');
  // ... answer all questions
  await page.click('text=Submit Quiz');
  
  // Verify passing message
  await expect(page.locator('text=Congratulations')).toBeVisible();
  await expect(page.locator('text=80%')).toBeVisible(); // Score
});
```

## MVP Scope (Phase 1)

To launch quickly, focus on:

✅ **Must Have:**
- Landing page with vision & CTA
- User registration & login
- Level 1 only (all 6 branches)
- 3-5 lessons per branch (18-30 total lessons)
- 10 questions per lesson
- PDF upload & viewing
- Basic quiz system with auto-grading
- Dashboard showing progress
- Arabic & English support
- Mobile responsive

❌ **Can Add Later:**
- Interactive mind maps (start with static images)
- Achievements/badges
- Admin panel (use Prisma Studio initially)
- Levels 2-4
- Social features (leaderboard, forums)
- Email notifications
- Advanced analytics

## Deployment Checklist
```bash
# 1. Setup environment variables
POSTGRES_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# 2. Run migrations
npx prisma migrate deploy

# 3. Seed initial data (levels, branches)
npx prisma db seed

# 4. Deploy to Vercel
vercel --prod

# 5. Test all flows in production
# 6. Monitor errors (Sentry integration recommended)
```

## Next Steps

1. **Content Preparation**: Collect and format all Level 1 lessons in both languages
2. **Design System**: Create Figma designs or use shadcn/ui templates
3. **Development**: Start with auth → dashboard → lesson system → quiz
4. **Testing**: Recruit 10-20 beta testers
5. **Launch**: Soft launch with feedback loop
6. **Iterate**: Add Levels 2-4 based on user engagement

## Important Notes

- **GDPR/Privacy**: Add cookie consent, privacy policy
- **Accessibility**: Ensure WCAG 2.1 AA compliance (screen readers, keyboard nav)
- **SEO**: Implement metadata, sitemap, structured data
- **Analytics**: Google Analytics or Plausible
- **Backup**: Daily database backups
- **Security**: Rate limiting, CSRF protection, SQL injection prevention

---

## BUILD INSTRUCTIONS

When implementing this project:

1. **Start with database**: Create Prisma schema, run migrations
2. **Setup auth**: NextAuth.js configuration
3. **Build API routes**: CRUD operations for lessons, quizzes, progress
4. **Create UI components**: Start with shadcn/ui base components
5. **Implement business logic**: Level unlocking, quiz grading
6. **Add i18n**: next-intl setup for Arabic/English
7. **Style with Tailwind**: Islamic-themed color palette
8. **Test thoroughly**: All user flows
9. **Deploy incrementally**: Test each feature in production

**Focus on clean, maintainable code with proper TypeScript types.**

---

Remember: This is a comprehensive educational platform that will impact lives. Build it with care, test extensively, and prioritize user experience.

May Allah bless this project. 🤲