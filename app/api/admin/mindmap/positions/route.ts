import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute for write operations
    const { checkRateLimit, createRateLimitResponse } = await import(
      "@/lib/rate-limit"
    );
    const rateLimit = await checkRateLimit(req, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 }
      );
    }

    // Validate updates
    for (const update of updates) {
      if (
        !update.id ||
        typeof update.positionX !== "number" ||
        typeof update.positionY !== "number"
      ) {
        return NextResponse.json(
          { error: "Each update must have id, positionX, and positionY" },
          { status: 400 }
        );
      }
    }

    // Update positions in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.mindMapNode.update({
          where: { id: update.id },
          data: {
            positionX: update.positionX,
            positionY: update.positionY,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      updated: updates.length,
    });
  } catch (error) {
    logger.error("Failed to update positions:", error);
    return NextResponse.json(
      { error: "Failed to update positions" },
      { status: 500 }
    );
  }
}
