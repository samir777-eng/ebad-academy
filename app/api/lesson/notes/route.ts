import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    console.error("Error fetching notes:", error);
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

    // Upsert notes (create or update)
    const notes = await prisma.lessonNote.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      },
      update: {
        content: content || "",
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
        content: content || "",
      },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error("Error saving notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save notes" },
      { status: 500 }
    );
  }
}

