import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { levelNumber } = body;

    if (!levelNumber) {
      return NextResponse.json(
        { error: "Level number is required" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get level details
    const level = await prisma.level.findFirst({
      where: { levelNumber: parseInt(levelNumber) },
    });

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    // Check if user has completed the level
    const userLevelStatus = await prisma.userLevelStatus.findUnique({
      where: {
        userId_levelId: {
          userId: session.user.id,
          levelId: level.id,
        },
      },
    });

    // Check if next level is unlocked (meaning this level is completed)
    const nextLevel = await prisma.level.findFirst({
      where: { levelNumber: levelNumber + 1 },
    });

    let isCompleted = false;
    if (nextLevel) {
      const nextLevelStatus = await prisma.userLevelStatus.findUnique({
        where: {
          userId_levelId: {
            userId: session.user.id,
            levelId: nextLevel.id,
          },
        },
      });
      isCompleted = nextLevelStatus?.isUnlocked || false;
    } else if (levelNumber === 4) {
      // Last level - check if it's unlocked
      isCompleted = userLevelStatus?.isUnlocked || false;
    }

    if (!isCompleted) {
      return NextResponse.json(
        { error: "Level not completed yet" },
        { status: 403 }
      );
    }

    // Get completion statistics
    const lessons = await prisma.lesson.findMany({
      where: { levelId: level.id },
      include: {
        questions: true,
      },
    });

    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: lessons.map((l) => l.id) },
        completed: true,
      },
    });

    const totalLessons = lessons.length;
    const completedLessons = userProgress.length;
    const averageScore =
      userProgress.reduce((sum, p) => sum + (p.score || 0), 0) /
      userProgress.length;

    // Generate certificate data
    const certificateData = {
      studentName: user.name,
      studentId: user.idNumber,
      levelNumber: levelNumber,
      levelName: level.nameEn,
      levelNameAr: level.nameAr,
      completionDate: userLevelStatus?.unlockedAt || new Date(),
      totalLessons,
      completedLessons,
      averageScore: Math.round(averageScore),
      certificateId: `EBAD-L${levelNumber}-${user.idNumber}-${Date.now()}`,
    };

    return NextResponse.json({
      success: true,
      certificate: certificateData,
    });
  } catch (error: any) {
    logger.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}

