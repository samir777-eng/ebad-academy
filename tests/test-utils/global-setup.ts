import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

declare global {
  var __GLOBAL_TEARDOWN__: (() => void)[];
}

global.__GLOBAL_TEARDOWN__ = [];

const prisma = new PrismaClient();

/**
 * Global test setup - runs once before all tests
 */
export default async function globalSetup() {
  console.log("🧪 Setting up TestSprite test environment...");

  try {
    // Clean up any existing test data
    await cleanupTestData();

    // Create test branches and levels
    await createTestBranches();
    await createTestLevels();

    // Create test lessons with questions
    await createTestLessons();

    // Create test users
    await createTestUsers();

    // Create test badges
    await createTestBadges();

    // Set up performance monitoring
    await setupPerformanceMonitoring();

    console.log("✅ TestSprite environment setup complete!");

    // Register global teardown
    global.__GLOBAL_TEARDOWN__.push(async () => {
      await prisma.$disconnect();
    });
  } catch (error) {
    console.error("❌ Failed to set up test environment:", error);
    throw error;
  }
}

/**
 * Clean up any existing test data
 */
async function cleanupTestData() {
  console.log("🧹 Cleaning up existing test data...");

  // Delete in reverse order due to foreign key constraints
  await prisma.actionItemCompletion.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.spiritualProgress.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.lessonNote.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.userBadge.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.userAnswer.deleteMany({
    where: { attempt: { user: { idNumber: { contains: "TEST_" } } } },
  });

  await prisma.quizAttempt.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.userProgress.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.userLevelStatus.deleteMany({
    where: { user: { idNumber: { contains: "TEST_" } } },
  });

  await prisma.user.deleteMany({
    where: { idNumber: { contains: "TEST_" } },
  });

  // Clean up test lessons, questions, levels, and branches
  await prisma.question.deleteMany({
    where: { lesson: { titleEn: { contains: "TEST_" } } },
  });

  await prisma.lesson.deleteMany({
    where: { titleEn: { contains: "TEST_" } },
  });

  await prisma.level.deleteMany({
    where: { nameEn: { contains: "TEST_" } },
  });

  await prisma.branch.deleteMany({
    where: { nameEn: { contains: "TEST_" } },
  });

  await prisma.badge.deleteMany({
    where: { nameEn: { contains: "TEST_" } },
  });
}

/**
 * Create test branches
 */
async function createTestBranches() {
  console.log("🌿 Creating test branches...");

  const branches = [
    {
      nameAr: "TEST_العقيدة",
      nameEn: "TEST_Aqeedah",
      icon: "book-open",
      slug: "test-aqeedah",
      order: 1,
    },
    {
      nameAr: "TEST_الفقه",
      nameEn: "TEST_Fiqh",
      icon: "balance-scale",
      slug: "test-fiqh",
      order: 2,
    },
    {
      nameAr: "TEST_السيرة",
      nameEn: "TEST_Seerah",
      icon: "user",
      slug: "test-seerah",
      order: 3,
    },
  ];

  for (const branch of branches) {
    await prisma.branch.create({ data: branch });
  }
}

/**
 * Create test levels
 */
async function createTestLevels() {
  console.log("📚 Creating test levels...");

  const levels = [
    {
      levelNumber: 99, // Using high numbers to avoid conflicts
      nameAr: "TEST_المستوى الأول",
      nameEn: "TEST_Level 1",
      descriptionAr: "وصف تجريبي للمستوى الأول",
      descriptionEn: "TEST_Description for Level 1",
      order: 99,
    },
    {
      levelNumber: 100,
      nameAr: "TEST_المستوى الثاني",
      nameEn: "TEST_Level 2",
      descriptionAr: "وصف تجريبي للمستوى الثاني",
      descriptionEn: "TEST_Description for Level 2",
      order: 100,
    },
  ];

  for (const level of levels) {
    await prisma.level.create({ data: level });
  }
}

/**
 * Create test lessons with questions
 */
