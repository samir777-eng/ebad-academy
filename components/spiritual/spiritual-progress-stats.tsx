"use client";

import { TrendingUp, Flame, Target, Award } from "lucide-react";

type SpiritualProgressStatsProps = {
  progress: any[];
  locale: string;
};

export function SpiritualProgressStats({
  progress,
  locale,
}: SpiritualProgressStatsProps) {
  const isRTL = locale === "ar";

  // Calculate statistics
  const totalDays = progress.length;
  const prayerStreak = calculateStreak(progress, "prayers");
  const quranStreak = calculateStreak(progress, "quran");
  const totalQuranPages = progress.reduce(
    (sum, day) => sum + (day.quranPages || 0),
    0
  );
  const totalPrayers = progress.reduce((sum, day) => {
    return (
      sum +
      (day.fajr ? 1 : 0) +
      (day.dhuhr ? 1 : 0) +
      (day.asr ? 1 : 0) +
      (day.maghrib ? 1 : 0) +
      (day.isha ? 1 : 0)
    );
  }, 0);

  const stats = [
    {
      label: isRTL ? "أيام متتابعة (صلاة)" : "Prayer Streak",
      value: prayerStreak,
      icon: Flame,
      color: "from-orange-500 to-red-500",
      suffix: isRTL ? "يوم" : "days",
    },
    {
      label: isRTL ? "أيام متتابعة (قرآن)" : "Quran Streak",
      value: quranStreak,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      suffix: isRTL ? "يوم" : "days",
    },
    {
      label: isRTL ? "إجمالي صفحات القرآن" : "Total Quran Pages",
      value: totalQuranPages,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      suffix: isRTL ? "صفحة" : "pages",
    },
    {
      label: isRTL ? "إجمالي الصلوات" : "Total Prayers",
      value: totalPrayers,
      icon: Award,
      color: "from-purple-500 to-pink-500",
      suffix: isRTL ? "صلاة" : "prayers",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
                <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                  {stat.suffix}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function calculateStreak(progress: any[], type: "prayers" | "quran"): number {
  if (progress.length === 0) return 0;

  let streak = 0;
  const sortedProgress = [...progress].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const day of sortedProgress) {
    let isActive = false;

    if (type === "prayers") {
      // Count as active if at least 3 prayers completed
      const prayerCount =
        (day.fajr ? 1 : 0) +
        (day.dhuhr ? 1 : 0) +
        (day.asr ? 1 : 0) +
        (day.maghrib ? 1 : 0) +
        (day.isha ? 1 : 0);
      isActive = prayerCount >= 3;
    } else if (type === "quran") {
      isActive = day.quranPages > 0 || day.quranMinutes > 0;
    }

    if (isActive) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

