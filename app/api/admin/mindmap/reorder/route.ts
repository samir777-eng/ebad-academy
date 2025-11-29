import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute for write operations
    const { checkRateLimit, createRateLimitResponse } = await import(
      "@/lib/rate-limit"
    );
    const rateLimit = await checkRateLimit(request, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit);
    }

    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nodeId, newParentId, newOrder } = body;

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    // Helper function to recursively update descendant levels
    // Optimized to avoid N+1 queries by using updateMany
    const updateDescendantLevels = async (
      tx: any,
      nodeId: string,
      newLevel: number
    ): Promise<void> => {
      const children = await tx.mindMapNode.findMany({
        where: { parentId: nodeId },
        select: { id: true },
      });

      if (children.length === 0) return;

      // Batch update all children at once (avoid N+1)
      await tx.mindMapNode.updateMany({
        where: { id: { in: children.map((c: { id: string }) => c.id) } },
        data: { level: newLevel + 1 },
      });

      // Recursively update grandchildren
      for (const child of children) {
        await updateDescendantLevels(tx, child.id, newLevel + 1);
      }
    };

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get the node to be moved
      const node = await tx.mindMapNode.findUnique({
        where: { id: nodeId },
      });

      if (!node) {
        throw new Error("Node not found");
      }

      // Calculate new level
      let newLevel = 0;
      if (newParentId) {
        const newParent = await tx.mindMapNode.findUnique({
          where: { id: newParentId },
          select: { level: true },
        });

        if (!newParent) {
          throw new Error("Parent node not found");
        }

        newLevel = (newParent.level ?? 0) + 1;
      }

      // Update the node's parent, order, and level in one operation
      const updatedNode = await tx.mindMapNode.update({
        where: { id: nodeId },
        data: {
          parentId: newParentId || null,
          order: newOrder || 0,
          level: newLevel,
        },
      });

      // Update all descendant levels recursively
      await updateDescendantLevels(tx, nodeId, newLevel);

      return updatedNode;
    });

    return NextResponse.json({
      success: true,
      node: result,
    });
  } catch (error) {
    logger.error("Failed to reorder node:", error);
    return NextResponse.json(
      { error: "Failed to reorder node" },
      { status: 500 }
    );
  }
}