async function createTestLessons() {
  console.log("📖 Creating test lessons...");

  // Get created test branches and levels
  const testBranch = await prisma.branch.findFirst({
    where: { slug: "test-aqeedah" },
  });

  const testLevel = await prisma.level.findFirst({
    where: { levelNumber: 99 },
  });

  if (!testBranch || !testLevel) {
    throw new Error("Test branch or level not found");
  }

  // Create a test lesson
  const lesson = await prisma.lesson.create({
    data: {
      branchId: testBranch.id,
      levelId: testLevel.id,
      titleAr: "TEST_درس تجريبي",
      titleEn: "TEST_Sample Lesson",
      descriptionAr: "وصف الدرس التجريبي",
      descriptionEn: "TEST_Sample lesson description",
      videoUrlsAr: '["https://example.com/video1-ar.mp4"]',
      videoUrlsEn: '["https://example.com/video1-en.mp4"]',
      pdfUrlAr: "https://example.com/lesson-ar.pdf",
      pdfUrlEn: "https://example.com/lesson-en.pdf",
      mindmapData: '{"nodes": [], "edges": []}',
      actionItemsAr: '["عمل تجريبي 1", "عمل تجريبي 2"]',
      actionItemsEn: '["TEST_Action item 1", "TEST_Action item 2"]',
      duration: 30,
      order: 1,
    },
  });

  // Create test questions for the lesson
  const questions = [
    {
      lessonId: lesson.id,
      questionTextAr: "ما هو الإسلام؟",
      questionTextEn: "What is Islam?",
      type: "multiple_choice",
      optionsAr: '["دين", "لغة", "بلد", "طعام"]',
      optionsEn: '["Religion", "Language", "Country", "Food"]',
      correctAnswer: "0", // First option (Religion)
      explanationAr: "الإسلام دين سماوي",
      explanationEn: "Islam is a divine religion",
      order: 1,
    },
    {
      lessonId: lesson.id,
      questionTextAr: "هل القرآن كتاب مقدس؟",
      questionTextEn: "Is the Quran a holy book?",
      type: "true_false",
      optionsAr: null,
      optionsEn: null,
      correctAnswer: "true",
      explanationAr: "نعم، القرآن الكريم كتاب مقدس",
      explanationEn: "Yes, the Noble Quran is a holy book",
      order: 2,
    },
    {
      lessonId: lesson.id,
      questionTextAr: "كم عدد أركان الإسلام؟",
      questionTextEn: "How many pillars of Islam are there?",
      type: "multiple_choice",
      optionsAr: '["3", "4", "5", "6"]',
      optionsEn: '["3", "4", "5", "6"]',
      correctAnswer: "2", // Third option (5)
      explanationAr: "أركان الإسلام خمسة",
      explanationEn: "There are five pillars of Islam",
      order: 3,
    },
    {
      lessonId: lesson.id,
      questionTextAr: "هل الصلاة واجبة؟",
      questionTextEn: "Is prayer obligatory?",
      type: "true_false",
      optionsAr: null,
      optionsEn: null,
      correctAnswer: "true",
      explanationAr: "نعم، الصلاة فريضة على كل مسلم",
      explanationEn: "Yes, prayer is obligatory for every Muslim",
      order: 4,
    },
    {
      lessonId: lesson.id,
      questionTextAr: "ما اسم النبي الأخير؟",
      questionTextEn: "What is the name of the final prophet?",
      type: "multiple_choice",
      optionsAr: '["موسى", "عيسى", "محمد", "إبراهيم"]',
      optionsEn: '["Moses", "Jesus", "Muhammad", "Abraham"]',
      correctAnswer: "2", // Third option (Muhammad)
      explanationAr: "محمد صلى الله عليه وسلم هو النبي الأخير",
      explanationEn: "Muhammad (peace be upon him) is the final prophet",
      order: 5,
    },
  ];

  for (const question of questions) {
    await prisma.question.create({ data: question });
  }
}

/**
 * Create test users with different roles and progress states
 */
