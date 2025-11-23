"use client";

import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Network,
  StickyNote,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";
import { ActionItems } from "./action-items";
import { LessonNotes } from "./lesson-notes";
import { MindMapViewer } from "./mind-map-viewer";
import { VideoTimestamps } from "./video-timestamps";

type Lesson = {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  videoUrlsAr: string | null;
  videoUrlsEn: string | null;
  pdfUrlAr: string | null;
  pdfUrlEn: string | null;
  mindmapData: string | null;
  actionItemsAr: string | null;
  actionItemsEn: string | null;
  duration: number;
  branch: {
    id: number;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  level: {
    id: number;
    nameAr: string;
    nameEn: string;
  };
  questions: Array<{
    id: number;
    questionTextAr: string;
    questionTextEn: string;
    type: string;
    optionsAr: string | null;
    optionsEn: string | null;
    correctAnswer: string;
    explanationAr: string | null;
    explanationEn: string | null;
  }>;
};

type UserProgress = {
  completed: boolean;
  markedAsRead: boolean;
  score: number | null;
} | null;

type LessonViewerProps = {
  lesson: Lesson;
  userProgress: UserProgress;
  previousLessonId: number | undefined;
  nextLessonId: number | undefined;
  locale: string;
  userId: string;
};

export function LessonViewer({
  lesson,
  userProgress,
  previousLessonId,
  nextLessonId,
  locale,
  userId,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<
    "content" | "pdf" | "mindmap" | "notes" | "actions" | "quiz"
  >("content");
  const [markedAsRead, setMarkedAsRead] = useState(
    userProgress?.markedAsRead || false
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const isRTL = locale === "ar";
  const t = useTranslations("lesson");

  const title = isRTL ? lesson.titleAr : lesson.titleEn;
  const description = isRTL ? lesson.descriptionAr : lesson.descriptionEn;
  const videoUrlsJson = isRTL ? lesson.videoUrlsAr : lesson.videoUrlsEn;
  const pdfUrl = isRTL ? lesson.pdfUrlAr : lesson.pdfUrlEn;
  const actionItemsJson = isRTL ? lesson.actionItemsAr : lesson.actionItemsEn;
  const branchName = isRTL ? lesson.branch.nameAr : lesson.branch.nameEn;
  const levelName = isRTL ? lesson.level.nameAr : lesson.level.nameEn;

  // Parse video URLs from JSON
  const videoUrls: string[] = videoUrlsJson ? JSON.parse(videoUrlsJson) : [];

  // Parse action items from JSON
  const actionItems: any[] = actionItemsJson ? JSON.parse(actionItemsJson) : [];

  const handleMarkAsRead = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/lesson/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          markedAsRead: checked,
        }),
      });

      if (response.ok) {
        setMarkedAsRead(checked);
      } else {
        console.error("Failed to update lesson status");
      }
    } catch (error) {
      console.error("Error updating lesson status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Load bookmark status
  const loadBookmarkStatus = async () => {
    try {
      const response = await fetch(
        `/api/lesson/bookmarks?lessonId=${lesson.id}`
      );
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error("Error loading bookmark status:", error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = async () => {
    setIsBookmarking(true);
    try {
      const response = await fetch("/api/lesson/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Load bookmark status on mount - using React useEffect
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    loadBookmarkStatus();
  }, [lesson.id]);

  const tabs = [
    {
      id: "content" as const,
      label: isRTL ? "الفيديوهات" : "Videos",
      icon: BookOpen,
      disabled: videoUrls.length === 0,
    },
    {
      id: "pdf" as const,
      label: isRTL ? "PDF" : "PDF",
      icon: FileText,
      disabled: !pdfUrl,
    },
    {
      id: "mindmap" as const,
      label: isRTL ? "الخريطة الذهنية" : "Mind Map",
      icon: Network,
      disabled: !lesson.mindmapData,
    },
    {
      id: "notes" as const,
      label: isRTL ? "ملاحظاتي" : "My Notes",
      icon: StickyNote,
      disabled: false,
    },
    {
      id: "actions" as const,
      label: isRTL ? "المهام العملية" : "Action Items",
      icon: CheckCircle,
      disabled: !actionItems || actionItems.length === 0,
    },
    {
      id: "quiz" as const,
      label: isRTL ? "الاختبار" : "Quiz",
      icon: FileText,
      disabled: lesson.questions.length === 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link
          href={`/${locale}/dashboard`}
          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {isRTL ? "لوحة التحكم" : "Dashboard"}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/${locale}/branch/${lesson.branch.slug}`}
          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {branchName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white font-semibold">
          {title}
        </span>
      </nav>

      {/* Lesson Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold">
                {levelName}
              </span>
              <span className="px-3 py-1 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 text-sm font-semibold">
                {branchName}
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {lesson.duration} {isRTL ? "دقيقة" : "minutes"}
                </span>
              </div>
              {userProgress?.completed && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <span className="font-semibold">
                    {isRTL ? "مكتمل" : "Completed"}
                  </span>
                  {userProgress.score !== null && (
                    <span>({userProgress.score}%)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              disabled={isBookmarking}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isBookmarked
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={
                isRTL
                  ? isBookmarked
                    ? "إزالة من المحفوظات"
                    : "حفظ الدرس"
                  : isBookmarked
                  ? "Remove bookmark"
                  : "Bookmark lesson"
              }
            >
              <svg
                className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span className="hidden sm:inline">
                {isRTL
                  ? isBookmarked
                    ? "محفوظ"
                    : "حفظ"
                  : isBookmarked
                  ? "Saved"
                  : "Save"}
              </span>
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isRTL ? "تحميل PDF" : "Download PDF"}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
                    : tab.disabled
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Description */}
              {description && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Video Players */}
              {videoUrls.length > 0 ? (
                <div className="space-y-6">
                  {videoUrls.map((videoUrl, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {isRTL ? "الفيديو" : "Video"} {index + 1}
                        </h3>
                      </div>
                      <div className="relative aspect-video bg-black">
                        <iframe
                          src={videoUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`${title} - Video ${index + 1}`}
                        />
                      </div>

                      {/* Video Timestamps */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                        <VideoTimestamps
                          lessonId={lesson.id}
                          videoIndex={index}
                          locale={locale}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isRTL
                      ? "لا توجد فيديوهات متاحة لهذا الدرس"
                      : "No videos available for this lesson"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "pdf" && pdfUrl && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isRTL
                  ? "عارض PDF سيتم إضافته قريباً"
                  : "PDF viewer coming soon"}
              </p>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Download className="h-5 w-5" />
                <span>{isRTL ? "تحميل PDF" : "Download PDF"}</span>
              </a>
            </div>
          )}

          {activeTab === "mindmap" && lesson.mindmapData && (
            <MindMapViewer
              data={JSON.parse(lesson.mindmapData)}
              locale={locale}
            />
          )}

          {activeTab === "mindmap" && !lesson.mindmapData && (
            <div className="text-center py-12">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL
                  ? "لا توجد خريطة ذهنية متاحة لهذا الدرس"
                  : "No mind map available for this lesson"}
              </p>
            </div>
          )}

          {activeTab === "notes" && (
            <LessonNotes lessonId={lesson.id} locale={locale} />
          )}

          {activeTab === "actions" && (
            <ActionItems
              lessonId={lesson.id}
              actionItems={actionItems}
              locale={locale}
            />
          )}

          {activeTab === "quiz" && lesson.questions.length > 0 && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {isRTL ? "جاهز للاختبار؟" : "Ready for the Quiz?"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {isRTL
                    ? `اختبر معرفتك مع ${lesson.questions.length} سؤال. تحتاج إلى 60% للنجاح.`
                    : `Test your knowledge with ${lesson.questions.length} questions. You need 60% to pass.`}
                </p>

                {!markedAsRead && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      {t("readRequired")}
                    </p>
                  </div>
                )}

                <Link
                  href={markedAsRead ? `/${locale}/quiz/${lesson.id}` : "#"}
                >
                  <button
                    disabled={!markedAsRead}
                    className={`px-8 py-4 rounded-xl text-white text-lg font-bold shadow-xl transition-all duration-300 ${
                      markedAsRead
                        ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-primary-500/50 hover:scale-105 cursor-pointer"
                        : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isRTL ? "ابدأ الاختبار" : "Start Quiz"}
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Completion Checkbox */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={markedAsRead}
            onChange={(e) => handleMarkAsRead(e.target.checked)}
            disabled={isUpdating}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
          />
          <span className="flex-1 text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t("markAsRead")}
          </span>
          {markedAsRead && (
            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("markedAsRead")}
            </span>
          )}
        </label>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4">
        {previousLessonId ? (
          <Link
            href={`/${locale}/lesson/${previousLessonId}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{isRTL ? "الدرس السابق" : "Previous Lesson"}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextLessonId ? (
          <Link
            href={`/${locale}/lesson/${nextLessonId}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>{isRTL ? "الدرس التالي" : "Next Lesson"}</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            href={`/${locale}/branch/${lesson.branch.slug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <span>{isRTL ? "العودة إلى الفرع" : "Back to Branch"}</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}
