import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
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
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lesson" },
      { status: 500 }
    );
  }
}
