import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

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

    // Validate required fields
    if (!nameEn || !nameAr || !descriptionEn || !descriptionAr || !icon || !criteriaType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create badge
    const badge = await prisma.badge.create({
      data: {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        icon,
        criteriaType,
        criteriaValue: criteriaType === "manual" ? 0 : parseInt(criteriaValue),
      },
    });

    return NextResponse.json({ success: true, badge }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating badge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create badge" },
      { status: 500 }
    );
  }
}

