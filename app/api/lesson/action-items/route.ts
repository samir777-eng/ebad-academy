import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get action item completions for a lesson
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
        { error: "lessonId is required" },
        { status: 400 }
      );
    }

    const completions = await prisma.actionItemCompletion.findMany({
      where: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
      },
    });

    return NextResponse.json({ completions });
  } catch (error: any) {
    console.error("Error fetching action item completions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch completions" },
      { status: 500 }
    );
  }
}

// Toggle action item completion
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, itemIndex, completed } = body;

    if (lessonId === undefined || itemIndex === undefined) {
      return NextResponse.json(
        { error: "lessonId and itemIndex are required" },
        { status: 400 }
      );
    }

    // Check if completion exists
    const existing = await prisma.actionItemCompletion.findUnique({
      where: {
        userId_lessonId_itemIndex: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
          itemIndex: parseInt(itemIndex),
        },
      },
    });

    let result;

    if (existing) {
      // Update existing
      result = await prisma.actionItemCompletion.update({
        where: {
          userId_lessonId_itemIndex: {
            userId: session.user.id,
            lessonId: parseInt(lessonId),
            itemIndex: parseInt(itemIndex),
          },
        },
        data: {
          completed: completed ?? !existing.completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new
      result = await prisma.actionItemCompletion.create({
        data: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
          itemIndex: parseInt(itemIndex),
          completed: completed ?? true,
          completedAt: completed ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ success: true, completion: result });
  } catch (error: any) {
    console.error("Error toggling action item completion:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle completion" },
      { status: 500 }
    );
  }
}

