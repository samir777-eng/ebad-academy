import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, markedAsRead } = await req.json();

    if (!lessonId || typeof markedAsRead !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Upsert user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      },
      update: {
        markedAsRead,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
        markedAsRead,
      },
    });

    return NextResponse.json({
      success: true,
      markedAsRead: userProgress.markedAsRead,
    });
  } catch (error) {
    console.error("Error marking lesson as read:", error);
    return NextResponse.json(
      { error: "Failed to update lesson status" },
      { status: 500 }
    );
  }
}

