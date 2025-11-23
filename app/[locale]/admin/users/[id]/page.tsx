import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  // Get user with all progress data
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      progress: {
        include: {
          lesson: {
            include: {
              level: true,
              branch: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      levelStatus: {
        include: { level: true },
        orderBy: { level: { levelNumber: "asc" } },
      },
      quizAttempts: {
        include: {
          lesson: {
            include: {
              level: true,
              branch: true,
            },
          },
        },
        orderBy: { attemptDate: "desc" },
        take: 20,
      },
      badges: {
        include: { badge: true },
        orderBy: { earnedDate: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const completedLessons = user.progress.filter((p) => p.completed);
  const passedQuizzes = user.quizAttempts.filter((a) => a.passed);
  const currentLevel =
    user.levelStatus.find((ls) => ls.isUnlocked)?.level?.levelNumber || 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin/users`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Current Level
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              Level {currentLevel}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Completed Lessons
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {completedLessons.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Passed Quizzes
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {passedQuizzes.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Earned Badges
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.badges.length}
            </p>
          </div>
        </div>

        {/* Recent Quiz Attempts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Quiz Attempts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Lesson
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.quizAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {attempt.lesson.titleEn}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {attempt.score}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          attempt.passed
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(attempt.attemptDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
