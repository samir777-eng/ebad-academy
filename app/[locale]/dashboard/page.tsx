"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Book,
  BookOpen,
  FileText,
  Heart,
  Lock,
  Scale,
  TrendingUp,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const branchIcons: Record<string, any> = {
  aqeedah: Book,
  fiqh: Scale,
  seerah: User,
  tafseer: BookOpen,
  hadith: FileText,
  tarbiyah: Heart,
};

const branchColors: Record<string, string> = {
  aqeedah: "from-emerald-500 to-teal-500",
  fiqh: "from-amber-500 to-orange-500",
  seerah: "from-rose-500 to-red-500",
  tafseer: "from-indigo-500 to-purple-500",
  hadith: "from-lime-500 to-green-500",
  tarbiyah: "from-pink-500 to-rose-500",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tBranches = useTranslations("branches");
  const params = useParams();
  const locale = params.locale as string;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // State for selected level
  const [selectedLevelId, setSelectedLevelId] = React.useState<number | null>(
    null
  );

  // Use selected level or default to current level
  const activeLevelId = selectedLevelId || stats?.currentLevel?.id || null;

  // Fetch level-specific stats when a level is selected
  const { data: levelStats } = useQuery({
    queryKey: ["level-stats", activeLevelId],
    queryFn: async () => {
      if (!activeLevelId) return null;
      const res = await fetch(
        `/api/dashboard/level-stats?levelId=${activeLevelId}`
      );
      if (!res.ok) throw new Error("Failed to fetch level stats");
      return res.json();
    },
    enabled: !!activeLevelId && activeLevelId !== stats?.currentLevel?.id,
  });

  // Use level stats if available, otherwise use default stats
  const displayStats = levelStats || stats;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            {locale === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const activeLevel = displayStats?.level || stats?.currentLevel;
  const levelName = locale === "ar" ? activeLevel?.nameAr : activeLevel?.nameEn;
  const levelDesc =
    locale === "ar" ? activeLevel?.descriptionAr : activeLevel?.descriptionEn;

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section - Current Level Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 shadow-lg group">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Floating orbs */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 left-20 w-40 h-40 bg-secondary-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative flex items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-white/90" />
              <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                {selectedLevelId
                  ? locale === "ar"
                    ? "المستوى المحدد"
                    : "Selected Level"
                  : t("currentLevel")}
              </h2>
            </div>

            {/* Level Selector Dropdown */}
            {stats?.unlockedLevels && stats.unlockedLevels.length > 1 && (
              <div className="mb-4">
                <select
                  value={activeLevelId || ""}
                  onChange={(e) => setSelectedLevelId(parseInt(e.target.value))}
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl px-4 py-2 font-semibold cursor-pointer hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {stats.unlockedLevels.map((level: any) => (
                    <option
                      key={level.id}
                      value={level.id}
                      className="bg-gray-800 text-white"
                    >
                      {locale === "ar" ? level.nameAr : level.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-3xl font-bold text-white mb-2">{levelName}</p>
            <p className="text-base text-white/90 max-w-md leading-relaxed">
              {levelDesc}
            </p>

            {/* CTA Button with hover effect */}
            {displayStats?.nextLesson ? (
              <Link href={`/${locale}/lesson/${displayStats.nextLesson.id}`}>
                <button className="mt-6 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2 group/btn">
                  {t("continueLearning")}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Link>
            ) : (
              <Link href={`/${locale}/dashboard/levels`}>
                <button className="mt-6 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2 group/btn">
                  {locale === "ar" ? "عرض جميع المستويات" : "View All Levels"}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Link>
            )}
          </div>

          {/* Circular Progress with ring animation */}
          <div className="relative w-36 h-36">
            {/* Animated ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>
            <div className="relative w-full h-full rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {Math.round(displayStats?.overallProgress || 0)}%
                </div>
                <div className="text-xs text-white/80 font-medium mt-1">
                  {t("overallProgress")}
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  {displayStats?.completedLessons}/{displayStats?.totalLessons}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar with shimmer */}
        <div className="relative mt-6 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white transition-all duration-500 relative overflow-hidden"
            style={{ width: `${displayStats?.overallProgress || 0}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Branch Progress Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t("branchProgress")}
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(displayStats?.branchProgress || {}).map(
            ([slug, progress]: [string, any]) => {
              const Icon = branchIcons[slug];
              const isLocked = progress.total === 0;
              const gradientColor =
                branchColors[slug] || "from-gray-500 to-gray-600";

              return (
                <Link
                  key={slug}
                  href={isLocked ? "#" : `/${locale}/branch/${slug}`}
                  className={`block ${
                    isLocked ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="group relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Subtle glow on hover */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl`}
                    ></div>

                    {/* Icon with hover animation */}
                    <div className="mb-4 relative">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        {isLocked ? (
                          <Lock className="h-7 w-7 text-white" />
                        ) : (
                          <Icon className="h-7 w-7 text-white" />
                        )}
                      </div>
                      {/* Pulse ring for active branches */}
                      {!isLocked && progress.percentage > 0 && (
                        <div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientColor} opacity-20 animate-ping`}
                          style={{ animationDuration: "2s" }}
                        ></div>
                      )}
                    </div>

                    {/* Branch Name */}
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {tBranches(slug)}
                    </h4>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium">
                        {progress.completed}/{progress.total}
                      </span>
                      <span>•</span>
                      <span>{Math.round(progress.percentage)}%</span>
                    </div>

                    {/* Progress Bar with shimmer */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-500 relative overflow-hidden`}
                        style={{ width: `${progress.percentage}%` }}
                      >
                        {/* Shimmer effect */}
                        {progress.percentage > 0 && (
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                        )}
                      </div>
                    </div>

                    {/* Action Label */}
                    {isLocked ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <Lock className="h-4 w-4" />
                        <span>{t("locked")}</span>
                      </div>
                    ) : (
                      <div
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-gradient-to-r ${gradientColor} hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm group/btn`}
                      >
                        {progress.completed > 0
                          ? t("continue")
                          : t("startNewLesson")}
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
