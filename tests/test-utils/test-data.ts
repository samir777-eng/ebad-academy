/**
 * TestSprite Test Data Configuration
 * Centralized test data management for all test scenarios
 */

export const TEST_CONFIG = {
  // Test environment settings
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  
  // Performance benchmarks (TestSprite requirements)
  performance: {
    pageLoad: {
      fast3G: 3000,    // 3 seconds max on Fast 3G
      wifi: 2000,      // 2 seconds max on WiFi  
      mobile: 4000     // 4 seconds max on mobile
    },
    coreWebVitals: {
      LCP: 2500,       // Largest Contentful Paint
      FID: 100,        // First Input Delay
      CLS: 0.1         // Cumulative Layout Shift
    },
    memory: {
      maxHeapMB: 100,  // Max 100MB heap usage
      maxLeakMB: 10    // Max 10MB memory leak
    },
    api: {
      responseTime: 1000  // Max 1 second API response
    }
  },
  
  // Quiz scoring system (60% passing threshold)
  quiz: {
    passingScore: 60,
    totalQuestions: 5,
    maxRetries: 3,
    timeLimit: 300000 // 5 minutes in milliseconds
  },
  
  // Islamic education content structure
  education: {
    levels: 4,
    branchesPerLevel: 6,
    branches: [
      { name: 'Aqeedah', nameAr: 'العقيدة', slug: 'aqeedah' },
      { name: 'Fiqh', nameAr: 'الفقه', slug: 'fiqh' },
      { name: 'Seerah', nameAr: 'السيرة', slug: 'seerah' },
      { name: 'Tafseer', nameAr: 'التفسير', slug: 'tafseer' },
      { name: 'Hadith', nameAr: 'الحديث', slug: 'hadith' },
      { name: 'Tarbiyah', nameAr: 'التربية', slug: 'tarbiyah' }
    ]
  }
};

// Test user credentials for different scenarios
export const TEST_USERS = {
  // Valid test users
  validStudentEn: {
    idNumber: 'TEST_STU_001',
    email: 'student1@testsprite.com',
    name: 'Test Student One',
    phoneNumber: '+966501234567',
    password: 'TestSprite123!',
    confirmPassword: 'TestSprite123!',
    role: 'student',
    languagePref: 'en'
  },
  
  validStudentAr: {
    idNumber: 'TEST_STU_002', 
    email: 'student2@testsprite.com',
    name: 'طالب تجريبي اثنان',
    phoneNumber: '+966507654321',
    password: 'TestSprite123!',
    confirmPassword: 'TestSprite123!',
    role: 'student',
    languagePref: 'ar'
  },
  
  validAdmin: {
    idNumber: 'TEST_ADM_001',
    email: 'admin@testsprite.com', 
    name: 'Test Admin',
    phoneNumber: '+966509876543',
    password: 'TestSprite123!',
    confirmPassword: 'TestSprite123!',
    role: 'admin',
    languagePref: 'en'
  },
  
  // Invalid credentials for security testing
  invalidUser: {
    idNumber: 'INVALID_USER',
    password: 'wrongpassword'
  }
};

// Registration test data for boundary testing
export const REGISTRATION_TEST_DATA = {
  valid: {
    idNumber: 'TEST_REG_001',
    email: 'newuser@testsprite.com',
    name: 'New Test User',
    phoneNumber: '+966512345678',
    password: 'ValidPassword123!',
    confirmPassword: 'ValidPassword123!'
  },
  
  // Boundary cases
  shortPassword: {
    idNumber: 'TEST_REG_002',
    email: 'short@testsprite.com', 
    name: 'Short Password User',
    phoneNumber: '+966512345679',
    password: '123',
    confirmPassword: '123'
  },
  
  longName: {
    idNumber: 'TEST_REG_003',
    email: 'longname@testsprite.com',
    name: 'A'.repeat(100), // Very long name
    phoneNumber: '+966512345680',
    password: 'ValidPassword123!',
    confirmPassword: 'ValidPassword123!'
  },
  
  invalidEmail: {
    idNumber: 'TEST_REG_004',
    email: 'invalid-email-format',
    name: 'Invalid Email User',
    phoneNumber: '+966512345681',
    password: 'ValidPassword123!',
    confirmPassword: 'ValidPassword123!'
  },
  
  mismatchedPasswords: {
    idNumber: 'TEST_REG_005',
    email: 'mismatch@testsprite.com',
    name: 'Mismatched Password User',
    phoneNumber: '+966512345682',
    password: 'ValidPassword123!',
    confirmPassword: 'DifferentPassword123!'
  },
  
  duplicateEmail: {
    idNumber: 'TEST_REG_006',
    email: 'student1@testsprite.com', // Already exists
    name: 'Duplicate Email User',
    phoneNumber: '+966512345683',
    password: 'ValidPassword123!',
    confirmPassword: 'ValidPassword123!'
  }
};

