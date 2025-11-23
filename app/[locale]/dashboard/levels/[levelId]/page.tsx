import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Book,
  BookOpen,
  ChevronRight,
  FileText,
  Heart,
  Scale,
  User,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// Map branch slugs to Lucide icons
const branchIcons: Record<string, any> = {
  aqeedah: Book,
  fiqh: Scale,
  seerah: User,
  tafseer: BookOpen,
  hadith: FileText,
  tarbiyah: Heart,
};

type PageProps = {
  params: Promise<{
    locale: string;
    levelId: string;
  }>;
};

export default async function LevelDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { locale, levelId } = await params;
  const levelIdNum = parseInt(levelId);

  if (isNaN(levelIdNum)) {
    notFound();
  }

  const t = await getTranslations("levels");

  // Get level details
  const level = await prisma.level.findUnique({
    where: { id: levelIdNum },
  });

  if (!level) {
    notFound();
  }

  // Check if user has access to this level
  const userLevelStatus = await prisma.userLevelStatus.findUnique({
    where: {
      userId_levelId: {
        userId: session.user.id,
        levelId: levelIdNum,
      },
    },
  });

  if (!userLevelStatus?.isUnlocked) {
    redirect(`/${locale}/dashboard`);
  }

  // Get all branches with lessons for this level
  const branches = await prisma.branch.findMany({
    include: {
      lessons: {
        where: { levelId: levelIdNum },
        include: {
          userProgress: {
            where: { userId: session.user.id },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const levelName = locale === "ar" ? level.nameAr : level.nameEn;
  const levelDescription =
    locale === "ar" ? level.descriptionAr : level.descriptionEn;

  return (
    <>
      {/* Back Button */}
      <Link
        href={`/${locale}/dashboard/levels`}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("backToLevels")}</span>
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
            {level.levelNumber}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {levelName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {levelDescription}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-500"
            style={{ width: `${userLevelStatus.completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {Math.round(userLevelStatus.completionPercentage)}% Complete
        </p>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const branchName = locale === "ar" ? branch.nameAr : branch.nameEn;
          const totalLessons = branch.lessons.length;
          const completedLessons = branch.lessons.filter(
            (lesson) => lesson.userProgress[0]?.completed
          ).length;
          const progress =
            totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          // Get the icon component for this branch
          const Icon = branchIcons[branch.slug] || Book;

          return (
            <Link
              key={branch.id}
              href={`/${locale}/branch/${branch.slug}?level=${levelIdNum}`}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:scale-105 transition-all duration-200 hover:shadow-2xl">
                {/* Branch Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Branch Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {branchName}
                </h3>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>
                      {completedLessons}/{totalLessons} Lessons
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-2 transition-transform">
                  <span>Start Learning</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
