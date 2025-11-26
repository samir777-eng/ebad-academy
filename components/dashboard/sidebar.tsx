"use client";

import { cn } from "@/lib/utils";
import {
  Bookmark,
  GraduationCap,
  Heart,
  Home,
  Layers,
  Settings,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: Home,
    color: "from-cyan-500 to-blue-500",
  },
  {
    key: "myLevels",
    href: "/dashboard/levels",
    icon: Layers,
    color: "from-purple-500 to-pink-500",
  },
  {
    key: "spiritualProgress",
    href: "/spiritual-progress",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
  },
  {
    key: "leaderboard",
    href: "/leaderboard",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
  },
  {
    key: "achievements",
    href: "/achievements",
    icon: Trophy,
    color: "from-yellow-500 to-amber-500",
  },
  {
    key: "bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
    color: "from-amber-500 to-yellow-500",
  },
  {
    key: "profile",
    href: "/profile",
    icon: Settings,
    color: "from-slate-500 to-gray-500",
  },
];

export function DashboardSidebar({
  locale,
  isRTL,
  isAdmin,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  locale: string;
  isRTL: boolean;
  isAdmin?: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  // Collapse state for desktop (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Save collapse state to localStorage and notify layout
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
    // Dispatch custom event to notify layout component
    window.dispatchEvent(new Event("sidebar-collapse-change"));
  };

  return (
    <aside
      className={cn(
        "fixed top-0 z-40 h-screen bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300",
        isRTL ? "right-0 border-l" : "left-0 border-r",
        // Width changes based on collapse state (desktop only)
        isCollapsed ? "lg:w-20" : "lg:w-64",
        "w-64", // Always full width on mobile
        // Mobile: slide in/out, Desktop: always visible
        isSidebarOpen
          ? "translate-x-0"
          : isRTL
          ? "translate-x-full lg:translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo - Clean and Professional */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link
            href={`/${locale}/dashboard`}
            className={cn(
              "flex items-center gap-3 group",
              isCollapsed && "lg:justify-center"
            )}
          >
            {/* Icon Container with hover animation */}
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {locale === "ar" ? "أكاديمية عباد" : "Ebad Academy"}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {locale === "ar" ? "رحلة التعلم" : "Learning Journey"}
                </div>
              </div>
            )}
          </Link>

          {/* Collapse Button - Desktop Only */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={
              isCollapsed
                ? locale === "ar"
                  ? "توسيع"
                  : "Expand"
                : locale === "ar"
                ? "طي"
                : "Collapse"
            }
            title={
              isCollapsed
                ? locale === "ar"
                  ? "توسيع الشريط الجانبي"
                  : "Expand sidebar"
                : locale === "ar"
                ? "طي الشريط الجانبي"
                : "Collapse sidebar"
            }
          >
            {isRTL ? (
              isCollapsed ? (
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )
            ) : isCollapsed ? (
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation - Clean and Professional */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === `/${locale}${item.href}`;

            return (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className="block"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 group/item",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1",
                    isCollapsed && "lg:justify-center lg:px-2"
                  )}
                  title={isCollapsed ? t(item.key) : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform",
                      !isActive && "group-hover/item:scale-110"
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm">{t(item.key)}</span>
                      {isActive && (
                        <div
                          className={`ml-auto h-2 w-2 rounded-full bg-gradient-to-r ${item.color} animate-pulse`}
                        ></div>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Admin Link */}
        {isAdmin && (
          <div className="px-4 pb-4">
            <Link
              href={`/${locale}/admin`}
              className="block bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl px-4 py-3 font-medium text-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>{locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
              </div>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
            © 2024 {locale === "ar" ? "أكاديمية عباد" : "Ebad Academy"}
          </div>
        </div>
      </div>
    </aside>
  );
}
