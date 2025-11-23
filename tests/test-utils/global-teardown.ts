import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Global test teardown - runs once after all tests
 */
export default async function globalTeardown() {
  console.log('🧹 Cleaning up TestSprite test environment...');

  try {
    // Clean up all test data
    await cleanupAllTestData();

    // Execute any registered teardown callbacks
    if (global.__GLOBAL_TEARDOWN__) {
      for (const teardownFn of global.__GLOBAL_TEARDOWN__) {
        await teardownFn();
      }
    }

    console.log('✅ TestSprite environment cleanup complete!');

  } catch (error) {
    console.error('❌ Failed to clean up test environment:', error);
    // Don't throw here to prevent failing the test run
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up all test data
 */
async function cleanupAllTestData() {
  console.log('🗑️ Removing all test data...');
  
  try {
    // Delete in reverse order due to foreign key constraints
    await prisma.actionItemCompletion.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.spiritualProgress.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.lessonNote.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.userBadge.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.userAnswer.deleteMany({
      where: { attempt: { user: { idNumber: { contains: 'TEST_' } } } }
    });
    
    await prisma.quizAttempt.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.userProgress.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.userLevelStatus.deleteMany({
      where: { user: { idNumber: { contains: 'TEST_' } } }
    });
    
    await prisma.user.deleteMany({
      where: { idNumber: { contains: 'TEST_' } }
    });

    // Clean up test lessons, questions, levels, and branches
    await prisma.question.deleteMany({
      where: { lesson: { titleEn: { contains: 'TEST_' } } }
    });
    
    await prisma.lesson.deleteMany({
      where: { titleEn: { contains: 'TEST_' } }
    });
    
    await prisma.level.deleteMany({
      where: { nameEn: { contains: 'TEST_' } }
    });
    
    await prisma.branch.deleteMany({
      where: { nameEn: { contains: 'TEST_' } }
    });

    await prisma.badge.deleteMany({
      where: { nameEn: { contains: 'TEST_' } }
    });

    console.log('✅ Test data cleanup completed');

  } catch (error) {
    console.error('❌ Error during test data cleanup:', error);
    // Continue with teardown even if cleanup fails
  }
}