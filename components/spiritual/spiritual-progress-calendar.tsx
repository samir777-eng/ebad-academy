"use client";

import { CheckCircle2, Circle } from "lucide-react";

type SpiritualProgressCalendarProps = {
  progress: any[];
  locale: string;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
};

export function SpiritualProgressCalendar({
  progress,
  locale,
  selectedDate,
  onDateSelect,
}: SpiritualProgressCalendarProps) {
  const isRTL = locale === "ar";

  // Get last 30 days
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }

  const getProgressForDate = (date: Date) => {
    return progress.find((p) => {
      const pDate = new Date(p.date);
      pDate.setHours(0, 0, 0, 0);
      return pDate.getTime() === date.getTime();
    });
  };

  const getCompletionLevel = (dayProgress: any) => {
    if (!dayProgress) return 0;

    let score = 0;
    const maxScore = 9;

    // Prayers (5 points)
    score += dayProgress.fajr ? 1 : 0;
    score += dayProgress.dhuhr ? 1 : 0;
    score += dayProgress.asr ? 1 : 0;
    score += dayProgress.maghrib ? 1 : 0;
    score += dayProgress.isha ? 1 : 0;

    // Quran (2 points)
    score += dayProgress.quranPages > 0 || dayProgress.quranMinutes > 0 ? 2 : 0;

    // Other acts (2 points)
    score += dayProgress.fasting ? 0.5 : 0;
    score += dayProgress.charity ? 0.5 : 0;
    score += dayProgress.dhikr ? 0.5 : 0;
    score += dayProgress.dua ? 0.5 : 0;

    return (score / maxScore) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayProgress = getProgressForDate(day);
          const completionLevel = getCompletionLevel(dayProgress);
          const isToday =
            day.toDateString() === new Date().toDateString();
          const isSelected =
            day.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`aspect-square p-2 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : isToday
                  ? "border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {day.getDate()}
                </span>
                {completionLevel > 0 ? (
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 14 * (1 - completionLevel / 100)
                        }`}
                        className={`${
                          completionLevel >= 80
                            ? "text-green-500"
                            : completionLevel >= 50
                            ? "text-yellow-500"
                            : "text-orange-500"
                        }`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {Math.round(completionLevel)}
                    </span>
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {isRTL ? "80%+" : "80%+"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {isRTL ? "50-79%" : "50-79%"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {isRTL ? "1-49%" : "1-49%"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-300" />
          <span className="text-gray-600 dark:text-gray-400">
            {isRTL ? "لا يوجد" : "None"}
          </span>
        </div>
      </div>
    </div>
  );
}

