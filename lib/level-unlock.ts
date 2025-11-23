import { prisma } from "@/lib/prisma";

/**
 * Check if a user has completed all requirements for a level and unlock the next level if so
 * Requirements:
 * 1. All lessons in the level must have a passing quiz attempt (score >= 60%)
 * 2. All lessons must be marked as completed in UserProgress
 */
export async function checkAndUnlockNextLevel(
  userId: string,
  currentLevelId: number
): Promise<{
  levelUnlocked: boolean;
  nextLevelId?: number;
  completionPercentage: number;
}> {
  try {
    // Get all lessons for the current level
    const lessonsInLevel = await prisma.lesson.findMany({
      where: { levelId: currentLevelId },
      select: { id: true },
    });

    if (lessonsInLevel.length === 0) {
      return { levelUnlocked: false, completionPercentage: 0 };
    }

    const lessonIds = lessonsInLevel.map((l) => l.id);

    // Get user's progress for all lessons in this level
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
        completed: true, // Only count completed lessons
      },
    });

    // Get user's best quiz attempts for all lessons in this level
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
        passed: true, // Only count passing attempts
      },
      distinct: ["lessonId"], // Get one per lesson
      orderBy: {
        score: "desc", // Get the best score
      },
    });

    // Calculate completion percentage
    const completedLessons = new Set([
      ...userProgress.map((p) => p.lessonId),
      ...quizAttempts.map((a) => a.lessonId),
    ]);

    // A lesson is considered complete if BOTH conditions are met:
    // 1. It has a passing quiz attempt
    // 2. It's marked as completed in UserProgress
    const fullyCompletedLessons = lessonIds.filter(
      (lessonId) =>
        userProgress.some((p) => p.lessonId === lessonId && p.completed) &&
        quizAttempts.some((a) => a.lessonId === lessonId)
    );

    const completionPercentage =
      (fullyCompletedLessons.length / lessonsInLevel.length) * 100;

    // Update current level completion percentage
    await prisma.userLevelStatus.upsert({
      where: {
        userId_levelId: {
          userId,
          levelId: currentLevelId,
        },
      },
      update: {
        completionPercentage,
      },
      create: {
        userId,
        levelId: currentLevelId,
        isUnlocked: true,
        completionPercentage,
      },
    });

    // Check if all lessons are completed
    const allLessonsCompleted =
      fullyCompletedLessons.length === lessonsInLevel.length;

    if (!allLessonsCompleted) {
      return { levelUnlocked: false, completionPercentage };
    }

    // All lessons completed! Check if there's a next level
    const currentLevel = await prisma.level.findUnique({
      where: { id: currentLevelId },
    });

    if (!currentLevel) {
      return { levelUnlocked: false, completionPercentage };
    }

    // Find the next level
    const nextLevel = await prisma.level.findFirst({
      where: {
        levelNumber: currentLevel.levelNumber + 1,
      },
    });

    if (!nextLevel) {
      // No next level (user completed the last level!)
      return { levelUnlocked: false, completionPercentage };
    }

    // Check if next level is already unlocked
    const nextLevelStatus = await prisma.userLevelStatus.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: nextLevel.id,
        },
      },
    });

    if (nextLevelStatus?.isUnlocked) {
      // Already unlocked
      return {
        levelUnlocked: false,
        nextLevelId: nextLevel.id,
        completionPercentage,
      };
    }

    // Unlock the next level AND all previous levels
    // This ensures that if a user progresses to Level 3, Levels 1 and 2 are also unlocked
    const allLevelsToUnlock = await prisma.level.findMany({
      where: {
        levelNumber: {
          lte: nextLevel.levelNumber, // Less than or equal to next level
        },
      },
    });

    // Unlock all levels up to and including the next level
    await Promise.all(
      allLevelsToUnlock.map((level) =>
        prisma.userLevelStatus.upsert({
          where: {
            userId_levelId: {
              userId,
              levelId: level.id,
            },
          },
          update: {
            isUnlocked: true,
            unlockedAt: new Date(),
          },
          create: {
            userId,
            levelId: level.id,
            isUnlocked: true,
            unlockedAt: new Date(),
            completionPercentage: level.id === nextLevel.id ? 0 : undefined,
          },
        })
      )
    );

    // Check and award badges after unlocking level
    const { checkAndAwardBadges } = await import("@/lib/badge-checker");
    await checkAndAwardBadges(userId);

    // Send email notification (async, don't wait)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user) {
      sendEmail(
        user.email,
        createLevelUnlockedEmail({
          name: user.name || "Student",
          email: user.email,
          levelNumber: nextLevel.levelNumber,
          levelName: nextLevel.nameEn,
        })
      ).catch((err) =>
        console.error("Failed to send level unlock email:", err)
      );
    }

    return {
      levelUnlocked: true,
      nextLevelId: nextLevel.id,
      completionPercentage,
    };
  } catch (error) {
    console.error("Error checking level unlock:", error);
    return { levelUnlocked: false, completionPercentage: 0 };
  }
}
