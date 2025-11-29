import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // OPTIMIZATION: Fetch all data in parallel using Promise.all with select statements
    const [allLevels, userLevels, recentActivity] = await Promise.all([
      // Query 1: Get all levels with only needed fields
      prisma.level.findMany({
        select: {
          id: true,
          levelNumber: true,
          nameAr: true,
          nameEn: true,
          descriptionAr: true,
          descriptionEn: true,
        },
        orderBy: { levelNumber: "asc" },
      }),
      // Query 2: Get user's level status with level data (only needed fields)
      prisma.userLevelStatus.findMany({
        where: { userId },
        select: {
          levelId: true,
          isUnlocked: true,
          completionPercentage: true,
          level: {
            select: {
              id: true,
              levelNumber: true,
              nameAr: true,
              nameEn: true,
              descriptionAr: true,
              descriptionEn: true,
            },
          },
        },
        orderBy: { level: { levelNumber: "asc" } },
      }),
      // Query 3: Get recent activity (last 5 completed lessons) with only needed fields
      prisma.userProgress.findMany({
        where: {
          userId,
          completed: true,
        },
        select: {
          score: true,
          updatedAt: true,
          lesson: {
            select: {
              titleEn: true,
              titleAr: true,
              branch: {
                select: {
                  nameEn: true,
                  nameAr: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    // If user has no level status, create them
    let finalUserLevels = userLevels;
    if (userLevels.length === 0) {
      // Create level status for all levels (only first level unlocked)
      try {
        await prisma.userLevelStatus.createMany({
          data: allLevels.map((level, index) => ({
            userId,
            levelId: level.id,
            isUnlocked: index === 0, // Only unlock first level
            completionPercentage: 0,
          })),
        });
      } catch (error) {
        // Ignore duplicate key errors (race condition)
        logger.log("Level status already exists, skipping creation");
      }

      // Fetch the newly created level statuses with only needed fields
      finalUserLevels = await prisma.userLevelStatus.findMany({
        where: { userId },
        select: {
          levelId: true,
          isUnlocked: true,
          completionPercentage: true,
          level: {
            select: {
              id: true,
              levelNumber: true,
              nameAr: true,
              nameEn: true,
              descriptionAr: true,
              descriptionEn: true,
            },
          },
        },
        orderBy: { level: { levelNumber: "asc" } },
      });
    }

    // Find current level (first unlocked level that's not 100% complete)
    const currentLevel =
      finalUserLevels.find(
        (l) => l.isUnlocked && l.completionPercentage < 100
      ) || finalUserLevels[0];

    // Safety check: if no levels exist, return empty data
    if (!currentLevel) {
      return NextResponse.json({
        totalLessons: 0,
        completedLessons: 0,
        currentLevel: null,
        lessonsInCurrentLevel: [],
        recentActivity: [],
      });
    }

    // Get all lessons in current level with user progress (only needed fields)
    const lessonsInCurrentLevel = await prisma.lesson.findMany({
      where: { levelId: currentLevel.levelId },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
          },
        },
        userProgress: {
          where: { userId },
          select: {
            completed: true,
            score: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Calculate branch progress (in-memory, no DB queries)
    const branches = [
      "aqeedah",
      "fiqh",
      "seerah",
      "tafseer",
      "hadith",
      "tarbiyah",
    ];
    const branchProgress: Record<string, any> = {};

    for (const branchSlug of branches) {
      const branchLessons = lessonsInCurrentLevel.filter(
        (l) => l.branch.slug === branchSlug
      );
      const completed = branchLessons.filter(
        (l) => l.userProgress[0]?.completed
      ).length;

      branchProgress[branchSlug] = {
        total: branchLessons.length,
        completed,
        percentage:
          branchLessons.length > 0
            ? (completed / branchLessons.length) * 100
            : 0,
      };
    }

    // Calculate overall progress (in-memory)
    const totalLessons = lessonsInCurrentLevel.length;
    const completedLessons = lessonsInCurrentLevel.filter(
      (l) => l.userProgress[0]?.completed
    ).length;

    // Find next lesson (in-memory)
    const nextLesson = lessonsInCurrentLevel.find(
      (l) => !l.userProgress[0]?.completed
    );

    // Get all unlocked levels (in-memory)
    const unlockedLevels = finalUserLevels
      .filter((l) => l.isUnlocked)
      .map((l) => ({
        id: l.level.id,
        number: l.level.levelNumber,
        nameEn: l.level.nameEn,
        nameAr: l.level.nameAr,
        descriptionEn: l.level.descriptionEn,
        descriptionAr: l.level.descriptionAr,
        completionPercentage: l.completionPercentage,
      }));

    return NextResponse.json({
      currentLevel: {
        id: currentLevel.level.id,
        number: currentLevel.level.levelNumber,
        nameEn: currentLevel.level.nameEn,
        nameAr: currentLevel.level.nameAr,
        descriptionEn: currentLevel.level.descriptionEn,
        descriptionAr: currentLevel.level.descriptionAr,
      },
      unlockedLevels,
      overallProgress:
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      branchProgress,
      totalLessons,
      completedLessons,
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            titleEn: nextLesson.titleEn,
            titleAr: nextLesson.titleAr,
            branchSlug: nextLesson.branch.slug,
            branchNameEn: nextLesson.branch.nameEn,
            branchNameAr: nextLesson.branch.nameAr,
          }
        : null,
      recentActivity: recentActivity.map((activity) => ({
        lessonTitle: activity.lesson.titleEn,
        lessonTitleAr: activity.lesson.titleAr,
        branchName: activity.lesson.branch.nameEn,
        branchNameAr: activity.lesson.branch.nameAr,
        score: activity.score,
        completedAt: activity.updatedAt,
      })),
    });
  } catch (error) {
    logger.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
