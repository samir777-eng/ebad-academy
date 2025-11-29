import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAttachmentSchema = z.object({
  nodeId: z.string().min(1),
  type: z.enum(["AYAH", "HADITH", "NOTE", "LINK", "IMAGE"]),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  contentAr: z.string().optional(),
  contentEn: z.string().optional(),
  url: z.string().url().optional(),
  order: z.number().default(0),
});

// POST create attachment
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
    const validatedData = createAttachmentSchema.parse(body);

    const attachment = await prisma.mindMapAttachment.create({
      data: validatedData,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("Error creating attachment:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}

// DELETE attachment
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
        { error: "Attachment id required" },
        { status: 400 }
      );
    }

    await prisma.mindMapAttachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Attachment deleted" });
  } catch (error) {
    logger.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
