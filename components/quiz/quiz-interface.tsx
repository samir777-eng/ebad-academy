"use client";

import { Check, ChevronLeft, ChevronRight, Target, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeNotification } from "../badges/badge-notification";
import { LevelUnlockModal } from "./level-unlock-modal";

type Question = {
  id: number;
  questionTextAr: string;
  questionTextEn: string;
  type: string;
  optionsAr: string | null;
  optionsEn: string | null;
  correctAnswer: string;
  explanationAr: string | null;
  explanationEn: string | null;
};

type Lesson = {
  id: number;
  titleAr: string;
  titleEn: string;
  branch: {
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  questions: Question[];
};

type UserProgress = {
  completed: boolean;
  score: number | null;
} | null;

type QuizInterfaceProps = {
  lesson: Lesson;
  userProgress: UserProgress;
  locale: string;
  userId: string;
};

export function QuizInterface({
  lesson,
  userProgress: _userProgress,
  locale,
  userId: _userId,
}: QuizInterfaceProps) {
  const router = useRouter();
  const isRTL = locale === "ar";

  // Shuffle questions on initial load and retakes
  const [shuffledQuestions, setShuffledQuestions] = useState(() => {
    const questions = [...lesson.questions];
    // Fisher-Yates shuffle algorithm
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = questions[i];
      const swap = questions[j];
      if (temp !== undefined && swap !== undefined) {
        questions[i] = swap;
        questions[j] = temp;
      }
    }
    return questions;
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    new Array(shuffledQuestions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<
    Array<{ isCorrect: boolean; userAnswer: string; correctAnswer: string }>
  >([]);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTransition, setQuestionTransition] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<number | null>(
    null
  );
  const [showLevelUnlock, setShowLevelUnlock] = useState(false);
  const [unlockedLevelId, setUnlockedLevelId] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);

  const title = isRTL ? lesson.titleAr : lesson.titleEn;
  const branchName = isRTL ? lesson.branch.nameAr : lesson.branch.nameEn;

  const question = shuffledQuestions[currentQuestion];
  if (!question) {
    return <div>No questions available</div>;
  }

  const questionText = isRTL
    ? question.questionTextAr
    : question.questionTextEn;
  const options =
    question.type === "multiple_choice"
      ? JSON.parse((isRTL ? question.optionsAr : question.optionsEn) || "[]")
      : null;

  const handleAnswer = (answer: string, optionIndex?: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    // Trigger selection animation
    if (optionIndex !== undefined) {
      setSelectedAnimation(optionIndex);
      setTimeout(() => setSelectedAnimation(null), 300);
    }
  };

  const goToQuestion = (index: number) => {
    setQuestionTransition(true);
    setTimeout(() => {
      setCurrentQuestion(index);
      setQuestionTransition(false);
    }, 150);
  };

  const nextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setQuestionTransition(false);
      }, 150);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setQuestionTransition(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setQuestionTransition(false);
      }, 150);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);

    // Calculate results
    const quizResults = shuffledQuestions.map((q, index) => {
      const userAnswer = answers[index] || "";
      const correctAnswer = q.correctAnswer;
      const isCorrect = userAnswer === correctAnswer;

      return {
        isCorrect,
        userAnswer,
        correctAnswer,
      };
    });

    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const scorePercentage = Math.round(
      (correctCount / shuffledQuestions.length) * 100
    );

    setResults(quizResults);
    setScore(scorePercentage);
    setShowResults(true);

    // Save to database
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          answers: answers,
          score: scorePercentage,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save quiz results");
      } else {
        const data = await response.json();

        // Check if badges were earned
        if (data.newBadges && data.newBadges.length > 0) {
          setNewBadges(data.newBadges);
          setShowBadgeNotification(true);
        }

        // Check if a level was unlocked
        if (data.levelUnlocked && data.nextLevelId) {
          setUnlockedLevelId(data.nextLevelId);
          setShowLevelUnlock(true);
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retakeQuiz = () => {
    // Reshuffle questions for retake
    const questions = [...lesson.questions];
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = questions[i];
      const swap = questions[j];
      if (temp !== undefined && swap !== undefined) {
        questions[i] = swap;
        questions[j] = temp;
      }
    }
    setShuffledQuestions(questions);

    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
    setResults([]);
    setScore(0);
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercentage = (answeredCount / shuffledQuestions.length) * 100;

  if (showResults) {
    // Results view
    const passed = score >= 60;
    const correctCount = results.filter((r) => r.isCorrect).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              passed
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            {passed ? (
              <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-12 w-12 text-red-600 dark:text-red-400" />
            )}
          </div>

          <h1
            className={`text-3xl font-black mb-4 ${
              passed
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {passed
              ? isRTL
                ? "مبروك! لقد نجحت!"
                : "Congratulations! You Passed!"
              : isRTL
              ? "استمر في المحاولة!"
              : "Keep Trying!"}
          </h1>

          <div className="text-6xl font-black text-gray-900 dark:text-white mb-2">
            {score}%
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {correctCount}/{shuffledQuestions.length}{" "}
            {isRTL ? "إجابات صحيحة" : "Correct Answers"}
          </p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  passed
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {isRTL ? "النجاح: 60%" : "Passing: 60%"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() =>
                router.push(`/${locale}/quiz-history/${lesson.id}`)
              }
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300"
            >
              {isRTL ? "عرض السجل" : "View History"}
            </button>
            <button
              onClick={retakeQuiz}
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300"
            >
              {isRTL ? "إعادة الاختبار" : "Retake Quiz"}
            </button>
            <button
              onClick={() => router.push(`/${locale}/lesson/${lesson.id}`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {isRTL ? "العودة إلى الدرس" : "Back to Lesson"}
            </button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isRTL ? "مراجعة الإجابات" : "Review Your Answers"}
          </h2>

          <div className="space-y-6">
            {shuffledQuestions.map((q, index) => {
              const result = results[index];
              if (!result) return null;

              const qText = isRTL ? q.questionTextAr : q.questionTextEn;
              const explanation = isRTL ? q.explanationAr : q.explanationEn;

              let userAnswerText = result.userAnswer;
              let correctAnswerText = result.correctAnswer;

              if (q.type === "multiple_choice") {
                const opts = JSON.parse(
                  (isRTL ? q.optionsAr : q.optionsEn) || "[]"
                );
                userAnswerText =
                  opts[parseInt(result.userAnswer)] || result.userAnswer;
                correctAnswerText =
                  opts[parseInt(result.correctAnswer)] || result.correctAnswer;
              } else {
                userAnswerText =
                  result.userAnswer === "true"
                    ? isRTL
                      ? "صح"
                      : "True"
                    : isRTL
                    ? "خطأ"
                    : "False";
                correctAnswerText =
                  result.correctAnswer === "true"
                    ? isRTL
                      ? "صح"
                      : "True"
                    : isRTL
                    ? "خطأ"
                    : "False";
              }

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-xl border-2 ${
                    result.isCorrect
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                      : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        result.isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {result.isCorrect ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <X className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? "السؤال" : "Question"} {index + 1}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {qText}
                      </p>

                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">
                            {isRTL ? "إجابتك:" : "Your Answer:"}
                          </span>{" "}
                          <span
                            className={
                              result.isCorrect
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            }
                          >
                            {userAnswerText}
                          </span>
                        </p>

                        {!result.isCorrect && (
                          <>
                            <p className="text-sm">
                              <span className="font-semibold text-gray-600 dark:text-gray-400">
                                {isRTL ? "الإجابة الصحيحة:" : "Correct Answer:"}
                              </span>{" "}
                              <span className="text-green-700 dark:text-green-400">
                                {correctAnswerText}
                              </span>
                            </p>
                            {explanation && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <span className="font-semibold">
                                  {isRTL ? "التوضيح:" : "Explanation:"}
                                </span>{" "}
                                {explanation}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  const isLastQuestion = currentQuestion === shuffledQuestions.length - 1;
  const canSubmit = answers.every((a) => a !== null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              {isRTL ? "اختبار:" : "Quiz:"} {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{branchName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRTL ? "السؤال" : "Question"} {currentQuestion + 1}{" "}
              {isRTL ? "من" : "of"} {shuffledQuestions.length}
            </p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {answeredCount}/{shuffledQuestions.length}{" "}
              {isRTL ? "مجاب" : "Answered"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 ${
          questionTransition ? "opacity-50 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold shadow-lg">
            {isRTL ? "السؤال" : "Question"} {currentQuestion + 1}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-primary-200 to-transparent dark:from-primary-800" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
          {questionText}
        </h2>

        {/* Multiple Choice Options */}
        {question.type === "multiple_choice" && options && (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const isSelected = answers[currentQuestion] === index.toString();
              const isAnimating = selectedAnimation === index;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index.toString(), index)}
                  className={`group w-full p-5 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected
                      ? "border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
                  } ${isAnimating ? "scale-105" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "border-primary-500 bg-gradient-to-br from-primary-500 to-secondary-500 shadow-md"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-primary-400"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" />
                      )}
                    </div>
                    <span
                      className={`text-lg font-medium transition-colors ${
                        isSelected
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* True/False Options */}
        {question.type === "true_false" && (
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleAnswer("true")}
              className={`group p-8 rounded-2xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                answers[currentQuestion] === "true"
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl"
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg"
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  answers[currentQuestion] === "true"
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
                }`}
              >
                <Check
                  className={`h-8 w-8 transition-colors ${
                    answers[currentQuestion] === "true"
                      ? "text-white"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
              <span
                className={`text-xl font-bold transition-colors ${
                  answers[currentQuestion] === "true"
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400"
                }`}
              >
                {isRTL ? "صح" : "True"}
              </span>
            </button>
            <button
              onClick={() => handleAnswer("false")}
              className={`group p-8 rounded-2xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
                answers[currentQuestion] === "false"
                  ? "border-red-500 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 shadow-xl"
                  : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg"
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  answers[currentQuestion] === "false"
                    ? "bg-gradient-to-br from-red-500 to-rose-500 shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/30"
                }`}
              >
                <X
                  className={`h-8 w-8 transition-colors ${
                    answers[currentQuestion] === "false"
                      ? "text-white"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <span
                className={`text-xl font-bold transition-colors ${
                  answers[currentQuestion] === "false"
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400"
                }`}
              >
                {isRTL ? "خطأ" : "False"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>{isRTL ? "السابق" : "Previous"}</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={submitQuiz}
            disabled={!canSubmit || isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>
              {isSubmitting
                ? isRTL
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : isRTL
                ? "إرسال الاختبار"
                : "Submit Quiz"}
            </span>
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>{isRTL ? "التالي" : "Next"}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Question Dots */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {isRTL ? "التنقل السريع" : "Quick Navigation"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {shuffledQuestions.map((_, index) => {
            const isAnswered = answers[index] !== null;
            const isCurrent = index === currentQuestion;

            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`relative w-12 h-12 rounded-xl font-bold transition-all duration-300 transform ${
                  isCurrent
                    ? "bg-gradient-to-br from-primary-600 to-secondary-600 text-white scale-110 shadow-xl ring-4 ring-primary-200 dark:ring-primary-900"
                    : isAnswered
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md hover:scale-110"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:scale-110 hover:border-primary-400"
                }`}
              >
                {index + 1}
                {isAnswered && !isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge Notification */}
      {showBadgeNotification && (
        <BadgeNotification
          badges={newBadges}
          locale={locale}
          onClose={() => setShowBadgeNotification(false)}
        />
      )}

      {/* Level Unlock Modal */}
      {unlockedLevelId && (
        <LevelUnlockModal
          isOpen={showLevelUnlock}
          onClose={() => setShowLevelUnlock(false)}
          nextLevelId={unlockedLevelId}
          locale={locale}
        />
      )}
    </div>
  );
}
