import { createWelcomeEmail, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * Sanitize input to prevent XSS and SQL injection
 */
function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  // Remove any HTML tags and script content (more aggressive)
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers like onclick=
    .replace(/&lt;script/gi, "") // Remove encoded script tags
    .replace(/&gt;/gi, ""); // Remove encoded closing tags

  // Remove SQL injection patterns
  sanitized = sanitized.replace(
    /('|"|;|--|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union)/gi,
    ""
  );

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhoneNumber(phone: string): boolean {
  // Allow international format with + and digits
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { email, name, password, phoneNumber, languagePref } = body;

    if (!email || !name || !password || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    email = sanitizeInput(email).toLowerCase();
    name = sanitizeInput(name);
    phoneNumber = sanitizeInput(phoneNumber);
    languagePref = sanitizeInput(languagePref || "ar");

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID number (format: EA + timestamp + random)
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const idNumber = `EA${timestamp}${random}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        idNumber,
        phoneNumber,
        password: hashedPassword,
        languagePref: languagePref || "ar",
      },
    });

    // Create UserLevelStatus for Level 1 (unlocked by default)
    const level1 = await prisma.level.findUnique({
      where: { levelNumber: 1 },
    });

    if (level1) {
      await prisma.userLevelStatus.create({
        data: {
          userId: user.id,
          levelId: level1.id,
          isUnlocked: true,
          unlockedAt: new Date(),
        },
      });
    }

    // Send welcome email (async, don't wait)
    void sendEmail(
      user.email,
      createWelcomeEmail({
        name: user.name,
        email: user.email,
      })
    ).catch((err) => console.error("Failed to send welcome email:", err));

    return NextResponse.json(
      {
        user: {
          id: user.id,
          idNumber: user.idNumber,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
