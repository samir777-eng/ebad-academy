"use client";

import { TrendingUp, BookOpen, Target } from "lucide-react";

type User = {
  createdAt: Date;
  progress: { id: number }[];
};

type QuizAttempt = {
  id: number;
  score: number;
  passed: boolean;
  createdAt: Date;
  lesson: {
    titleEn: string;
    level: { levelNumber: number };
    branch: { nameEn: string };
  };
};

type LevelStat = {
  levelNumber: number;
  totalLessons: number;
  avgCompletionRate: number;
};

type PopularLesson = {
  id: number;
  title: string;
  level: number;
  branch: string;
  completions: number;
  attempts: number;
};

export function AnalyticsCharts({
  users,
  quizAttempts,
  levelStats,
  popularLessons,
}: {
  users: User[];
  quizAttempts: QuizAttempt[];
  levelStats: LevelStat[];
  popularLessons: PopularLesson[];
}) {
  // Calculate user growth over last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const userGrowth = last30Days.map((date) => {
    const count = users.filter(
      (u) => new Date(u.createdAt).toISOString().split("T")[0] === date
    ).length;
    return { date, count };
  });

  const maxUserCount = Math.max(...userGrowth.map((d) => d.count), 1);

  // Calculate quiz performance distribution
  const scoreRanges = [
    { label: "0-20%", min: 0, max: 20, count: 0 },
    { label: "21-40%", min: 21, max: 40, count: 0 },
    { label: "41-60%", min: 41, max: 60, count: 0 },
    { label: "61-80%", min: 61, max: 80, count: 0 },
    { label: "81-100%", min: 81, max: 100, count: 0 },
  ];

  quizAttempts.forEach((attempt) => {
    const range = scoreRanges.find(
      (r) => attempt.score >= r.min && attempt.score <= r.max
    );
    if (range) range.count++;
  });

  const maxScoreCount = Math.max(...scoreRanges.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      {/* User Growth Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              User Growth (Last 30 Days)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New user registrations per day
            </p>
          </div>
        </div>
        <div className="h-64 flex items-end gap-1">
          {userGrowth.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t hover:opacity-80 transition-opacity cursor-pointer relative group"
                  style={{
                    height: `${(day.count / maxUserCount) * 100}%`,
                    minHeight: day.count > 0 ? "4px" : "0px",
                  }}
                  title={`${day.count} users on ${new Date(day.date).toLocaleDateString()}`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} users
                  </div>
                </div>
              </div>
              {index % 5 === 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(day.date).getDate()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Level Completion Rates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Level Completion Rates
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average completion rate per level
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {levelStats.map((level) => (
            <div key={level.levelNumber}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Level {level.levelNumber}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {level.avgCompletionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${level.avgCompletionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {level.totalLessons} lessons in this level
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Score Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quiz Score Distribution
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Distribution of quiz scores across all attempts
            </p>
          </div>
        </div>
        <div className="h-64 flex items-end gap-4">
          {scoreRanges.map((range, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className={`w-full rounded-t hover:opacity-80 transition-opacity cursor-pointer relative group ${
                    range.min >= 60
                      ? "bg-gradient-to-t from-green-500 to-emerald-400"
                      : "bg-gradient-to-t from-red-500 to-orange-400"
                  }`}
                  style={{
                    height: `${(range.count / maxScoreCount) * 100}%`,
                    minHeight: range.count > 0 ? "8px" : "0px",
                  }}
                  title={`${range.count} attempts in ${range.label} range`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {range.count} attempts
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {range.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Lessons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Most Popular Lessons
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Lesson
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Completions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {popularLessons.map((lesson, index) => (
                <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {lesson.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    Level {lesson.level}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {lesson.branch}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {lesson.completions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

