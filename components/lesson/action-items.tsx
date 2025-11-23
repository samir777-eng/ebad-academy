"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Target, Loader2 } from "lucide-react";

type ActionItem = {
  text: string;
  category?: string;
};

type ActionItemsProps = {
  lessonId: number;
  actionItems: ActionItem[];
  locale: string;
};

export function ActionItems({
  lessonId,
  actionItems,
  locale,
}: ActionItemsProps) {
  const [completions, setCompletions] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const isRTL = locale === "ar";

  useEffect(() => {
    loadCompletions();
  }, [lessonId]);

  const loadCompletions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/lesson/action-items?lessonId=${lessonId}`
      );
      const data = await response.json();

      const completionMap: Record<number, boolean> = {};
      data.completions?.forEach((c: any) => {
        completionMap[c.itemIndex] = c.completed;
      });
      setCompletions(completionMap);
    } catch (error) {
      console.error("Error loading completions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompletion = async (itemIndex: number) => {
    try {
      setIsSaving(itemIndex);
      const newCompleted = !completions[itemIndex];

      const response = await fetch("/api/lesson/action-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          itemIndex,
          completed: newCompleted,
        }),
      });

      if (response.ok) {
        setCompletions({
          ...completions,
          [itemIndex]: newCompleted,
        });
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!actionItems || actionItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">
          {isRTL
            ? "لا توجد مهام عملية لهذا الدرس"
            : "No action items for this lesson"}
        </p>
      </div>
    );
  }

  const completedCount = Object.values(completions).filter(Boolean).length;
  const totalCount = actionItems.length;
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-8 h-8" />
          <h2 className="text-2xl font-bold">
            {isRTL ? "المهام العملية" : "Action Items"}
          </h2>
        </div>
        <p className="text-white/90 mb-4">
          {isRTL
            ? "طبّق ما تعلمته في حياتك اليومية"
            : "Apply what you learned in your daily life"}
        </p>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-white/80 mt-2">
          {completedCount} / {totalCount}{" "}
          {isRTL ? "مكتملة" : "completed"}
        </p>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {actionItems.map((item, index) => {
          const isCompleted = completions[index] || false;
          const isSavingThis = isSaving === index;

          return (
            <button
              key={index}
              onClick={() => toggleCompletion(index)}
              disabled={isSavingThis}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-500"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="flex items-start gap-3">
                {isSavingThis ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 flex-shrink-0 mt-0.5" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`flex-1 ${
                    isCompleted
                      ? "text-green-700 dark:text-green-300 line-through"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

