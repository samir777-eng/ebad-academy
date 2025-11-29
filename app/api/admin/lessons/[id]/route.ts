import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { MAX_BODY_SIZE, validateRequestSize } from "@/lib/request-validation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate request size (prevent DoS attacks with large payloads)
    const sizeError = await validateRequestSize(
      req,
      MAX_BODY_SIZE.LARGE_CONTENT
    );
    if (sizeError) {
      return sizeError;
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

    const { id } = await params;
    const lessonId = parseInt(id);

    const body = await req.json();
    const {
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      videoUrlsEn,
      videoUrlsAr,
      pdfUrl,
      duration,
      order,
      levelId,
      branchId,
      questions,
    } = body;

    // Update the lesson
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        videoUrlsEn,
        videoUrlsAr,
        pdfUrlEn: pdfUrl || null,
        duration: parseInt(duration),
        order: parseInt(order),
        levelId: parseInt(levelId),
        branchId: parseInt(branchId),
      },
    });

    // Delete existing questions
    await prisma.question.deleteMany({
      where: { lessonId },
    });

    // Create new questions if provided
    if (questions && questions.length > 0) {
      await Promise.all(
        questions.map((q: any, index: number) =>
          prisma.question.create({
            data: {
              lessonId: lesson.id,
              questionTextEn: q.questionTextEn,
              questionTextAr: q.questionTextAr,
              type: q.type,
              optionsEn: q.optionsEn,
              optionsAr: q.optionsAr,
              correctAnswer: q.correctAnswer,
              explanationEn: q.explanationEn || "",
              explanationAr: q.explanationAr || "",
              order: index + 1,
            },
          })
        )
      );
    }

    return NextResponse.json({ success: true, lesson });
  } catch (error: any) {
    logger.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

    const { id } = await params;
    const lessonId = parseInt(id);

    // Get lesson info before deletion for audit log
    const lessonToDelete = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { titleEn: true, titleAr: true, levelId: true, branchId: true },
    });

    if (!lessonToDelete) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Delete questions first (cascade)
    await prisma.question.deleteMany({
      where: { lessonId },
    });

    // Delete user progress
    await prisma.userProgress.deleteMany({
      where: { lessonId },
    });

    // Delete quiz attempts
    await prisma.quizAttempt.deleteMany({
      where: { lessonId },
    });

    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Create audit log
    const { auditFromRequest, AuditAction, EntityType } = await import(
      "@/lib/audit"
    );
    await auditFromRequest(
      req,
      session.user.id!,
      AuditAction.LESSON_DELETED,
      EntityType.LESSON,
      lessonId.toString(),
      {
        deletedLesson: {
          titleEn: lessonToDelete.titleEn,
          titleAr: lessonToDelete.titleAr,
          levelId: lessonToDelete.levelId,
          branchId: lessonToDelete.branchId,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
