import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  Lock,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface BranchPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { locale, slug } = await params;
  const session = await auth();
  const t = await getTranslations("branch");

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Get branch with lessons
  const branch = await prisma.branch.findUnique({
    where: { slug },
    include: {
      lessons: {
        include: {
          level: true,
          userProgress: {
            where: { userId: session.user.id },
          },
          questions: true,
        },
        orderBy: [{ levelId: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!branch) {
    notFound();
  }

  // Get user's current level
  const userLevelStatus = await prisma.userLevelStatus.findMany({
    where: {
      userId: session.user.id,
      isUnlocked: true,
    },
    orderBy: { levelId: "desc" },
  });

  const currentLevelId = userLevelStatus[0]?.levelId || 1;

  // Calculate progress
  const totalLessons = branch.lessons.length;
  const completedLessons = branch.lessons.filter(
    (lesson) => lesson.userProgress[0]?.completed
  ).length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Group lessons by level
  const lessonsByLevel = branch.lessons.reduce((acc, lesson) => {
    const levelId = lesson.levelId;
    if (!acc[levelId]) {
      acc[levelId] = [];
    }
    acc[levelId].push(lesson);
    return acc;
  }, {} as Record<number, typeof branch.lessons>);

  const branchName = locale === "ar" ? branch.nameAr : branch.nameEn;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <DashboardSidebar locale={locale} isRTL={locale === "ar"} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          locale === "ar" ? "mr-64" : "ml-64"
        }`}
      >
        {/* Header */}
        <DashboardHeader locale={locale} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>{t("dashboard")}</span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 dark:text-white font-medium">
                {branchName}
              </span>
            </nav>

            {/* Branch Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 shadow-lg mb-8 group">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Floating orbs */}
              <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-10 left-20 w-40 h-40 bg-secondary-400/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="relative">
                <h1 className="text-4xl font-bold text-white mb-6">
                  {branchName}
                </h1>

                {/* Stats */}
                <div className="flex items-center gap-6 text-white/90 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">
                      {totalLessons} {t("lessons")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      {completedLessons} {t("completed")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">
                      {Math.round(progressPercentage)}% {t("progress")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-white transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons by Level */}
            <div className="space-y-8">
              {Object.entries(lessonsByLevel)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([levelId, lessons]) => {
                  const level = lessons[0].level;
                  const levelName =
                    locale === "ar" ? level.nameAr : level.nameEn;
                  const isLevelUnlocked = Number(levelId) <= currentLevelId;

                  return (
                    <div key={levelId} className="space-y-4">
                      {/* Level Header */}
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {levelName}
                        </h2>
                        {!isLevelUnlocked && (
                          <span className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {t("locked")}
                          </span>
                        )}
                      </div>

                      {/* Lesson Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson, index) => {
                          const lessonTitle =
                            locale === "ar" ? lesson.titleAr : lesson.titleEn;
                          const isCompleted =
                            lesson.userProgress[0]?.completed || false;
                          const score = lesson.userProgress[0]?.score || 0;
                          const questionCount = lesson.questions.length;

                          return (
                            <Link
                              key={lesson.id}
                              href={
                                isLevelUnlocked
                                  ? `/${locale}/lesson/${lesson.id}`
                                  : "#"
                              }
                              className={`group relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 ${
                                isLevelUnlocked
                                  ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                  : "opacity-60 cursor-not-allowed"
                              }`}
                            >
                              {/* Subtle glow on hover */}
                              {isLevelUnlocked && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl"></div>
                              )}

                              <div className="relative">
                                {/* Lesson Number & Status */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                      {index + 1}
                                    </div>
                                    {isCompleted && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    )}
                                  </div>
                                  {!isLevelUnlocked && (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>

                                {/* Lesson Title */}
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                  {lessonTitle}
                                </h3>

                                {/* Lesson Meta */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {lesson.duration} {t("minutes")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4" />
                                    <span>
                                      {questionCount} {t("questions")}
                                    </span>
                                  </div>
                                </div>

                                {/* Progress/Score */}
                                {isCompleted && (
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                        style={{ width: `${score}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                      {Math.round(score)}%
                                    </span>
                                  </div>
                                )}

                                {/* CTA */}
                                {isLevelUnlocked && !isCompleted && (
                                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm">
                                    <PlayCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span>{t("startLesson")}</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
