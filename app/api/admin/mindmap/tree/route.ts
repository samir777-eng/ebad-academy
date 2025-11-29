import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Cache admin mind map tree for 1 minute (shorter cache for admins who edit frequently)
export const revalidate = 60;

interface TreeNode {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  type: string;
  color: string;
  icon?: string | null;
  shape: string;
  level: number;
  positionX?: number | null;
  positionY?: number | null;
  children: TreeNode[];
  attachments?: any[];
  [key: string]: any;
}

function buildTree(nodes: any[], parentId: string | null = null): TreeNode[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
}

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
      return NextResponse.json({ error: "lessonId required" }, { status: 400 });
    }

    const lessonId = parseInt(lessonIdStr, 10);
    if (isNaN(lessonId) || lessonId < 1 || !Number.isFinite(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lessonId format" },
        { status: 400 }
      );
    }

    const isAdmin = session.user.role === "admin";

    const nodes = await prisma.mindMapNode.findMany({
      where: {
        lessonId,
        ...(isAdmin ? {} : { isPublished: true }),
      },
      include: {
        relationships: {
          include: {
            toNode: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ level: "asc" }, { order: "asc" }],
    });

    const tree = buildTree(nodes);
    const relationships = nodes.flatMap((n) => n.relationships);

    return NextResponse.json({
      nodes,
      tree,
      relationships,
      meta: {
        totalNodes: nodes.length,
        maxDepth: Math.max(...nodes.map((n) => n.level), 0),
        rootNodes: tree.length,
      },
    });
  } catch (error) {
    logger.error("Error building mind map tree:", error);
    return NextResponse.json(
      { error: "Failed to build tree" },
      { status: 500 }
    );
  }
}
