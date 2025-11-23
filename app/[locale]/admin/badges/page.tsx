import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plus, Award, Users, Edit, Trash2 } from "lucide-react";
import { DeleteBadgeButton } from "@/components/admin/delete-badge-button";

export default async function AdminBadgesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Require admin access
  try {
    await requireAdmin();
  } catch (error) {
    redirect(`/${locale}/admin`);
  }

  // Get all badges with user counts
  const badges = await prisma.badge.findMany({
    include: {
      users: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const badgesWithStats = badges.map((badge) => ({
    ...badge,
    userCount: badge.users.length,
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
                  Manage Badges
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {badges.length} badges total
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/badges/new`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Badge
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Badges Grid */}
        {badges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No badges yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first achievement badge to motivate users
            </p>
            <Link
              href={`/${locale}/admin/badges/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Badge
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badgesWithStats.map((badge) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Badge Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl">
                    {badge.icon || "🏆"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${locale}/admin/badges/${badge.id}/edit`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit badge"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <DeleteBadgeButton
                      badgeId={badge.id}
                      badgeName={badge.nameEn}
                      locale={locale}
                    />
                  </div>
                </div>

                {/* Badge Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {badge.nameEn}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {badge.descriptionEn}
                </p>

                {/* Criteria */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unlock Criteria:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {badge.criteriaType === "lessons_completed" &&
                      `Complete ${badge.criteriaValue} lessons`}
                    {badge.criteriaType === "level_completed" &&
                      `Complete Level ${badge.criteriaValue}`}
                    {badge.criteriaType === "quizzes_passed" &&
                      `Pass ${badge.criteriaValue} quizzes`}
                    {badge.criteriaType === "perfect_score" &&
                      `Get ${badge.criteriaValue} perfect scores (100%)`}
                    {badge.criteriaType === "manual" && "Manually assigned"}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{badge.userCount} users earned</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      badge.criteriaType === "manual"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    }`}
                  >
                    {badge.criteriaType === "manual" ? "Manual" : "Auto"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

