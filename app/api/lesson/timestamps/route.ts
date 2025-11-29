import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get timestamps for a lesson
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

    const timestamps = await prisma.videoTimestamp.findMany({
      where: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
      },
      orderBy: [{ videoIndex: "asc" }, { timestamp: "asc" }],
    });

    return NextResponse.json({ timestamps });
  } catch (error: any) {
    logger.error("Error fetching timestamps:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch timestamps" },
      { status: 500 }
    );
  }
}

// Create a new timestamp
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, videoIndex, timestamp, label } = body;

    if (!lessonId || videoIndex === undefined || timestamp === undefined || !label) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTimestamp = await prisma.videoTimestamp.create({
      data: {
        userId: session.user.id,
        lessonId: parseInt(lessonId),
        videoIndex: parseInt(videoIndex),
        timestamp: parseInt(timestamp),
        label,
      },
    });

    return NextResponse.json({ success: true, timestamp: newTimestamp });
  } catch (error: any) {
    logger.error("Error creating timestamp:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create timestamp" },
      { status: 500 }
    );
  }
}

// Delete a timestamp
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timestampId = searchParams.get("id");

    if (!timestampId) {
      return NextResponse.json(
        { error: "Timestamp ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const timestamp = await prisma.videoTimestamp.findUnique({
      where: { id: parseInt(timestampId) },
    });

    if (!timestamp || timestamp.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Timestamp not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.videoTimestamp.delete({
      where: { id: parseInt(timestampId) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting timestamp:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete timestamp" },
      { status: 500 }
    );
  }
}

