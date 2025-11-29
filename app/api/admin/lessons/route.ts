import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { MAX_BODY_SIZE, validateRequestSize } from "@/lib/request-validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    // Create the lesson
    const lesson = await prisma.lesson.create({
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

    // Create questions if provided
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

    return NextResponse.json({ success: true, lesson }, { status: 201 });
  } catch (error: any) {
    logger.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lesson" },
      { status: 500 }
    );
  }
}
