"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Globe, LogOut, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function DashboardHeader({
  locale,
  onMenuClick,
}: {
  locale: string;
  onMenuClick?: () => void;
}) {
  const t = useTranslations("dashboard");
  const { data: session } = useSession();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const currentPath = window.location.pathname.replace(`/${locale}`, "");
    router.push(`/${newLocale}${currentPath}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push(`/${locale}/login`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 sm:px-8 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>

        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            {t("welcome")}
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {session?.user?.name || (locale === "ar" ? "طالب" : "Student")}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200 group"
        >
          <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">
            {locale === "ar" ? "EN" : "AR"}
          </span>
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:scale-105 transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 group-hover:-rotate-12 transition-transform" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
