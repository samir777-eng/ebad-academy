"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Lock,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function LevelsPage() {
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
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
        <div className="relative">
          {levels?.map((level, index) => {
            const isLocked = !level.isUnlocked;
            const isCompleted = level.completionPercentage === 100;
            const isInProgress =
              level.isUnlocked &&
              level.completionPercentage > 0 &&
              !isCompleted;

            return (
              <div
                key={level.id}
                className={`group relative p-8 rounded-3xl transition-all duration-500 ${
                  isLocked
                    ? "bg-gray-100 dark:bg-gray-800 opacity-60"
                    : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:scale-105 cursor-pointer"
                } border-2 ${
                  isCompleted
                    ? "border-green-500"
                    : isInProgress
                    ? "border-primary-500"
                    : "border-gray-200 dark:border-gray-700"
                } shadow-xl hover:shadow-2xl`}
              >
                {/* Level Number Badge */}
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                  {level.levelNumber}
                </div>

                {/* Lock/Status Icon */}
                <div className="mb-6">
                  {isLocked ? (
                    <Lock className="w-16 h-16 text-gray-400" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  ) : (
                    <TrendingUp className="w-16 h-16 text-primary-600" />
                  )}
                </div>

                {/* Level Info */}
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                  {locale === "ar" ? level.nameAr : level.nameEn}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {locale === "ar" ? level.descriptionAr : level.descriptionEn}
                </p>

                {/* Progress Bar */}
                {!isLocked && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("progress")}
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {level.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                        style={{ width: `${level.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {level.completedLessons}/{level.totalLessons}{" "}
                      {t("lessons")}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                {!isLocked && (
                  <Link href={`/${locale}/dashboard/levels/${level.id}`}>
                    <button className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                      {isCompleted ? t("review") : t("continue")}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </Link>
                )}

                {isLocked && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 font-semibold">
                    {t("locked")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
