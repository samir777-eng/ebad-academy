import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to test quiz page logic
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not logged in", session },
        { status: 401 }
      );
    }

    const { lessonId } = await params;
    const lessonIdNum = parseInt(lessonId);

    if (isNaN(lessonIdNum)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    // Fetch lesson with questions
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonIdNum },
      include: {
        branch: true,
        level: true,
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if user has access to this lesson (level must be unlocked)
    const userLevelStatus = await prisma.userLevelStatus.findUnique({
      where: {
        userId_levelId: {
          userId: session.user.id,
          levelId: lesson.levelId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.titleEn,
        levelId: lesson.levelId,
        questionsCount: lesson.questions.length,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      userLevelStatus: userLevelStatus
        ? {
            isUnlocked: userLevelStatus.isUnlocked,
            levelId: userLevelStatus.levelId,
          }
        : null,
      checks: {
        lessonExists: !!lesson,
        hasQuestions: lesson.questions.length > 0,
        userHasAccess: !!userLevelStatus?.isUnlocked,
        allChecksPassed:
          !!lesson &&
          lesson.questions.length > 0 &&
          !!userLevelStatus?.isUnlocked,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to debug quiz",
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
