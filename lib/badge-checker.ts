import { prisma } from "@/lib/prisma";

/**
 * Check and award badges to a user based on their progress
 * Call this function after:
 * - Completing a lesson
 * - Passing a quiz
 * - Unlocking a level
 */
export async function checkAndAwardBadges(userId: string): Promise<number[]> {
  try {
    // Get user's progress data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          where: { completed: true },
        },
        quizAttempts: {
          where: { passed: true },
        },
        levelStatus: {
          where: { isUnlocked: true },
          include: { level: true },
        },
        badges: {
          select: { badgeId: true },
        },
      },
    });

    if (!user) {
      return [];
    }

    // Get all auto-award badges (not manual)
    const badges = await prisma.badge.findMany({
      where: {
        criteriaType: { not: "manual" },
      },
    });

    const newlyAwardedBadgeIds: number[] = [];

    for (const badge of badges) {
      // Check if user already has this badge
      const alreadyHas = user.badges.some((ub) => ub.badgeId === badge.id);
      if (alreadyHas) continue;

      let shouldAward = false;

      // Check criteria based on type
      switch (badge.criteriaType) {
        case "lessons_completed":
          // Count completed lessons
          shouldAward = user.progress.length >= badge.criteriaValue;
          break;

        case "level_completed":
          // Check if specific level is unlocked
          // Level is considered "completed" if the next level is unlocked
          // Or if it's the last level and all lessons are completed
          const targetLevel = badge.criteriaValue;
          const nextLevel = targetLevel + 1;

          // Check if next level is unlocked (meaning target level is completed)
          const nextLevelUnlocked = user.levelStatus.some(
            (ls) => ls.level.levelNumber === nextLevel && ls.isUnlocked
          );

          // Or if it's level 4 (last level), check if it's unlocked
          const isLastLevel = targetLevel === 4;
          const lastLevelUnlocked =
            isLastLevel &&
            user.levelStatus.some(
              (ls) => ls.level.levelNumber === targetLevel && ls.isUnlocked
            );

          shouldAward = nextLevelUnlocked || lastLevelUnlocked;
          break;

        case "quizzes_passed":
          // Count passed quizzes (score >= 60%)
          shouldAward = user.quizAttempts.length >= badge.criteriaValue;
          break;

        case "perfect_score":
          // Count quizzes with 100% score
          const perfectScores = user.quizAttempts.filter(
            (attempt) => attempt.score === 100
          );
          shouldAward = perfectScores.length >= badge.criteriaValue;
          break;

        default:
          // Unknown criteria type, skip
          continue;
      }

      // Award the badge if criteria met
      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
        newlyAwardedBadgeIds.push(badge.id);

        // Send email notification (async, don't wait)
        sendEmail(
          user.email,
          createBadgeEarnedEmail({
            name: user.name || "Student",
            email: user.email,
            badgeName: badge.nameEn,
            badgeDescription: badge.descriptionEn,
            badgeIcon: badge.icon,
          })
        ).catch((err) => console.error("Failed to send badge email:", err));
      }
    }

    return newlyAwardedBadgeIds;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
}

/**
 * Manually award a badge to a user (for manual badges)
 */
export async function manuallyAwardBadge(
  userId: string,
  badgeId: number
): Promise<boolean> {
  try {
    // Check if user already has this badge
    const existing = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId,
      },
    });

    if (existing) {
      return false; // Already has badge
    }

    // Award the badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
    });

    return true;
  } catch (error) {
    console.error("Error manually awarding badge:", error);
    return false;
  }
}

/**
 * Get newly awarded badges with full details
 */
export async function getNewlyAwardedBadges(badgeIds: number[]) {
  if (badgeIds.length === 0) return [];

  return await prisma.badge.findMany({
    where: {
      id: { in: badgeIds },
    },
  });
}
