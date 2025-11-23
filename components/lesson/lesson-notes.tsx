"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

type LessonNotesProps = {
  lessonId: number;
  locale: string;
};

export function LessonNotes({ lessonId, locale }: LessonNotesProps) {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isRTL = locale === "ar";

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [lessonId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/lesson/notes?lessonId=${lessonId}`
      );
      const data = await response.json();
      setNotes(data.notes || "");
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/lesson/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          content: notes,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      } else {
        console.error("Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes && !isLoading) {
        saveNotes();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [notes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isRTL ? "ملاحظاتي" : "My Notes"}
        </h3>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isRTL ? "آخر حفظ: " : "Last saved: "}
              {lastSaved.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={saveNotes}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isRTL ? "حفظ" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Notes Textarea */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={
          isRTL
            ? "اكتب ملاحظاتك هنا... سيتم الحفظ تلقائياً"
            : "Write your notes here... Auto-saves after 2 seconds"
        }
        dir={isRTL ? "rtl" : "ltr"}
        className="w-full h-96 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />

      {/* Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {isRTL
            ? "💡 نصيحة: ملاحظاتك خاصة بك فقط ويتم حفظها تلقائياً كل ثانيتين"
            : "💡 Tip: Your notes are private and auto-save every 2 seconds"}
        </p>
      </div>
    </div>
  );
}

