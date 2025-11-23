import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
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
    console.error("Error updating badge:", error);
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

    // Delete user badges first
    await prisma.userBadge.deleteMany({
      where: { badgeId },
    });

    // Delete the badge
    await prisma.badge.delete({
      where: { id: badgeId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting badge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete badge" },
      { status: 500 }
    );
  }
}
