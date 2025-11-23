import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

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

    // Update user role
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}

