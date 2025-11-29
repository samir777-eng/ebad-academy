import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all bookmarks for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (lessonId) {
      // Check if specific lesson is bookmarked
      const bookmark = await prisma.lessonBookmark.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: parseInt(lessonId),
          },
        },
      });

      return NextResponse.json({ isBookmarked: !!bookmark });
    } else {
      // Get all bookmarks with lesson details
      const bookmarks = await prisma.lessonBookmark.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          lesson: {
            include: {
              branch: true,
              level: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ bookmarks });
    }
  } catch (error: any) {
    logger.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// Toggle bookmark (add or remove)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Check if bookmark exists
    const existingBookmark = await prisma.lessonBookmark.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.lessonBookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      return NextResponse.json({ success: true, isBookmarked: false });
    } else {
      // Add bookmark
      await prisma.lessonBookmark.create({
        data: {
          userId: session.user.id,
          lessonId: parseInt(lessonId),
        },
      });

      return NextResponse.json({ success: true, isBookmarked: true });
    }
  } catch (error: any) {
    logger.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

