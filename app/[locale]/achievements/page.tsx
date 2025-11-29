import { DashboardLayout } from "@/components/dashboard/layout";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Award, ChevronRight, Home, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("achievements");

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const admin = await isAdmin();
  const isRTL = locale === "ar";

  // Fetch all badges
  const allBadges = await prisma.badge.findMany({
    orderBy: { id: "desc" },
  });

  // Fetch user's earned badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
  });

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  return (
    <DashboardLayout locale={locale} isAdmin={admin}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
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
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>{isRTL ? "لوحة التحكم" : "Dashboard"}</span>
                </Link>
              </li>
              <li>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 ${
                    isRTL ? "rotate-180" : ""
                  }`}
                />
              </li>
              <li className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                <Award className="w-4 h-4" />
                <span>{isRTL ? "الإنجازات" : "Achievements"}</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {isRTL ? "الإنجازات" : "Achievements"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? `لقد حصلت على ${userBadges.length} من ${allBadges.length} شارة`
                : `You've earned ${userBadges.length} of ${allBadges.length} badges`}
            </p>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const userBadge = userBadges.find(
                (ub) => ub.badgeId === badge.id
              );

              return (
                <div
                  key={badge.id}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    isEarned
                      ? "bg-white dark:bg-gray-800 border-primary-500 shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60"
                  }`}
                >
                  {/* Lock Icon for Locked Badges */}
                  {!isEarned && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  {/* Badge Icon */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                        isEarned
                          ? "bg-gradient-to-br from-primary-500 to-primary-600"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      {badge.iconUrl}
                    </div>
                  </div>

                  {/* Badge Name */}
                  <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                    {isRTL ? badge.nameAr : badge.nameEn}
                  </h3>

                  {/* Badge Description */}
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
                    {isRTL ? badge.descriptionAr : badge.descriptionEn}
                  </p>

                  {/* Earned Date */}
                  {isEarned && userBadge && (
                    <p className="text-xs text-center text-primary-600 dark:text-primary-400 font-medium">
                      {t("earnedOn")}{" "}
                      {new Date(userBadge.earnedDate).toLocaleDateString(
                        isRTL ? "ar-EG" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {allBadges.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("noBadgesAvailable")}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
