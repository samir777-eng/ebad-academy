import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{ locale: string; attemptId: string }>;
}) {
  const { locale, attemptId } = await params;
  const isRTL = locale === "ar";
  const t = await getTranslations("quizReview");

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Get quiz attempt with all details
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: parseInt(attemptId) },
    include: {
      lesson: {
        include: {
          branch: true,
          level: true,
          questions: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    redirect(`/${locale}/dashboard`);
  }

  const lessonTitle = isRTL ? attempt.lesson.titleAr : attempt.lesson.titleEn;
  const branchName = isRTL
    ? attempt.lesson.branch.nameAr
    : attempt.lesson.branch.nameEn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/quiz-history/${attempt.lessonId}`}
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToHistory")}</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {lessonTitle} • {branchName}
          </p>
        </div>

        {/* Results Summary */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("score")}
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {attempt.score.toFixed(0)}%
              </p>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {attempt.passed ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("status")}
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  attempt.passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {attempt.passed
                  ? isRTL
                    ? "نجاح"
                    : "Passed"
                  : isRTL
                  ? "رسوب"
                  : "Failed"}
              </p>
            </div>

            {/* Correct Answers */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("correct")}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempt.correctAnswers}/{attempt.totalQuestions}
              </p>
            </div>

            {/* Date */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t("date")}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(attempt.attemptDate).toLocaleDateString(
                  isRTL ? "ar-EG" : "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("questionsReview")}
          </h2>

          {attempt.answers.map((answer, index) => {
            const question = answer.question;
            const questionText = isRTL
              ? question.questionTextAr
              : question.questionTextEn;
            const explanation = isRTL
              ? question.explanationAr
              : question.explanationEn;

            let options: string[] = [];
            if (question.type === "multiple_choice") {
              const optionsJson = isRTL
                ? question.optionsAr
                : question.optionsEn;
              options = optionsJson ? JSON.parse(optionsJson) : [];
            }

            return (
              <div
                key={answer.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 ${
                  answer.isCorrect
                    ? "border-green-500 dark:border-green-600"
                    : "border-red-500 dark:border-red-600"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold">
                      {t("question")} {index + 1}
                    </span>
                    {answer.isCorrect ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          {t("correctLabel")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          {t("incorrectLabel")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {questionText}
                </h3>

                {/* Options for Multiple Choice */}
                {question.type === "multiple_choice" && (
                  <div className="space-y-3 mb-4">
                    {options.map((option, optionIndex) => {
                      const isUserAnswer =
                        answer.answer === optionIndex.toString();
                      const isCorrectAnswer =
                        question.correctAnswer === optionIndex.toString();

                      return (
                        <div
                          key={optionIndex}
                          className={`p-4 rounded-xl border-2 ${
                            isCorrectAnswer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isUserAnswer
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCorrectAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <span
                              className={`font-medium ${
                                isCorrectAnswer
                                  ? "text-green-700 dark:text-green-300"
                                  : isUserAnswer
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True/False Answer */}
                {question.type === "true_false" && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {["true", "false"].map((value) => {
                      const isUserAnswer = answer.answer === value;
                      const isCorrectAnswer = question.correctAnswer === value;

                      return (
                        <div
                          key={value}
                          className={`p-4 rounded-xl border-2 text-center ${
                            isCorrectAnswer
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isUserAnswer
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isCorrectAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <span
                              className={`font-bold ${
                                isCorrectAnswer
                                  ? "text-green-700 dark:text-green-300"
                                  : isUserAnswer
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {value === "true"
                                ? isRTL
                                  ? "صح"
                                  : "True"
                                : isRTL
                                ? "خطأ"
                                : "False"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      {t("explanation")}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      {explanation}
                    </p>
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
