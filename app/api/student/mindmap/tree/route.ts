import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache student mind map data for 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute for read operations (more lenient)
    const { checkRateLimit, createRateLimitResponse } = await import(
      "@/lib/rate-limit"
    );
    const rateLimit = await checkRateLimit(request, {
      maxRequests: 100,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonIdStr = searchParams.get("lessonId");

    if (!lessonIdStr) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Validate lessonId is a valid positive integer
    const lessonId = parseInt(lessonIdStr, 10);
    if (isNaN(lessonId) || lessonId < 1 || !Number.isFinite(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lesson ID format" },
        { status: 400 }
      );
    }

    // Fetch only published mind map nodes for students
    const nodes = await prisma.mindMapNode.findMany({
      where: {
        lessonId: lessonId,
        isPublished: true, // Only show published nodes to students
      },
      orderBy: [{ level: "asc" }, { order: "asc" }],
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        descriptionAr: true,
        descriptionEn: true,
        type: true,
        level: true,
        color: true,
        shape: true,
        parentId: true,
        isPublished: true,
        positionX: true,
        positionY: true,
        // Historical Context
        dateHijri: true,
        dateGregorian: true,
        location: true,
        participants: true,
        // Decision Analysis
        decision: true,
        alternatives: true,
        outcomes: true,
        // Learning & Application
        moralLessons: true,
        modernApps: true,
        securityImpact: true,
        // Documentation
        sources: true,
      },
    });

    return NextResponse.json({ nodes });
  } catch (error) {
    logger.error("Error fetching mind map tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch mind map tree" },
      { status: 500 }
    );
  }
}