// Security test payloads
export const SECURITY_TEST_DATA = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'/*",
    "' UNION SELECT * FROM users --",
    "1'; EXEC xp_cmdshell('dir'); --"
  ],
  
  xssPayloads: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>'
  ],
  
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '../config/database.yml',
    '../../app/config/parameters.yml'
  ],
  
  commandInjection: [
    '; cat /etc/passwd',
    '| dir',
    '`whoami`',
    '$(cat /etc/passwd)',
    '; rm -rf /'
  ]
};

// Performance test scenarios
export const PERFORMANCE_TEST_SCENARIOS = {
  // Page load scenarios
  pages: [
    { name: 'Homepage', url: '/ar', maxLoadTime: 2000 },
    { name: 'Login', url: '/ar/login', maxLoadTime: 1500 },
    { name: 'Dashboard', url: '/ar/dashboard', maxLoadTime: 3000 },
    { name: 'Quiz', url: '/ar/quiz/1', maxLoadTime: 2500 },
    { name: 'Leaderboard', url: '/ar/leaderboard', maxLoadTime: 2000 }
  ],
  
  // API endpoints
  apis: [
    { name: 'User Profile', endpoint: '/api/profile', maxResponseTime: 1000 },
    { name: 'Quiz Submit', endpoint: '/api/quiz/submit', maxResponseTime: 1500 },
    { name: 'Progress Update', endpoint: '/api/progress', maxResponseTime: 800 },
    { name: 'Leaderboard Data', endpoint: '/api/leaderboard', maxResponseTime: 1200 }
  ],
  
  // Load testing parameters
  load: {
    concurrentUsers: 50,
    duration: 60000, // 1 minute
    rampUpTime: 10000 // 10 seconds
  }
};

// Internationalization test data
export const I18N_TEST_DATA = {
  languages: ['ar', 'en'],
  
  // Text samples for both languages
  textSamples: {
    ar: {
      greeting: 'أهلاً وسهلاً',
      level: 'المستوى',
      quiz: 'الاختبار',
      progress: 'التقدم'
    },
    en: {
      greeting: 'Welcome',
      level: 'Level',
      quiz: 'Quiz', 
      progress: 'Progress'
    }
  },
  
  // Date/time formatting tests
  dateFormats: {
    ar: {
      locale: 'ar-SA',
      timezone: 'Asia/Riyadh',
      expectedFormat: /^\d{1,2}\/\d{1,2}\/\d{4}$/
    },
    en: {
      locale: 'en-US',
      timezone: 'America/New_York',
      expectedFormat: /^\d{1,2}\/\d{1,2}\/\d{4}$/
    }
  }
};

// Accessibility test configuration
export const ACCESSIBILITY_TEST_DATA = {
  // WCAG 2.1 AA compliance requirements
  wcagLevel: 'AA',
  
  // Color contrast requirements
  colorContrast: {
    normalText: 4.5,
    largeText: 3.0
  },
  
  // Required ARIA attributes
  requiredAria: [
    'aria-label',
    'aria-labelledby', 
    'aria-describedby',
    'role'
  ],
  
  // Keyboard navigation requirements
  keyboardNav: {
    tabOrder: true,
    escapeKey: true,
    enterKey: true,
    arrowKeys: true
  }
};

// Mobile test configurations
export const MOBILE_TEST_DATA = {
  devices: [
    {
      name: 'iPhone SE',
      viewport: { width: 375, height: 667 },
      userAgent: 'iPhone'
    },
    {
      name: 'Samsung Galaxy S21',
      viewport: { width: 360, height: 800 },
      userAgent: 'Android'
    },
    {
      name: 'iPad',
      viewport: { width: 768, height: 1024 },
      userAgent: 'iPad'
    }
  ],
  
  // Touch gesture requirements
  touchGestures: [
    'tap',
    'swipe',
    'pinch',
    'scroll'
  ],
  
  // Mobile-specific performance thresholds
  performance: {
    maxLoadTime: 4000,
    maxMemoryMB: 50
  }
};

