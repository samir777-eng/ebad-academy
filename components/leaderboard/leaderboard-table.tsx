"use client";

import { Trophy, Medal, Award, BookOpen, Target, Star } from "lucide-react";
import Image from "next/image";

type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  email: string;
  image: string | null;
  completedLessons: number;
  passedQuizzes: number;
  badgesEarned: number;
  currentLevel: number;
  totalScore: number;
};

type LeaderboardTableProps = {
  data: LeaderboardEntry[];
  currentUserId: string;
  locale: string;
};

export function LeaderboardTable({
  data,
  currentUserId,
  locale,
}: LeaderboardTableProps) {
  const isRTL = locale === "ar";

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "الترتيب" : "Rank"}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "الطالب" : "Student"}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "المستوى" : "Level"}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "الدروس" : "Lessons"}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "الاختبارات" : "Quizzes"}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "الشارات" : "Badges"}
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {isRTL ? "النقاط" : "Points"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((entry) => {
              const isCurrentUser = entry.id === currentUserId;
              return (
                <tr
                  key={entry.id}
                  className={`transition-colors ${
                    isCurrentUser
                      ? "bg-primary-50 dark:bg-primary-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankBadge(
                          entry.rank
                        )}`}
                      >
                        {entry.rank}
                      </span>
                    </div>
                  </td>

                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt={entry.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(entry.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                              ({isRTL ? "أنت" : "You"})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                      <Star className="w-4 h-4" />
                      {entry.currentLevel}
                    </span>
                  </td>

                  {/* Lessons */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <BookOpen className="w-4 h-4" />
                      {entry.completedLessons}
                    </span>
                  </td>

                  {/* Quizzes */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Target className="w-4 h-4" />
                      {entry.passedQuizzes}
                    </span>
                  </td>

                  {/* Badges */}
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Award className="w-4 h-4" />
                      {entry.badgesEarned}
                    </span>
                  </td>

                  {/* Total Score */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.totalScore.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL
              ? "لا يوجد طلاب في لوحة المتصدرين بعد"
              : "No students on the leaderboard yet"}
          </p>
        </div>
      )}
    </div>
  );
}

