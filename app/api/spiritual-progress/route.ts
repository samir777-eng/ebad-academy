import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { NextRequest, NextResponse } from "next/server";

// Get spiritual progress for a date range
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { userId: session.user.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const progress = await prisma.spiritualProgress.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ progress });
  } catch (error: any) {
    logger.error("Error fetching spiritual progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// Save or update spiritual progress for today
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      date,
      fajr,
      dhuhr,
      asr,
      maghrib,
      isha,
      quranPages,
      quranMinutes,
      fasting,
      charity,
      charityAmount,
      dhikr,
      dhikrCount,
      dua,
      goodDeeds,
      notes,
    } = body;

    const progressDate = date ? new Date(date) : new Date();
    progressDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Sanitize user-generated content
    const sanitizedNotes = notes ? sanitizeText(notes) : undefined;
    const sanitizedGoodDeeds = goodDeeds
      ? goodDeeds.map((deed: string) => sanitizeText(deed))
      : undefined;

    // Upsert progress (create or update)
    const progress = await prisma.spiritualProgress.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: progressDate,
        },
      },
      update: {
        fajr: fajr ?? undefined,
        dhuhr: dhuhr ?? undefined,
        asr: asr ?? undefined,
        maghrib: maghrib ?? undefined,
        isha: isha ?? undefined,
        quranPages: quranPages ?? undefined,
        quranMinutes: quranMinutes ?? undefined,
        fasting: fasting ?? undefined,
        charity: charity ?? undefined,
        charityAmount: charityAmount ?? undefined,
        dhikr: dhikr ?? undefined,
        dhikrCount: dhikrCount ?? undefined,
        dua: dua ?? undefined,
        goodDeeds: sanitizedGoodDeeds
          ? JSON.stringify(sanitizedGoodDeeds)
          : undefined,
        notes: sanitizedNotes,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        date: progressDate,
        fajr: fajr || false,
        dhuhr: dhuhr || false,
        asr: asr || false,
        maghrib: maghrib || false,
        isha: isha || false,
        quranPages: quranPages || 0,
        quranMinutes: quranMinutes || 0,
        fasting: fasting || false,
        charity: charity || false,
        charityAmount: charityAmount || 0,
        dhikr: dhikr || false,
        dhikrCount: dhikrCount || 0,
        dua: dua || false,
        goodDeeds: sanitizedGoodDeeds
          ? JSON.stringify(sanitizedGoodDeeds)
          : null,
        notes: sanitizedNotes || null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    logger.error("Error saving spiritual progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save progress" },
      { status: 500 }
    );
  }
}
