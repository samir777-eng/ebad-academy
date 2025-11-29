import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute for bulk operations (very strict)
    const { checkRateLimit, createRateLimitResponse } = await import(
      "@/lib/rate-limit"
    );
    const rateLimit = await checkRateLimit(request, {
      maxRequests: 10,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    // CSRF Protection: Verify request origin
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Only allow requests from same origin
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return NextResponse.json(
          { error: "Invalid request origin" },
          { status: 403 }
        );
      }
    }

    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { operation, nodeIds } = body;

    if (!operation || !nodeIds || !Array.isArray(nodeIds)) {
      return NextResponse.json(
        { error: "Operation and nodeIds array are required" },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "publish":
        result = await prisma.mindMapNode.updateMany({
          where: { id: { in: nodeIds } },
          data: { isPublished: true },
        });
        break;

      case "unpublish":
        result = await prisma.mindMapNode.updateMany({
          where: { id: { in: nodeIds } },
          data: { isPublished: false },
        });
        break;

      case "delete":
        // Delete nodes and their children recursively
        // First, get all nodes to delete (including descendants)
        const nodesToDelete = await getAllDescendants(nodeIds);

        result = await prisma.mindMapNode.deleteMany({
          where: { id: { in: nodesToDelete } },
        });
        break;

      case "export":
        // Get all nodes with their data
        const nodes = await prisma.mindMapNode.findMany({
          where: { id: { in: nodeIds } },
          include: {
            children: true,
          },
        });

        return NextResponse.json({
          success: true,
          data: nodes,
          count: nodes.length,
        });

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      affected: result?.count || 0,
    });
  } catch (error: any) {
    logger.error("Bulk operation failed:", error);
    return NextResponse.json(
      {
        error: "Bulk operation failed",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to get all descendants of given nodes
// with depth limit and cycle detection
async function getAllDescendants(nodeIds: string[]): Promise<string[]> {
  const allIds = new Set<string>(nodeIds);
  const MAX_DEPTH = 100; // Prevent stack overflow

  const getChildren = async (parentIds: string[], depth: number = 0) => {
    // Depth limit check
    if (depth > MAX_DEPTH) {
      throw new Error(
        `Maximum tree depth exceeded (${MAX_DEPTH}). Possible circular reference detected.`
      );
    }

    // Cycle detection - check if any parent ID is already in allIds
    const newParentIds = parentIds.filter((id) => !allIds.has(id));
    if (newParentIds.length === 0) {
      return; // All parents already processed, avoid infinite loop
    }

    const children = await prisma.mindMapNode.findMany({
      where: { parentId: { in: newParentIds } },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);

    // Add children to set
    childIds.forEach((id) => allIds.add(id));

    if (childIds.length > 0) {
      await getChildren(childIds, depth + 1);
    }
  };

  await getChildren(nodeIds);
  return Array.from(allIds);
}
