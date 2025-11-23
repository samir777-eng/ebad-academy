import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, Eye, ArrowLeft } from "lucide-react";

export default async function QuizHistoryPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale, lessonId } = await params;
  const isRTL = locale === "ar";

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Get lesson details
  const lesson = await prisma.lesson.findUnique({
    where: { id: parseInt(lessonId) },
    include: {
      branch: true,
      level: true,
    },
  });

  if (!lesson) {
    redirect(`/${locale}/dashboard`);
  }

  // Get all quiz attempts for this lesson
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      lessonId: parseInt(lessonId),
    },
    orderBy: {
      attemptDate: "desc",
    },
  });

  const lessonTitle = isRTL ? lesson.titleAr : lesson.titleEn;
  const branchName = isRTL ? lesson.branch.nameAr : lesson.branch.nameEn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/lesson/${lessonId}`}
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isRTL ? "العودة إلى الدرس" : "Back to Lesson"}</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isRTL ? "سجل الاختبارات" : "Quiz History"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {lessonTitle} • {branchName}
          </p>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? "لم تقم بأي محاولات لهذا الاختبار بعد"
                : "No quiz attempts yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <Link
                key={attempt.id}
                href={`/${locale}/quiz-review/${attempt.id}`}
                className="block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Attempt Number */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {isRTL ? "المحاولة" : "Attempt"}
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        #{attempts.length - index}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {isRTL ? "النتيجة" : "Score"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {attempt.score.toFixed(0)}%
                        </span>
                        {attempt.passed ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Correct Answers */}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {isRTL ? "الإجابات الصحيحة" : "Correct Answers"}
                      </span>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white">
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {isRTL ? "التاريخ" : "Date"}
                      </span>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(attempt.attemptDate).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold">
                    <Eye className="h-5 w-5" />
                    <span>{isRTL ? "مراجعة" : "Review"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