// Quiz test data with known correct answers
export const QUIZ_TEST_DATA = {
  sampleQuestions: [
    {
      id: 1,
      type: 'multiple_choice',
      questionEn: 'What is Islam?',
      questionAr: 'ما هو الإسلام؟',
      options: ['Religion', 'Language', 'Country', 'Food'],
      optionsAr: ['دين', 'لغة', 'بلد', 'طعام'],
      correctAnswer: 0, // First option (Religion/دين)
      explanation: 'Islam is a divine religion'
    },
    {
      id: 2,
      type: 'true_false',
      questionEn: 'Is the Quran a holy book?',
      questionAr: 'هل القرآن كتاب مقدس؟',
      correctAnswer: true,
      explanation: 'Yes, the Noble Quran is a holy book'
    },
    {
      id: 3,
      type: 'multiple_choice',
      questionEn: 'How many pillars of Islam are there?',
      questionAr: 'كم عدد أركان الإسلام؟',
      options: ['3', '4', '5', '6'],
      optionsAr: ['3', '4', '5', '6'],
      correctAnswer: 2, // Third option (5)
      explanation: 'There are five pillars of Islam'
    },
    {
      id: 4,
      type: 'true_false',
      questionEn: 'Is prayer obligatory?',
      questionAr: 'هل الصلاة واجبة؟',
      correctAnswer: true,
      explanation: 'Yes, prayer is obligatory for every Muslim'
    },
    {
      id: 5,
      type: 'multiple_choice',
      questionEn: 'What is the name of the final prophet?',
      questionAr: 'ما اسم النبي الأخير؟',
      options: ['Moses', 'Jesus', 'Muhammad', 'Abraham'],
      optionsAr: ['موسى', 'عيسى', 'محمد', 'إبراهيم'],
      correctAnswer: 2, // Third option (Muhammad/محمد)
      explanation: 'Muhammad (peace be upon him) is the final prophet'
    }
  ],
  
  // Score calculation scenarios
  scoreScenarios: [
    { correctAnswers: 5, totalQuestions: 5, expectedScore: 100, shouldPass: true },
    { correctAnswers: 4, totalQuestions: 5, expectedScore: 80, shouldPass: true },
    { correctAnswers: 3, totalQuestions: 5, expectedScore: 60, shouldPass: true },
    { correctAnswers: 2, totalQuestions: 5, expectedScore: 40, shouldPass: false },
    { correctAnswers: 1, totalQuestions: 5, expectedScore: 20, shouldPass: false },
    { correctAnswers: 0, totalQuestions: 5, expectedScore: 0, shouldPass: false }
  ]
};

// Spiritual progress tracking test data
export const SPIRITUAL_PROGRESS_TEST_DATA = {
  validEntries: [
    {
      date: new Date().toISOString().split('T')[0],
      fajr: true,
      dhuhr: true, 
      asr: false,
      maghrib: true,
      isha: false,
      quranPages: 2,
      quranMinutes: 30,
      fasting: false,
      charity: true,
      charityAmount: 50,
      dhikr: true,
      dhikrCount: 100,
      dua: true,
      notes: 'Good spiritual day'
    },
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      quranPages: 5,
      quranMinutes: 60,
      fasting: true,
      charity: false,
      charityAmount: 0,
      dhikr: true,
      dhikrCount: 200,
      dua: true,
      notes: 'Excellent spiritual day - all prayers on time'
    }
  ]
};

// Error scenarios for robustness testing
export const ERROR_SCENARIOS = {
  network: [
    { name: 'Slow 3G', delay: 2000 },
    { name: 'Connection timeout', timeout: 5000 },
    { name: 'Intermittent connection', dropRate: 0.1 }
  ],
  
  server: [
    { statusCode: 500, message: 'Internal Server Error' },
    { statusCode: 503, message: 'Service Unavailable' },
    { statusCode: 404, message: 'Not Found' },
    { statusCode: 401, message: 'Unauthorized' }
  ],
  
  client: [
    { scenario: 'JavaScript disabled' },
    { scenario: 'Local storage disabled' },
    { scenario: 'Cookies disabled' }
  ]
};

export default {
  TEST_CONFIG,
  TEST_USERS,
  REGISTRATION_TEST_DATA,
  SECURITY_TEST_DATA,
  PERFORMANCE_TEST_SCENARIOS,
  I18N_TEST_DATA,
  ACCESSIBILITY_TEST_DATA,
  MOBILE_TEST_DATA,
  QUIZ_TEST_DATA,
  SPIRITUAL_PROGRESS_TEST_DATA,
  ERROR_SCENARIOS
};