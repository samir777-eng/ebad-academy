import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Test endpoint to verify test data exists in database
 * Only available in test environment
 */
export async function GET() {
  // Only allow in test/development environment
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.NODE_ENV !== "development"
  ) {
    return NextResponse.json(
      {
        error: "Not available",
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50),
      },
      { status: 404 }
    );
  }

  try {
    const testLessons = await prisma.lesson.findMany({
      where: { titleEn: { contains: "TEST_" } },
      include: { questions: true, level: true },
    });

    // Get test users
    const testUsers = await prisma.user.findMany({
      where: { idNumber: { contains: "TEST_" } },
      select: { id: true, email: true, idNumber: true },
    });

    // Get user level statuses for test users
    const userLevelStatuses = await prisma.userLevelStatus.findMany({
      where: { user: { idNumber: { contains: "TEST_" } } },
      include: { user: { select: { email: true } }, level: true },
    });

    return NextResponse.json({
      success: true,
      lessonsCount: testLessons.length,
      lessons: testLessons.map((l) => ({
        id: l.id,
        title: l.titleEn,
        questionsCount: l.questions.length,
        levelId: l.levelId,
        levelNumber: l.level.levelNumber,
      })),
      usersCount: testUsers.length,
      users: testUsers,
      userLevelStatusesCount: userLevelStatuses.length,
      userLevelStatuses: userLevelStatuses.map((uls) => ({
        userId: uls.userId,
        userEmail: uls.user.email,
        levelId: uls.levelId,
        levelNumber: uls.level.levelNumber,
        isUnlocked: uls.isUnlocked,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query database", details: String(error) },
      { status: 500 }
    );
  }
}
