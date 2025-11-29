import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import DOMPurify from "isomorphic-dompurify";
import { NextRequest, NextResponse } from "next/server";

// GET single node with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const node = await prisma.mindMapNode.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
        parent: true,
        relationships: {
          include: {
            toNode: true,
          },
        },
        relatedTo: {
          include: {
            fromNode: true,
          },
        },
        attachments: {
          orderBy: { order: "asc" },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            branch: {
              select: {
                nameAr: true,
                nameEn: true,
              },
            },
            level: {
              select: {
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Students can only see published nodes
    if (session.user.role !== "admin" && !node.isPublished) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    logger.error("Error fetching mind map node:", error);
    return NextResponse.json(
      { error: "Failed to fetch node" },
      { status: 500 }
    );
  }
}

// PUT update node
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    // Verify the node exists and get its lesson info
    const existingNode = await prisma.mindMapNode.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Authorization check: Only admins can modify nodes
    // (Already checked at the top of the function)

    const body = await req.json();

    // Sanitize all text inputs to prevent XSS attacks
    const sanitizedBody: any = { ...body };
    if (body.titleAr) sanitizedBody.titleAr = DOMPurify.sanitize(body.titleAr);
    if (body.titleEn) sanitizedBody.titleEn = DOMPurify.sanitize(body.titleEn);
    if (body.descriptionAr)
      sanitizedBody.descriptionAr = DOMPurify.sanitize(body.descriptionAr);
    if (body.descriptionEn)
      sanitizedBody.descriptionEn = DOMPurify.sanitize(body.descriptionEn);
    if (body.location)
      sanitizedBody.location = DOMPurify.sanitize(body.location);
    if (body.decision)
      sanitizedBody.decision = DOMPurify.sanitize(body.decision);
    if (body.securityImpact)
      sanitizedBody.securityImpact = DOMPurify.sanitize(body.securityImpact);
    if (body.dateHijri)
      sanitizedBody.dateHijri = DOMPurify.sanitize(body.dateHijri);
    if (body.dateGregorian)
      sanitizedBody.dateGregorian = DOMPurify.sanitize(body.dateGregorian);

    // Recalculate level if parent changed
    if (sanitizedBody.parentId !== undefined) {
      if (sanitizedBody.parentId) {
        const parent = await prisma.mindMapNode.findUnique({
          where: { id: sanitizedBody.parentId },
        });
        if (parent) {
          sanitizedBody.level = (parent.level ?? 0) + 1;
        }
      } else {
        sanitizedBody.level = 0;
      }
    }

    const node = await prisma.mindMapNode.update({
      where: { id },
      data: sanitizedBody,
      include: {
        children: true,
        relationships: true,
        attachments: true,
      },
    });

    return NextResponse.json(node);
  } catch (error) {
    logger.error("Error updating mind map node:", error);
    return NextResponse.json(
      { error: "Failed to update node" },
      { status: 500 }
    );
  }
}

// DELETE node
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    // Check if node has children
    const node = await prisma.mindMapNode.findUnique({
      where: { id },
      include: {
        children: true,
        lesson: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Authorization check: Only admins can delete nodes
    // (Already checked at the top of the function)

    if (node.children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete node with children. Delete children first." },
        { status: 400 }
      );
    }

    await prisma.mindMapNode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Node deleted" });
  } catch (error) {
    logger.error("Error deleting mind map node:", error);
    return NextResponse.json(
      { error: "Failed to delete node" },
      { status: 500 }
    );
  }
}
