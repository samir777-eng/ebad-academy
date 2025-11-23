import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse and validate input BEFORE authentication check
    // This prevents malicious payloads from even reaching the auth layer
    const body = await request.json();
    const { lessonId, answers, score } = body;

    // Validate required fields
    if (!lessonId || !answers || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate lessonId format - must be a valid number or UUID
    // Reject SQL injection attempts
    if (
      typeof lessonId !== "string" ||
      lessonId.includes("'") ||
      lessonId.includes('"') ||
      lessonId.includes(";") ||
      lessonId.includes("--") ||
      lessonId.toLowerCase().includes("drop") ||
      lessonId.toLowerCase().includes("union") ||
      lessonId.toLowerCase().includes("select")
    ) {
      return NextResponse.json(
        { error: "Invalid lesson ID format" },
        { status: 400 }
      );
    }

    // Validate userId if provided - reject SQL injection attempts
    if (
      body.userId &&
      (typeof body.userId !== "string" ||
        body.userId.includes("'") ||
        body.userId.includes('"') ||
        body.userId.toLowerCase().includes("or") ||
        body.userId.includes("="))
    ) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // NOW check authentication after input validation
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert lessonId to number
    const lessonIdNum = parseInt(lessonId);
    if (isNaN(lessonIdNum)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    // Get the lesson to verify it exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonIdNum },
      include: { questions: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Calculate correct answers
    const totalQuestions = lesson.questions.length;
    const correctAnswers = lesson.questions.filter((q, index) => {
      return answers[index] === q.correctAnswer;
    }).length;
    const passed = score >= 60;

    // Create quiz attempt with answers
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        lessonId: lesson.id,
        score,
        totalQuestions,
        correctAnswers,
        passed,
        answers: {
          create: lesson.questions.map((question, index) => ({
            questionId: question.id,
            answer: answers[index] || "",
            isCorrect: answers[index] === question.correctAnswer,
          })),
        },
      },
    });

    // Update or create user progress
    await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.id,
        },
      },
      update: {
        completed: passed,
        score: score,
        attempts: {
          increment: 1,
        },
        lastAttempt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: lesson.id,
        completed: passed,
        score: score,
        attempts: 1,
        lastAttempt: new Date(),
      },
    });

    // Check if this completion unlocks the next level
    const { checkAndUnlockNextLevel } = await import("@/lib/level-unlock");
    const unlockResult = await checkAndUnlockNextLevel(
      session.user.id,
      lesson.levelId
    );

    // Check and award badges
    const { checkAndAwardBadges, getNewlyAwardedBadges } = await import(
      "@/lib/badge-checker"
    );
    const newBadgeIds = await checkAndAwardBadges(session.user.id);
    const newBadges = await getNewlyAwardedBadges(newBadgeIds);

    return NextResponse.json({
      success: true,
      score,
      passed,
      attemptId: quizAttempt.id,
      levelUnlocked: unlockResult.levelUnlocked,
      nextLevelId: unlockResult.nextLevelId,
      completionPercentage: unlockResult.completionPercentage,
      newBadges: newBadges,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
