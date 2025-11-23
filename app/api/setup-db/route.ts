import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Check if Level 1 exists
    const level1 = await prisma.level.findUnique({
      where: { levelNumber: 1 },
    });

    if (!level1) {
      // Create initial levels
      await prisma.level.createMany({
        data: [
          {
            levelNumber: 1,
            nameAr: "المستوى الأول - الأساسيات",
            nameEn: "Level 1 - Fundamentals",
            descriptionAr: "تعلم أساسيات الإسلام",
            descriptionEn: "Learn the fundamentals of Islam",
            order: 1,
          },
          {
            levelNumber: 2,
            nameAr: "المستوى الثاني - المتوسط",
            nameEn: "Level 2 - Intermediate",
            descriptionAr: "تعمق في فهم الإسلام",
            descriptionEn: "Deepen your understanding of Islam",
            order: 2,
          },
          {
            levelNumber: 3,
            nameAr: "المستوى الثالث - المتقدم",
            nameEn: "Level 3 - Advanced",
            descriptionAr: "دراسة متقدمة للإسلام",
            descriptionEn: "Advanced study of Islam",
            order: 3,
          },
          {
            levelNumber: 4,
            nameAr: "المستوى الرابع - الإتقان",
            nameEn: "Level 4 - Mastery",
            descriptionAr: "إتقان العلوم الإسلامية",
            descriptionEn: "Master Islamic sciences",
            order: 4,
          },
        ],
        skipDuplicates: true,
      });
    }

    // Check if branches exist
    const branches = await prisma.branch.findMany();

    if (branches.length === 0) {
      // Create initial branches
      await prisma.branch.createMany({
        data: [
          {
            nameAr: "العقيدة",
            nameEn: "Aqeedah",
            icon: "🕌",
            slug: "aqeedah",
            order: 1,
          },
          {
            nameAr: "الفقه",
            nameEn: "Fiqh",
            icon: "📖",
            slug: "fiqh",
            order: 2,
          },
          {
            nameAr: "السيرة",
            nameEn: "Seerah",
            icon: "📚",
            slug: "seerah",
            order: 3,
          },
          {
            nameAr: "الأخلاق",
            nameEn: "Akhlaq",
            icon: "💎",
            slug: "akhlaq",
            order: 4,
          },
          {
            nameAr: "القرآن",
            nameEn: "Quran",
            icon: "📕",
            slug: "quran",
            order: 5,
          },
        ],
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      data: {
        levels: await prisma.level.count(),
        branches: await prisma.branch.count(),
      },
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
