import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache student relationship data for 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute for read operations
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

    const lessonId = parseInt(lessonIdStr);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    // Fetch relationships for published nodes only
    const relationships = await prisma.mindMapRelationship.findMany({
      where: {
        fromNode: {
          lessonId: lessonId,
          isPublished: true,
        },
        toNode: {
          isPublished: true,
        },
      },
      select: {
        id: true,
        fromNodeId: true,
        toNodeId: true,
        sourceHandle: true,
        targetHandle: true,
        type: true,
        labelAr: true,
        labelEn: true,
        lineStyle: true,
        lineWidth: true,
        color: true,
      },
    });

    return NextResponse.json({ relationships });
  } catch (error) {
    logger.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}
