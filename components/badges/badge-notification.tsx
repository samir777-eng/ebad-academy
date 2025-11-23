"use client";

import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";

type Badge = {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
};

type BadgeNotificationProps = {
  badges: Badge[];
  locale: string;
  onClose: () => void;
};

export function BadgeNotification({
  badges,
  locale,
  onClose,
}: BadgeNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRTL = locale === "ar";

  useEffect(() => {
    if (badges.length > 0) {
      setVisible(true);
    }
  }, [badges]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setVisible(true);
      } else {
        onClose();
      }
    }, 300);
  };

  if (badges.length === 0 || !visible) return null;

  const badge = badges[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl animate-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Badge Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-lg animate-bounce">
              {badge.icon}
            </div>
          </div>
        </div>

        {/* Congratulations Text */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isRTL ? "تهانينا!" : "Congratulations!"}
            </h2>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "لقد حصلت على شارة جديدة!" : "You've earned a new badge!"}
          </p>
        </div>

        {/* Badge Details */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {isRTL ? badge.nameAr : badge.nameEn}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-center text-sm">
            {isRTL ? badge.descriptionAr : badge.descriptionEn}
          </p>
        </div>

        {/* Progress Indicator */}
        {badges.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {badges.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-yellow-500"
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          {currentIndex < badges.length - 1
            ? isRTL
              ? "التالي"
              : "Next"
            : isRTL
            ? "رائع!"
            : "Awesome!"}
        </button>
      </div>
    </div>
  );
}

