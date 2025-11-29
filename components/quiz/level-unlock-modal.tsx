"use client";

import {
  ArrowRight,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LevelUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextLevelId: number;
  locale: string;
}

export function LevelUnlockModal({
  isOpen,
  onClose,
  nextLevelId,
  locale,
}: LevelUnlockModalProps) {
  const t = useTranslations("quiz");
  const router = useRouter();

  // Generate confetti particles once on mount
  const [confettiParticles] = useState(() => {
    const colors = [
      "#fbbf24",
      "#f59e0b",
      "#06b6d4",
      "#14b8a6",
      "#3b82f6",
      "#8b5cf6",
    ];

    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 20,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  });

  if (!isOpen) return null;

  const handleGoToLevels = () => {
    onClose();
    router.push(`/${locale}/dashboard/levels`);
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto transform transition-all animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Celebration Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Animated Trophy */}
              <div className="p-6 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full shadow-2xl animate-bounce">
                <Trophy className="h-16 w-16 text-white" />
              </div>

              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 animate-pulse">
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-pulse delay-75">
                <Star className="h-6 w-6 text-amber-400" />
              </div>
              <div className="absolute top-0 -left-4 animate-pulse delay-150">
                <PartyPopper className="h-7 w-7 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            {t("levelUnlocked.title")}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-300 mb-2">
            {t("levelUnlocked.congratulations")}
          </p>
          <p className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("levelUnlocked.levelNumber", { level: nextLevelId })}
          </p>

          {/* Description */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-4 mb-6 border border-primary-200 dark:border-primary-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              {t("levelUnlocked.description")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToLevels}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              {t("levelUnlocked.viewLevels")}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              {t("levelUnlocked.backToDashboard")}
            </button>
          </div>
        </div>
      </div>

      {/* Confetti Effect (CSS-based) */}
      {isOpen && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-confetti"
              style={{
                left: `${particle.left}%`,
                top: `-${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particle.color,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
