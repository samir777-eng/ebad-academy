"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    );
  }

  const isDark = actualTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative h-10 w-20 rounded-full transition-all duration-300 hover:scale-105 ${
        isDark
          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding Circle with Icon */}
      <div
        className={`absolute top-1 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 ease-in-out ${
          isDark ? "ltr:left-11 rtl:left-1" : "ltr:left-1 rtl:left-11"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-indigo-600" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </div>
    </button>
  );
}