async function createTestUsers() {
  console.log("👤 Creating test users...");

  const hashedPassword = await bcrypt.hash("TestSprite123!", 12);

  // Also create password hash for security tests
  const securityTestPassword = await bcrypt.hash("password", 12);

  const users = [
    {
      idNumber: "TEST_STU_001",
      email: "student1@testsprite.com",
      name: "Test Student One",
      phoneNumber: "+966501234567",
      password: hashedPassword,
      role: "student",
      languagePref: "en",
    },
    {
      idNumber: "TEST_STU_002",
      email: "student2@testsprite.com",
      name: "طالب تجريبي اثنان",
      phoneNumber: "+966507654321",
      password: hashedPassword,
      role: "student",
      languagePref: "ar",
    },
    {
      idNumber: "TEST_ADM_001",
      email: "admin@testsprite.com",
      name: "Test Admin",
      phoneNumber: "+966509876543",
      password: hashedPassword,
      role: "admin",
      languagePref: "en",
    },
    // Security test users
    {
      idNumber: "TEST_SEC_001",
      email: "test@example.com",
      name: "Test User",
      phoneNumber: "+966501111111",
      password: securityTestPassword,
      role: "student",
      languagePref: "en",
    },
    {
      idNumber: "TEST_SEC_002",
      email: "student@example.com",
      name: "Student User",
      phoneNumber: "+966502222222",
      password: await bcrypt.hash("student123", 12),
      role: "student",
      languagePref: "en",
    },
    {
      idNumber: "TEST_SEC_003",
      email: "admin@example.com",
      name: "Admin User",
      phoneNumber: "+966503333333",
      password: await bcrypt.hash("admin123", 12),
      role: "admin",
      languagePref: "en",
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const createdUser = await prisma.user.create({ data: user });
    createdUsers.push(createdUser);
  }

  // Create some progress for test users
  const testLevel = await prisma.level.findFirst({
    where: { levelNumber: 99 },
  });
  if (testLevel && createdUsers[0]) {
    await prisma.userLevelStatus.create({
      data: {
        userId: createdUsers[0].id,
        levelId: testLevel.id,
        isUnlocked: true,
        completionPercentage: 0,
        unlockedAt: new Date(),
      },
    });
  }
}

/**
 * Create test badges
 */
async function createTestBadges() {
  console.log("🏆 Creating test badges...");

  const badges = [
    {
      nameAr: "TEST_المبتدئ",
      nameEn: "TEST_Beginner",
      descriptionAr: "شارة للمبتدئين",
      descriptionEn: "Badge for beginners",
      iconUrl: "/badges/test-beginner.png",
      criteria: '{"type": "lessons_completed", "count": 1}',
    },
    {
      nameAr: "TEST_المثابر",
      nameEn: "TEST_Persistent",
      descriptionAr: "شارة للمثابرين",
      descriptionEn: "Badge for persistent learners",
      iconUrl: "/badges/test-persistent.png",
      criteria: '{"type": "quiz_retries", "count": 3}',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }
}

/**
 * Setup performance monitoring baseline
 */
async function setupPerformanceMonitoring() {
  console.log("📊 Setting up performance monitoring...");

  // Performance baselines for TestSprite requirements
  process.env.TEST_PERFORMANCE_BASELINES = JSON.stringify({
    pageLoad: {
      fast3G: 3000, // 3 seconds max on Fast 3G
      wifi: 2000, // 2 seconds max on WiFi
    },
    coreWebVitals: {
      LCP: 2500, // Largest Contentful Paint
      FID: 100, // First Input Delay
      CLS: 0.1, // Cumulative Layout Shift
    },
    memory: {
      maxHeapMB: 100, // Max 100MB heap usage
      maxLeakMB: 10, // Max 10MB memory leak
    },
    api: {
      responseTime: 1000, // Max 1 second API response
    },
  });
}

/**
 * Utility function to get test data
 */
export async function getTestData() {
  const testBranch = await prisma.branch.findFirst({
    where: { slug: "test-aqeedah" },
  });

  const testLevel = await prisma.level.findFirst({
    where: { levelNumber: 99 },
  });

  const testLesson = await prisma.lesson.findFirst({
    where: { titleEn: { contains: "TEST_" } },
    include: { questions: true },
  });

  const testUsers = await prisma.user.findMany({
    where: { idNumber: { contains: "TEST_" } },
  });

  return {
    branch: testBranch,
    level: testLevel,
    lesson: testLesson,
    users: testUsers,
  };
}
