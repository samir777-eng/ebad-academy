import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Award, BookOpen, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Require admin access
  try {
    await requireAdmin();
  } catch (error) {
    redirect(`/${locale}/admin`);
  }

  // Get analytics data
  const [
    totalUsers,
    totalLessons,
    totalQuizAttempts,
    passedQuizzes,
    completedLessons,
    users,
    lessons,
    quizAttempts,
    levels,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.userProgress.count({ where: { completed: true } }),
    prisma.user.findMany({
      select: {
        createdAt: true,
        progress: {
          where: { completed: true },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lesson.findMany({
      include: {
        userProgress: {
          where: { completed: true },
        },
        quizAttempts: true,
        level: true,
        branch: true,
      },
    }),
    prisma.quizAttempt.findMany({
      include: {
        lesson: {
          include: {
            level: true,
            branch: true,
          },
        },
      },
      orderBy: { attemptDate: "desc" },
      take: 100,
    }),
    prisma.level.findMany({
      include: {
        lessons: {
          include: {
            userProgress: {
              where: { completed: true },
            },
          },
        },
      },
      orderBy: { levelNumber: "asc" },
    }),
  ]);

  // Calculate statistics
  const passRate =
    totalQuizAttempts > 0
      ? Math.round((passedQuizzes / totalQuizAttempts) * 100)
      : 0;

  const activeUsers = users.filter((u) => u.progress.length > 0).length;

  const avgLessonsPerUser =
    totalUsers > 0 ? Math.round(completedLessons / totalUsers) : 0;

  // Popular lessons (most completed)
  const popularLessons = lessons
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.titleEn,
      level: lesson.level.levelNumber,
      branch: lesson.branch.nameEn,
      completions: lesson.userProgress.length,
      attempts: lesson.quizAttempts.length,
    }))
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 10);

  // Level completion rates
  const levelStats = levels.map((level) => {
    const totalLessonsInLevel = level.lessons.length;
    const totalCompletions = level.lessons.reduce(
      (sum, lesson) => sum + lesson.userProgress.length,
      0
    );
    const avgCompletionRate =
      totalLessonsInLevel > 0
        ? Math.round(
            (totalCompletions / (totalLessonsInLevel * totalUsers)) * 100
          )
        : 0;

    return {
      levelNumber: level.levelNumber,
      totalLessons: totalLessonsInLevel,
      avgCompletionRate,
    };
  });

  // User growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsers = users.filter(
    (u) => new Date(u.createdAt) >= thirtyDaysAgo
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Platform performance and user engagement metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {totalUsers}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              +{recentUsers.length} this month
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {activeUsers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalUsers > 0
                ? Math.round((activeUsers / totalUsers) * 100)
                : 0}
              % of total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Avg Lessons/User
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {avgLessonsPerUser}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completedLessons} total completions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Quiz Pass Rate
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {passRate}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {passedQuizzes}/{totalQuizAttempts} attempts
            </p>
          </div>
        </div>

        {/* Charts Component */}
        <AnalyticsCharts
          users={users}
          quizAttempts={quizAttempts.map((attempt) => ({
            ...attempt,
            createdAt: attempt.attemptDate,
          }))}
          levelStats={levelStats}
          popularLessons={popularLessons}
        />
      </div>
    </div>
  );
}
