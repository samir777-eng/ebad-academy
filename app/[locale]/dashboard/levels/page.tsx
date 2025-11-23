"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Level {
  id: number;
  levelNumber: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isUnlocked: boolean;
  completionPercentage: number;
  totalLessons: number;
  completedLessons: number;
}

export default function LevelsRoadmapPage() {
  const t = useTranslations("levels");
  const params = useParams();
  const locale = params.locale as string;

  const { data: levels, isLoading } = useQuery<Level[]>({
    queryKey: ["levels"],
    queryFn: async () => {
      const res = await fetch("/api/levels");
      if (!res.ok) throw new Error("Failed to fetch levels");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
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
                {isRTL ? "لوحة التحكم" : "Dashboard"}
              </Link>
            </li>
            <li>
              <span className="text-gray-400">{isRTL ? "←" : "→"}</span>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">
              {isRTL ? "مستوياتي" : "My Levels"}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Roadmap Path */}
        <div className="relative space-y-12">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-300 via-primary-500 to-secondary-500 dark:from-primary-700 dark:via-primary-500 dark:to-secondary-500 -translate-x-1/2" />

          {levels?.map((level, index) => {
            const isLocked = !level.isUnlocked;
            const isCompleted = level.completionPercentage === 100;
            const isInProgress =
              level.isUnlocked &&
              level.completionPercentage > 0 &&
              !isCompleted;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={level.id}
                className={`relative flex items-center ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                } flex-col gap-8`}
              >
                {/* Timeline Node (Circle) */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-500 ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-400 to-green-600 border-green-200 dark:border-green-800"
                        : isInProgress
                        ? "bg-gradient-to-br from-primary-500 to-secondary-500 border-primary-200 dark:border-primary-800 animate-pulse"
                        : isLocked
                        ? "bg-gray-400 dark:bg-gray-600 border-gray-300 dark:border-gray-700"
                        : "bg-gradient-to-br from-primary-400 to-secondary-400 border-primary-200 dark:border-primary-800"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-7 h-7 text-white" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : (
                      <span className="text-2xl font-black text-white">
                        {level.levelNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Spacer for mobile */}
                <div className="w-16 md:hidden" />

                {/* Level Card */}
                <div className="flex-1 md:w-[calc(50%-4rem)]">
                  <div
                    className={`group p-6 rounded-2xl transition-all duration-500 ${
                      isLocked
                        ? "bg-gray-100 dark:bg-gray-800/50 opacity-70"
                        : "bg-white dark:bg-gray-800 shadow-xl"
                    } border-2 ${
                      isCompleted
                        ? "border-green-400 dark:border-green-600"
                        : isInProgress
                        ? "border-primary-400 dark:border-primary-600"
                        : "border-gray-200 dark:border-gray-700"
                    } shadow-lg`}
                  >
                    {/* Level Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                          {locale === "ar" ? level.nameAr : level.nameEn}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {locale === "ar"
                            ? level.descriptionAr
                            : level.descriptionEn}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="ml-4">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isLocked && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {level.completedLessons}/{level.totalLessons}{" "}
                            {t("lessons")}
                          </span>
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                            {Math.round(level.completionPercentage)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                            style={{
                              width: `${level.completionPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {isLocked && (
                      <div className="text-center py-2 text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>{t("locked")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer for desktop to maintain alternating layout */}
                <div className="hidden md:block flex-1 md:w-[calc(50%-4rem)]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
