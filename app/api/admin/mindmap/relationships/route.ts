import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createRelationshipSchema = z.object({
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.enum([
    "RELATED",
    "PREREQUISITE",
    "LEADS_TO",
    "EXAMPLE_OF",
    "CONTRADICTS",
    "ELABORATES",
    "PART_OF",
  ]),
  labelAr: z.string().optional(),
  labelEn: z.string().optional(),
  lineStyle: z.string().default("solid"),
  lineWidth: z.number().min(1).max(10).default(2),
  color: z.string().default("#94a3b8"),
});

// POST create relationship
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
    const validatedData = createRelationshipSchema.parse(body);

    // Verify both nodes exist and belong to same lesson
    const [fromNode, toNode] = await Promise.all([
      prisma.mindMapNode.findUnique({
        where: { id: validatedData.fromNodeId },
        select: { id: true, lessonId: true },
      }),
      prisma.mindMapNode.findUnique({
        where: { id: validatedData.toNodeId },
        select: { id: true, lessonId: true },
      }),
    ]);

    if (!fromNode || !toNode) {
      return NextResponse.json(
        { error: "One or both nodes not found" },
        { status: 404 }
      );
    }

    if (fromNode.lessonId !== toNode.lessonId) {
      return NextResponse.json(
        { error: "Nodes must belong to same lesson" },
        { status: 400 }
      );
    }

    // Prevent self-reference
    if (validatedData.fromNodeId === validatedData.toNodeId) {
      return NextResponse.json(
        { error: "Node cannot relate to itself" },
        { status: 400 }
      );
    }

    const relationship = await prisma.mindMapRelationship.create({
      data: validatedData,
      include: {
        fromNode: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
        toNode: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
      },
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint error (duplicate relationship)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This relationship already exists between these nodes" },
        { status: 409 }
      );
    }

    logger.error("Error creating relationship:", error);
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    );
  }
}

// DELETE relationship
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Relationship id required" },
        { status: 400 }
      );
    }

    await prisma.mindMapRelationship.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Relationship deleted",
    });
  } catch (error) {
    logger.error("Error deleting relationship:", error);
    return NextResponse.json(
      { error: "Failed to delete relationship" },
      { status: 500 }
    );
  }
}
