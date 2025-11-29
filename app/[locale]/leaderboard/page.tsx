import { DashboardLayout } from "@/components/dashboard/layout";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("leaderboard");

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const admin = await isAdmin();
  const isRTL = locale === "ar";

  // Get all users with their progress
  const users = await prisma.user.findMany({
    include: {
      progress: {
        where: { completed: true },
      },
      quizAttempts: {
        where: { passed: true },
      },
      badges: {
        include: { badge: true },
      },
      levelStatus: {
        where: { isUnlocked: true },
        include: { level: true },
      },
    },
  });

  // Calculate scores for each user
  const leaderboardData = users
    .map((user) => {
      const completedLessons = user.progress.length;
      const passedQuizzes = user.quizAttempts.length;
      const badgesEarned = user.badges.length;
      const currentLevel =
        user.levelStatus.sort(
          (a, b) => b.level.levelNumber - a.level.levelNumber
        )[0]?.level.levelNumber || 1;

      // Calculate total score
      // Lessons: 10 points each
      // Quizzes: 15 points each
      // Badges: 25 points each
      // Level: 100 points per level
      const totalScore =
        completedLessons * 10 +
        passedQuizzes * 15 +
        badgesEarned * 25 +
        currentLevel * 100;

      return {
        id: user.id,
        name: user.name || "Anonymous",
        email: user.email,
        image: null,
        completedLessons,
        passedQuizzes,
        badgesEarned,
        currentLevel,
        totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

  // Find current user's rank
  const currentUserRank =
    leaderboardData.find((u) => u.id === session.user!.id)?.rank || 0;

  return (
    <DashboardLayout locale={locale} isAdmin={admin}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol
              className={`flex items-center gap-2 text-sm ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <span className="text-gray-400">{isRTL ? "←" : "→"}</span>
              </li>
              <li className="text-gray-900 dark:text-white font-medium">
                {t("title")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">{t("title")}</h1>
                <p className="text-yellow-100">
                  {isRTL
                    ? "تنافس مع زملائك في رحلة التعلم"
                    : "Compete with your peers in the learning journey"}
                </p>
              </div>
            </div>

            {/* Current User Rank */}
            {currentUserRank > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-100">{t("yourRank")}</p>
                    <p className="text-3xl font-bold">#{currentUserRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-100">
                      {t("totalPoints")}
                    </p>
                    <p className="text-3xl font-bold">
                      {leaderboardData.find((u) => u.id === session.user!.id)
                        ?.totalScore || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scoring System */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t("scoringSystem")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  10
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pointsPerLesson")}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  15
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pointsPerQuiz")}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  25
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pointsPerBadge")}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  100
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pointsPerLevel")}
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <LeaderboardTable
            data={leaderboardData}
            currentUserId={session.user.id}
            locale={locale}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
