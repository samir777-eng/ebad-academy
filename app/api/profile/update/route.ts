import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { MAX_BODY_SIZE, validateRequestSize } from "@/lib/request-validation";
import DOMPurify from "isomorphic-dompurify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Validate request size
    const sizeError = await validateRequestSize(req, MAX_BODY_SIZE.DEFAULT);
    if (sizeError) {
      return sizeError;
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, languagePref } = body;

    // Sanitize user input to prevent XSS
    const sanitizedName = name ? DOMPurify.sanitize(name) : undefined;

    // Validate language preference
    const validLanguages = ["ar", "en"];
    const sanitizedLanguagePref =
      languagePref && validLanguages.includes(languagePref)
        ? languagePref
        : undefined;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(sanitizedName && { name: sanitizedName }),
        ...(sanitizedLanguagePref && { languagePref: sanitizedLanguagePref }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        languagePref: updatedUser.languagePref,
      },
    });
  } catch (error) {
    logger.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
