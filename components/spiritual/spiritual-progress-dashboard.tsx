"use client";

import { useState, useEffect } from "react";
import { SpiritualProgressTracker } from "./spiritual-progress-tracker";
import { SpiritualProgressStats } from "./spiritual-progress-stats";
import { SpiritualProgressCalendar } from "./spiritual-progress-calendar";
import { Loader2 } from "lucide-react";

type SpiritualProgressDashboardProps = {
  userId: string;
  locale: string;
};

export function SpiritualProgressDashboard({
  userId,
  locale,
}: SpiritualProgressDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isRTL = locale === "ar";

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      // Load last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch(
        `/api/spiritual-progress?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setProgress(data.progress || []);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = () => {
    loadProgress();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isRTL ? "تتبع اليوم" : "Today's Tracker"}
        </h2>
        <SpiritualProgressTracker
          userId={userId}
          locale={locale}
          date={selectedDate}
          onUpdate={handleProgressUpdate}
        />
      </div>

      {/* Statistics */}
      <SpiritualProgressStats progress={progress} locale={locale} />

      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isRTL ? "التقويم" : "Calendar"}
        </h2>
        <SpiritualProgressCalendar
          progress={progress}
          locale={locale}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
    </div>
  );
}

