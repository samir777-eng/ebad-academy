import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
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
    const body = await req.json();
    const { role } = body;

    // Validate role
    if (role !== "admin" && role !== "student") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent changing your own role
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Get current user info before update
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // Invalidate role cache for this user
    const { roleCache } = await import("@/lib/role-cache");
    roleCache.invalidate(currentUser.email);

    // Create audit log
    const { auditFromRequest, AuditAction, EntityType } = await import(
      "@/lib/audit"
    );
    await auditFromRequest(
      req,
      session.user.id!,
      AuditAction.USER_ROLE_CHANGED,
      EntityType.USER,
      id,
      {
        previousRole: currentUser.role,
        newRole: role,
        targetUser: {
          email: currentUser.email,
          name: currentUser.name,
        },
      }
    );

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    logger.error("Error updating user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
