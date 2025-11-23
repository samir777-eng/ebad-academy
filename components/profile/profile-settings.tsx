"use client";

import { useTheme } from "@/components/theme-provider";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Globe,
  Lock,
  Mail,
  Palette,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    languagePref: string;
  };
  stats: {
    memberSince: Date;
    totalLessonsCompleted: number;
    totalQuizzesTaken: number;
    averageScore: number;
    currentLevel: string;
    badgesEarned: number;
  };
  badges: {
    id: number;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    iconUrl: string;
    earnedAt: Date;
  }[];
  locale: string;
}

export function ProfileSettings({
  user,
  stats,
  badges,
  locale,
}: ProfileSettingsProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isRTL = locale === "ar";

  // Personal Info State
  const [name, setName] = useState(user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState(user.languagePref);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setProfileMessage(t("personalInfo.success"));
        setTimeout(() => setProfileMessage(""), 3000);
      } else {
        setProfileMessage(t("personalInfo.error"));
      }
    } catch (error) {
      setProfileMessage(t("personalInfo.error"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t("security.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(t("security.passwordTooShort"));
      return;
    }

    setSavingPassword(true);
    setPasswordMessage("");

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setPasswordMessage(t("security.success"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMessage(""), 3000);
      } else {
        setPasswordMessage(t("security.error"));
      }
    } catch (error) {
      setPasswordMessage(t("security.error"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLanguage(newLang);

    // Update language preference in database
    await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languagePref: newLang }),
    });

    // Redirect to new language
    const currentPath = window.location.pathname.replace(`/${locale}`, "");
    router.push(`/${newLang}${currentPath}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("personalInfo.title")}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("personalInfo.name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("personalInfo.email")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("personalInfo.emailNote")}
              </p>
            </div>

            {profileMessage && (
              <div
                className={`p-3 rounded-lg ${
                  profileMessage.includes("success")
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                }`}
              >
                {profileMessage}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || name === user.name}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {savingProfile
                ? t("personalInfo.saving")
                : t("personalInfo.save")}
            </button>
          </div>
        </div>

        {/* Security - Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("security.title")}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("security.currentPassword")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("security.newPassword")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("security.confirmPassword")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded-lg ${
                  passwordMessage.includes("success")
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {savingPassword
                ? t("security.updating")
                : t("security.updatePassword")}
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("preferences.title")}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Globe className="inline h-4 w-4 mr-2" />
                {t("preferences.language")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLanguageChange("ar")}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedLanguage === "ar"
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t("preferences.languageArabic")}
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedLanguage === "en"
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t("preferences.languageEnglish")}
                </button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Palette className="inline h-4 w-4 mr-2" />
                {t("preferences.theme")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    theme === "light"
                      ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t("preferences.themeLight")}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t("preferences.themeDark")}
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    theme === "system"
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t("preferences.themeSystem")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("statistics.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.memberSince")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDate(stats.memberSince)}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.totalLessons")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalLessonsCompleted}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.totalQuizzes")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalQuizzesTaken}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.averageScore")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.averageScore}%
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.currentLevel")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.currentLevel}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("statistics.badges")}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.badgesEarned}
              </p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isRTL ? "الإنجازات" : "Achievements"}
            </h2>
          </div>

          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{badge.iconUrl}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {locale === "ar" ? badge.nameAr : badge.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {locale === "ar"
                          ? badge.descriptionAr
                          : badge.descriptionEn}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {isRTL ? "تم الحصول عليها في: " : "Earned on: "}
                        {new Date(badge.earnedAt).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {isRTL
                  ? "لم تحصل على أي إنجازات بعد"
                  : "No achievements earned yet"}
              </p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl border-2 border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-200">
              {t("dangerZone.title")}
            </h2>
          </div>

          <p className="text-red-700 dark:text-red-300 mb-4">
            {t("dangerZone.deleteWarning")}
          </p>

          <button
            onClick={() => {
              if (confirm(t("dangerZone.deleteConfirm"))) {
                // Handle account deletion
                fetch("/api/profile/delete", { method: "DELETE" })
                  .then(() => router.push(`/${locale}/`))
                  .catch(console.error);
              }
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
          >
            {t("dangerZone.deleteButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
