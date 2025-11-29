import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import DOMPurify from "isomorphic-dompurify";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createNodeSchema = z.object({
  lessonId: z.number().int().positive("Lesson ID must be a positive integer"),
  parentId: z.string().optional().nullable(),
  titleAr: z
    .string()
    .min(1, "Arabic title is required")
    .max(500, "Arabic title must be less than 500 characters"),
  titleEn: z
    .string()
    .min(1, "English title is required")
    .max(500, "English title must be less than 500 characters"),
  descriptionAr: z.string().max(5000, "Description too long").optional(),
  descriptionEn: z.string().max(5000, "Description too long").optional(),
  type: z.enum([
    "ROOT",
    "CATEGORY",
    "TOPIC",
    "SUBTOPIC",
    "DETAIL",
    "NOTE",
    "EVENT",
    "DECISION",
    "POLICY",
    "BATTLE",
    "TREATY",
    "REVELATION",
    "MIRACLE",
    "LESSON",
  ]),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#4F46E5"),
  icon: z.string().max(100).optional(),
  shape: z.enum(["circle", "rect", "diamond"]).default("circle"),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(false),

  // Historical Context
  dateHijri: z.string().max(200).optional(),
  dateGregorian: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  participants: z.string().max(5000).optional(), // JSON string

  // Decision Analysis
  decision: z.string().max(2000).optional(),
  alternatives: z.string().max(5000).optional(), // JSON string
  outcomes: z.string().max(5000).optional(), // JSON string

  // Learning & Application
  moralLessons: z.string().max(5000).optional(), // JSON string
  modernApps: z.string().max(5000).optional(), // JSON string
  securityImpact: z.string().max(2000).optional(),

  // Documentation
  sources: z.string().max(5000).optional(), // JSON string

  // Flexible metadata
  metadata: z.string().max(10000).optional(), // JSON string
});

// GET all nodes for a lesson
export async function GET(req: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute for read operations
    const { checkRateLimit, createRateLimitResponse } = await import(
      "@/lib/rate-limit"
    );
    const rateLimit = await checkRateLimit(req, {
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

    const { searchParams } = new URL(req.url);
    const lessonIdStr = searchParams.get("lessonId");
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    if (!lessonIdStr) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 });
    }

    const lessonId = parseInt(lessonIdStr, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
    }

    // Pagination parameters
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 1000; // Default 1000 nodes max

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        {
          error:
            "Invalid pagination parameters. Page must be >= 1, limit must be 1-1000",
        },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Check if user is admin or student (students only see published)
    const isAdmin = session.user.role === "admin";

    // Get total count for pagination metadata
    const totalCount = await prisma.mindMapNode.count({
      where: {
        lessonId,
        ...(isAdmin ? {} : { isPublished: true }),
      },
    });

    const nodes = await prisma.mindMapNode.findMany({
      where: {
        lessonId,
        ...(isAdmin ? {} : { isPublished: true }),
      },
      skip,
      take: limit,
      include: {
        children: true,
        parent: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
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

    return NextResponse.json({
      nodes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + nodes.length < totalCount,
      },
    });
  } catch (error) {
    logger.error("Error fetching mind map nodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch nodes" },
      { status: 500 }
    );
  }
}

// POST create new node
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
    const validatedData = createNodeSchema.parse(body);

    // Sanitize all text inputs to prevent XSS attacks
    const sanitizedData = {
      ...validatedData,
      titleAr: DOMPurify.sanitize(validatedData.titleAr),
      titleEn: DOMPurify.sanitize(validatedData.titleEn),
      descriptionAr: validatedData.descriptionAr
        ? DOMPurify.sanitize(validatedData.descriptionAr)
        : undefined,
      descriptionEn: validatedData.descriptionEn
        ? DOMPurify.sanitize(validatedData.descriptionEn)
        : undefined,
      location: validatedData.location
        ? DOMPurify.sanitize(validatedData.location)
        : undefined,
      decision: validatedData.decision
        ? DOMPurify.sanitize(validatedData.decision)
        : undefined,
      securityImpact: validatedData.securityImpact
        ? DOMPurify.sanitize(validatedData.securityImpact)
        : undefined,
      dateHijri: validatedData.dateHijri
        ? DOMPurify.sanitize(validatedData.dateHijri)
        : undefined,
      dateGregorian: validatedData.dateGregorian
        ? DOMPurify.sanitize(validatedData.dateGregorian)
        : undefined,
    };

    // Calculate level based on parent
    let level = 0;
    if (sanitizedData.parentId) {
      const parent = await prisma.mindMapNode.findUnique({
        where: { id: sanitizedData.parentId },
        select: { level: true, lessonId: true },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Parent node not found" },
          { status: 404 }
        );
      }

      // Ensure parent belongs to same lesson
      if (parent.lessonId !== sanitizedData.lessonId) {
        return NextResponse.json(
          { error: "Parent node must belong to same lesson" },
          { status: 400 }
        );
      }

      level = (parent.level ?? 0) + 1;
    }

    const node = await prisma.mindMapNode.create({
      data: {
        ...sanitizedData,
        level,
        createdBy: session.user.id,
      },
      include: {
        children: true,
        relationships: true,
        attachments: true,
      },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("Error creating mind map node:", error);
    return NextResponse.json(
      { error: "Failed to create node" },
      { status: 500 }
    );
  }
}
