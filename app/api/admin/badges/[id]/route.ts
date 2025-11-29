import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { MAX_BODY_SIZE, validateRequestSize } from "@/lib/request-validation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate request size (prevent DoS attacks)
    const sizeError = await validateRequestSize(req, MAX_BODY_SIZE.DEFAULT);
    if (sizeError) {
      return sizeError;
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

    const { id } = await params;
    const badgeId = parseInt(id);
    const body = await req.json();
    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      icon,
      criteriaType,
      criteriaValue,
    } = body;

    // Update badge
    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        iconUrl: icon,
        criteria: JSON.stringify({
          type: criteriaType,
          value: criteriaType === "manual" ? 0 : parseInt(criteriaValue),
        }),
      },
    });

    return NextResponse.json({ success: true, badge });
  } catch (error: any) {
    logger.error("Error updating badge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update badge" },
      { status: 500 }
    );
  }
}

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
    const badgeId = parseInt(id);

    // Get badge info before deletion for audit log
    const badgeToDelete = await prisma.badge.findUnique({
      where: { id: badgeId },
      select: { nameEn: true, nameAr: true },
    });

    if (!badgeToDelete) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    }

    // Delete user badges first
    await prisma.userBadge.deleteMany({
      where: { badgeId },
    });

    // Delete the badge
    await prisma.badge.delete({
      where: { id: badgeId },
    });

    // Create audit log
    const { auditFromRequest, AuditAction, EntityType } = await import(
      "@/lib/audit"
    );
    await auditFromRequest(
      req,
      session.user.id!,
      AuditAction.BADGE_DELETED,
      EntityType.BADGE,
      badgeId.toString(),
      {
        deletedBadge: {
          nameEn: badgeToDelete.nameEn,
          nameAr: badgeToDelete.nameAr,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting badge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete badge" },
      { status: 500 }
    );
  }
}
