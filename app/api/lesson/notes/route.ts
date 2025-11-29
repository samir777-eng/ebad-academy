import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import DOMPurify from "isomorphic-dompurify";
import { NextRequest, NextResponse } from "next/server";

// Get notes for a lesson
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    const notes = await prisma.lessonNote.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      },
    });

    return NextResponse.json({ notes: notes?.content || "" });
  } catch (error: any) {
    logger.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Save or update notes for a lesson
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, content } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(content || "");

    // Upsert notes (create or update)
    const notes = await prisma.lessonNote.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      },
      update: {
        content: sanitizedContent,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
        content: sanitizedContent,
      },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    logger.error("Error saving notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save notes" },
      { status: 500 }
    );
  }
}
