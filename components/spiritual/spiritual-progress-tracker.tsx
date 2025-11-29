"use client";

import {
  DollarSign,
  Heart,
  Loader2,
  MessageCircle,
  Moon,
  Save,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { useEffect, useState } from "react";

type SpiritualProgressTrackerProps = {
  userId: string;
  locale: string;
  date: Date;
  onUpdate: () => void;
};

export function SpiritualProgressTracker({
  userId: _userId,
  locale,
  date,
  onUpdate,
}: SpiritualProgressTrackerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    quranPages: 0,
    quranMinutes: 0,
    fasting: false,
    charity: false,
    charityAmount: 0,
    dhikr: false,
    dhikrCount: 0,
    dua: false,
    notes: "",
  });

  const isRTL = locale === "ar";

  useEffect(() => {
    loadTodayProgress();
  }, [date]);

  const loadTodayProgress = async () => {
    try {
      setIsLoading(true);
      const dateStr = date.toISOString().split("T")[0];
      const response = await fetch(
        `/api/spiritual-progress?startDate=${dateStr}&endDate=${dateStr}`
      );
      const result = await response.json();
      if (result.progress && result.progress.length > 0) {
        const todayData = result.progress[0];
        setData({
          fajr: todayData.fajr,
          dhuhr: todayData.dhuhr,
          asr: todayData.asr,
          maghrib: todayData.maghrib,
          isha: todayData.isha,
          quranPages: todayData.quranPages,
          quranMinutes: todayData.quranMinutes,
          fasting: todayData.fasting,
          charity: todayData.charity,
          charityAmount: todayData.charityAmount,
          dhikr: todayData.dhikr,
          dhikrCount: todayData.dhikrCount,
          dua: todayData.dua,
          notes: todayData.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading today's progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/spiritual-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date.toISOString(),
          ...data,
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        console.error("Failed to save progress");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePrayer = (prayer: keyof typeof data) => {
    setData({ ...data, [prayer]: !data[prayer] });
  };

  const updateField = (field: keyof typeof data, value: any) => {
    setData({ ...data, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const prayers = [
    { key: "fajr", label: isRTL ? "الفجر" : "Fajr", icon: Sunrise },
    { key: "dhuhr", label: isRTL ? "الظهر" : "Dhuhr", icon: Sun },
    { key: "asr", label: isRTL ? "العصر" : "Asr", icon: Sun },
    { key: "maghrib", label: isRTL ? "المغرب" : "Maghrib", icon: Sunset },
    { key: "isha", label: isRTL ? "العشاء" : "Isha", icon: Moon },
  ];

  return (
    <div className="space-y-6">
      {/* Prayers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isRTL ? "الصلوات الخمس" : "Five Daily Prayers"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {prayers.map((prayer) => {
            const Icon = prayer.icon;
            const isCompleted = data[prayer.key as keyof typeof data];
            return (
              <button
                key={prayer.key}
                onClick={() => togglePrayer(prayer.key as keyof typeof data)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-500"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isCompleted
                      ? "text-green-700 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {prayer.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quran */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isRTL ? "قراءة القرآن" : "Quran Recitation"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "عدد الصفحات" : "Pages Read"}
            </label>
            <input
              type="number"
              min="0"
              value={data.quranPages}
              onChange={(e) =>
                updateField("quranPages", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "الدقائق" : "Minutes"}
            </label>
            <input
              type="number"
              min="0"
              value={data.quranMinutes}
              onChange={(e) =>
                updateField("quranMinutes", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Other Acts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isRTL ? "أعمال أخرى" : "Other Acts"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => togglePrayer("fasting")}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.fasting
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <Heart
              className={`w-6 h-6 mx-auto mb-2 ${
                data.fasting ? "text-purple-600" : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium">{isRTL ? "صيام" : "Fasting"}</p>
          </button>

          <button
            onClick={() => togglePrayer("charity")}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.charity
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <DollarSign
              className={`w-6 h-6 mx-auto mb-2 ${
                data.charity ? "text-yellow-600" : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium">{isRTL ? "صدقة" : "Charity"}</p>
          </button>

          <button
            onClick={() => togglePrayer("dhikr")}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.dhikr
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <Sparkles
              className={`w-6 h-6 mx-auto mb-2 ${
                data.dhikr ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium">{isRTL ? "ذكر" : "Dhikr"}</p>
          </button>

          <button
            onClick={() => togglePrayer("dua")}
            className={`p-4 rounded-xl border-2 transition-all ${
              data.dua
                ? "bg-pink-50 dark:bg-pink-900/20 border-pink-500"
                : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            }`}
          >
            <MessageCircle
              className={`w-6 h-6 mx-auto mb-2 ${
                data.dua ? "text-pink-600" : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium">{isRTL ? "دعاء" : "Dua"}</p>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isRTL ? "ملاحظات" : "Notes"}
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder={
            isRTL
              ? "تأملات، دروس مستفادة، أهداف..."
              : "Reflections, lessons learned, goals..."
          }
          dir={isRTL ? "rtl" : "ltr"}
          className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={saveProgress}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        <span>{isRTL ? "حفظ التقدم" : "Save Progress"}</span>
      </button>
    </div>
  );
}
