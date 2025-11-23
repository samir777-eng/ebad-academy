import { auth } from "@/lib/auth";
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all levels
    const levels = await prisma.level.findMany({
      orderBy: { levelNumber: "asc" },
    });

    // Get user's level status
    const userLevelStatus = await prisma.userLevelStatus.findMany({
      where: { userId: user.id },
    });

    // Get all lessons for progress calculation
    const allLessons = await prisma.lesson.findMany({
      include: {
        userProgress: {
          where: { userId: user.id },
        },
      },
    });

    // Calculate progress for each level
    const levelsWithProgress = levels.map((level) => {
      const levelStatus = userLevelStatus.find((s) => s.levelId === level.id);
      const lessonsInLevel = allLessons.filter((l) => l.levelId === level.id);
      const completedLessons = lessonsInLevel.filter(
        (l) =>
          l.userProgress[0]?.completed && (l.userProgress[0]?.score ?? 0) >= 60
      );

      const completionPercentage =
        lessonsInLevel.length > 0
          ? Math.round((completedLessons.length / lessonsInLevel.length) * 100)
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
        totalLessons: lessonsInLevel.length,
        completedLessons: completedLessons.length,
      };
    });

    return NextResponse.json(levelsWithProgress);
  } catch (error) {
    console.error("Error fetching levels:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}
