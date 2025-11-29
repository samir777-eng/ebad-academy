"use client";

import { Clock, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Timestamp = {
  id: number;
  videoIndex: number;
  timestamp: number;
  label: string;
  createdAt: string;
};

type VideoTimestampsProps = {
  lessonId: number;
  videoIndex: number;
  locale: string;
  onJumpToTime?: (seconds: number) => void;
};

export function VideoTimestamps({
  lessonId,
  videoIndex,
  locale,
  onJumpToTime,
}: VideoTimestampsProps) {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState("");
  const isRTL = locale === "ar";

  useEffect(() => {
    loadTimestamps();
  }, [lessonId]);

  const loadTimestamps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/lesson/timestamps?lessonId=${lessonId}`
      );
      const data = await response.json();

      // Check if timestamps exist and is an array
      if (data && Array.isArray(data.timestamps)) {
        const filtered = data.timestamps.filter(
          (t: Timestamp) => t.videoIndex === videoIndex
        );
        setTimestamps(filtered);
      } else {
        // No timestamps available
        setTimestamps([]);
      }
    } catch (error) {
      console.error("Error loading timestamps:", error);
      setTimestamps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTimestamp = async () => {
    if (!newLabel.trim() || !newTime.trim()) return;

    // Parse time (supports formats like "1:30", "90", "1:30:45")
    const seconds = parseTimeToSeconds(newTime);
    if (seconds === null) {
      alert(isRTL ? "صيغة الوقت غير صحيحة" : "Invalid time format");
      return;
    }

    try {
      const response = await fetch("/api/lesson/timestamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          videoIndex,
          timestamp: seconds,
          label: newLabel,
        }),
      });

      if (response.ok) {
        setNewLabel("");
        setNewTime("");
        setIsAdding(false);
        loadTimestamps();
      }
    } catch (error) {
      console.error("Error adding timestamp:", error);
    }
  };

  const deleteTimestamp = async (id: number) => {
    try {
      const response = await fetch(`/api/lesson/timestamps?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadTimestamps();
      }
    } catch (error) {
      console.error("Error deleting timestamp:", error);
    }
  };

  const parseTimeToSeconds = (time: string): number | null => {
    const parts = time.split(":").map((p) => parseInt(p));
    if (parts.some(isNaN)) return null;

    if (parts.length === 1 && parts[0] !== undefined) return parts[0]; // seconds only
    if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined)
      return parts[0] * 60 + parts[1]; // mm:ss
    if (
      parts.length === 3 &&
      parts[0] !== undefined &&
      parts[1] !== undefined &&
      parts[2] !== undefined
    )
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    return null;
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          {isRTL ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isRTL ? "العلامات الزمنية" : "Timestamps"}
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          {isRTL ? "إضافة" : "Add"}
        </button>
      </div>

      {/* Add Timestamp Form */}
      {isAdding && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={
              isRTL ? "التسمية (مثال: مقدمة)" : "Label (e.g., Introduction)"
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            dir={isRTL ? "rtl" : "ltr"}
          />
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder={
              isRTL ? "الوقت (مثال: 1:30 أو 90)" : "Time (e.g., 1:30 or 90)"
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={addTimestamp}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {isRTL ? "حفظ" : "Save"}
          </button>
        </div>
      )}

      {/* Timestamps List */}
      {timestamps.length > 0 ? (
        <div className="space-y-2">
          {timestamps.map((ts) => (
            <div
              key={ts.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => onJumpToTime?.(ts.timestamp)}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                  title={isRTL ? "الانتقال إلى هذا الوقت" : "Jump to this time"}
                >
                  <Play className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {formatTime(ts.timestamp)}
                  </span>
                </button>
                <span className="text-gray-900 dark:text-white">
                  {ts.label}
                </span>
              </div>
              <button
                onClick={() => deleteTimestamp(ts.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
                title={isRTL ? "حذف" : "Delete"}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isRTL
              ? "لا توجد علامات زمنية بعد. أضف علامة للانتقال السريع!"
              : "No timestamps yet. Add one for quick navigation!"}
          </p>
        </div>
      )}
    </div>
  );
}
