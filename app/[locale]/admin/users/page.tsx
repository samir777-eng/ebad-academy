import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Shield, User, TrendingUp } from "lucide-react";
import { UserActionsMenu } from "@/components/admin/user-actions-menu";
import { UserFilters } from "@/components/admin/user-filters";

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const { locale } = await params;
  const { search, role: roleFilter } = await searchParams;
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

  const searchQuery = search || "";

  // Get all users with their progress
  const users = await prisma.user.findMany({
    where: {
      AND: [
        searchQuery
          ? {
              OR: [
                { name: { contains: searchQuery } },
                { email: { contains: searchQuery } },
              ],
            }
          : {},
        roleFilter ? { role: roleFilter } : {},
      ],
    },
    include: {
      progress: {
        where: { completed: true },
      },
      levelStatus: {
        where: { isUnlocked: true },
        include: { level: true },
      },
      quizAttempts: {
        where: { passed: true },
      },
      badges: {
        include: { badge: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics for each user
  const usersWithStats = users.map((user) => ({
    ...user,
    completedLessons: user.progress.length,
    passedQuizzes: user.quizAttempts.length,
    unlockedLevels: user.levelStatus.length,
    earnedBadges: user.badges.length,
    currentLevel: user.levelStatus[0]?.level?.levelNumber || 1,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/admin`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Manage Users
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {users.length} users total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <UserFilters
          locale={locale}
          initialSearch={searchQuery}
          initialRole={roleFilter}
        />

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID / Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {usersWithStats.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-mono text-gray-900 dark:text-white font-semibold">
                          {user.idNumber}
                        </div>
                        <div
                          className="text-gray-500 dark:text-gray-400 mt-1"
                          dir="ltr"
                        >
                          {user.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-gray-900 dark:text-white">
                            L{user.currentLevel}
                          </span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {user.completedLessons} lessons
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {user.passedQuizzes} quizzes
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <UserActionsMenu user={user} locale={locale} />
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
