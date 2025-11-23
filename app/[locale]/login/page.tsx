"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's a rate limit error (case-insensitive)
        const errorLower = result.error.toLowerCase();
        if (
          errorLower.includes("rate") ||
          errorLower.includes("too many") ||
          errorLower.includes("try again later") ||
          errorLower.includes("429")
        ) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError(t("error"));
        }
      } else if (result?.ok) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      } else {
        // No error but not ok - might be rate limited
        setError(t("error"));
      }
    } catch (error: any) {
      // Check if the error is a rate limit error
      const errorMsg = error?.message || String(error);
      if (
        errorMsg.toLowerCase().includes("rate") ||
        errorMsg.toLowerCase().includes("too many") ||
        errorMsg.toLowerCase().includes("429")
      ) {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(t("error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white dark:from-dark-bg dark:to-dark-card px-4 py-8">
      {/* Top Right Controls */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        {/* Language Toggle */}
        <Link
          href={locale === "ar" ? "/en/login" : "/ar/login"}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600 dark:text-primary-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {locale === "ar" ? "EN" : "AR"}
          </span>
        </Link>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-dark-card rounded-full shadow-lg p-1">
          {typeof window !== "undefined" && (
            <button
              onClick={() => {
                const html = document.documentElement;
                const isDark = html.classList.contains("dark");
                if (isDark) {
                  html.classList.remove("dark");
                  localStorage.setItem("ebad-academy-theme", "light");
                } else {
                  html.classList.add("dark");
                  localStorage.setItem("ebad-academy-theme", "dark");
                }
              }}
              className={`relative h-10 w-20 rounded-full transition-all duration-300 hover:scale-105 ${
                typeof window !== "undefined" &&
                document.documentElement.classList.contains("dark")
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                  : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400"
              }`}
            >
              <div
                className={`absolute top-1 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 ease-in-out ${
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "ltr:left-11 rtl:left-1"
                    : "ltr:left-1 rtl:left-11"
                }`}
              >
                {typeof window !== "undefined" &&
                document.documentElement.classList.contains("dark") ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-600"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-500"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400">
            {t("title")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white"
                placeholder={t("email")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-bg dark:text-white"
                  placeholder={t("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg"
            size="lg"
          >
            {loading ? "..." : t("submit")}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
            >
              {t("register")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
