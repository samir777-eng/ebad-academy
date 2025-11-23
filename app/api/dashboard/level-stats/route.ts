import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const levelId = searchParams.get("levelId");

    if (!levelId) {
      return NextResponse.json(
        { error: "Level ID is required" },
        { status: 400 }
      );
    }

    // Get the level
    const level = await prisma.level.findUnique({
      where: { id: parseInt(levelId) },
    });

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    // Check if user has access to this level
    const userLevelStatus = await prisma.userLevelStatus.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: parseInt(levelId),
        },
      },
    });

    if (!userLevelStatus?.isUnlocked) {
      return NextResponse.json(
        { error: "Level is locked" },
        { status: 403 }
      );
    }

    // Get all lessons in this level with user progress
    const lessonsInLevel = await prisma.lesson.findMany({
      where: { levelId: parseInt(levelId) },
      include: {
        branch: true,
        userProgress: { where: { userId } },
      },
      orderBy: { order: "asc" },
    });

    // Calculate branch progress
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
      const branchLessons = lessonsInLevel.filter(
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

    // Calculate overall progress for this level
    const totalLessons = lessonsInLevel.length;
    const completedLessons = lessonsInLevel.filter(
      (l) => l.userProgress[0]?.completed
    ).length;

    // Find next lesson
    const nextLesson = lessonsInLevel.find(
      (l) => !l.userProgress[0]?.completed
    );

    return NextResponse.json({
      level: {
        id: level.id,
        number: level.levelNumber,
        nameEn: level.nameEn,
        nameAr: level.nameAr,
        descriptionEn: level.descriptionEn,
        descriptionAr: level.descriptionAr,
      },
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
    });
  } catch (error) {
    console.error("Level stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch level stats" },
      { status: 500 }
    );
  }
}

