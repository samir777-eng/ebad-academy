import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Only select the ID we need
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // OPTIMIZATION: Fetch all data in parallel using Promise.all
    const [levels, userLevelStatus, lessonStats] = await Promise.all([
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

      // Query 2: Get user's level status
      prisma.userLevelStatus.findMany({
        where: { userId: user.id },
        select: {
          levelId: true,
          isUnlocked: true,
        },
      }),

      // Query 3: Get lesson counts and completion stats per level using aggregation
      // This replaces the N+1 query pattern with a single efficient query
      prisma.lesson.groupBy({
        by: ["levelId"],
        _count: {
          id: true,
        },
      }),
    ]);

    // Query 4: Get completed lessons count per level
    const completedLessonsPerLevel = await prisma.userProgress.groupBy({
      by: ["lessonId"],
      where: {
        userId: user.id,
        completed: true,
        score: { gte: 60 },
      },
      _count: {
        lessonId: true,
      },
    });

    // Query 5: Get lesson to level mapping for completed lessons
    const completedLessonIds = completedLessonsPerLevel.map(
      (cp) => cp.lessonId
    );
    const lessonLevelMap =
      completedLessonIds.length > 0
        ? await prisma.lesson.findMany({
            where: { id: { in: completedLessonIds } },
            select: { id: true, levelId: true },
          })
        : [];

    // Build a map of levelId -> completed lesson count
    const completedCountByLevel = new Map<number, number>();
    lessonLevelMap.forEach((lesson) => {
      const count = completedCountByLevel.get(lesson.levelId) || 0;
      completedCountByLevel.set(lesson.levelId, count + 1);
    });

    // Build a map of levelId -> total lesson count
    const totalCountByLevel = new Map(
      lessonStats.map((stat) => [stat.levelId, stat._count.id])
    );

    // Calculate progress for each level (in-memory, no DB queries)
    const levelsWithProgress = levels.map((level) => {
      const levelStatus = userLevelStatus.find((s) => s.levelId === level.id);
      const totalLessons = totalCountByLevel.get(level.id) || 0;
      const completedLessons = completedCountByLevel.get(level.id) || 0;

      const completionPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        id: level.id,
        levelNumber: level.levelNumber,
        nameAr: level.nameAr,
        nameEn: level.nameEn,
        descriptionAr: level.descriptionAr,
        descriptionEn: level.descriptionEn,
        isUnlocked: levelStatus?.isUnlocked ?? level.levelNumber === 1, // Level 1 is always unlocked
        completionPercentage,
        totalLessons,
        completedLessons,
      };
    });

    return NextResponse.json(levelsWithProgress);
  } catch (error) {
    logger.error("Error fetching levels:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}
