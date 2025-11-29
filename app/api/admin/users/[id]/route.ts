import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

    const { id } = await params;

    // Prevent deleting yourself
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user info before deletion for audit log
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // OPTIMIZATION: Use transaction for atomic cascading deletes
    // This ensures all deletes succeed or fail together, and improves performance
    await prisma.$transaction([
      // Delete user progress
      prisma.userProgress.deleteMany({
        where: { userId: id },
      }),

      // Delete quiz attempts
      prisma.quizAttempt.deleteMany({
        where: { userId: id },
      }),

      // Delete level status
      prisma.userLevelStatus.deleteMany({
        where: { userId: id },
      }),

      // Delete user badges
      prisma.userBadge.deleteMany({
        where: { userId: id },
      }),

      // Delete spiritual progress
      prisma.spiritualProgress.deleteMany({
        where: { userId: id },
      }),

      // Delete the user
      prisma.user.delete({
        where: { id },
      }),
    ]);

    // Invalidate role cache for this user
    const { roleCache } = await import("@/lib/role-cache");
    roleCache.invalidate(userToDelete.email);

    // Create audit log
    const { auditFromRequest, AuditAction, EntityType } = await import(
      "@/lib/audit"
    );
    await auditFromRequest(
      req,
      session.user.id!,
      AuditAction.USER_DELETED,
      EntityType.USER,
      id,
      {
        deletedUser: {
          email: userToDelete.email,
          name: userToDelete.name,
          role: userToDelete.role,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
