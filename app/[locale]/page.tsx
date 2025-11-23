"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Award,
  Book,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const t = useTranslations("landing");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(`/${newLocale}`);
  };

  const features = [
    { icon: TrendingUp, key: "feature1" },
    { icon: Book, key: "feature2" },
    { icon: Target, key: "feature3" },
    { icon: CheckCircle, key: "feature4" },
    { icon: FileText, key: "feature5" },
    { icon: Globe, key: "feature6" },
  ];

  const steps = [
    { number: "01", key: "step1", icon: Users },
    { number: "02", key: "step2", icon: BookOpen },
    { number: "03", key: "step3", icon: Award },
  ];

  const testimonials = [
    { key: "student1" },
    { key: "student2" },
    { key: "student3" },
  ];

  const stats = [
    { value: "1000+", key: "students", icon: Users },
    { value: "200+", key: "lessons", icon: Book },
    { value: "50+", key: "countries", icon: Globe },
    { value: "4", key: "levels", icon: GraduationCap },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation Bar - Matches Dashboard Header */}
      <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {locale === "ar" ? "أكاديمية عباد" : "Ebad Academy"}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="gap-2 h-10 px-4 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200 group flex items-center"
            >
              <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              <span className="text-gray-700 dark:text-gray-300">
                {locale === "ar" ? "EN" : "AR"}
              </span>
            </button>

            <Link
              href={`/${locale}/login`}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors px-4 py-2"
            >
              {locale === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              href={`/${locale}/register`}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold hover:shadow-lg hover:shadow-primary-500/50 hover:scale-105 transition-all duration-300"
            >
              {locale === "ar" ? "ابدأ الآن" : "Get Started"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Matches Dashboard Style */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(20,184,166,0.1),transparent_50%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-6">
                <GraduationCap className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {locale === "ar"
                    ? "منهج جامعي متكامل"
                    : "University-Style Curriculum"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                {locale === "ar"
                  ? "ابنِ إسلامك من الأساس"
                  : "Build Your Islam From Foundation"}
              </h1>

              <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl">
                {t("hero.subtitle")}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href={`/${locale}/register`}>
                  <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-primary-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                    <span>{t("hero.cta")}</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold">
                    {t("hero.trustIndicators.students")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold">
                    {t("hero.trustIndicators.countries")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold">
                    {t("hero.trustIndicators.levels")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Floating Card 1 */}
                <div className="absolute top-0 right-0 w-48 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <Book className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {locale === "ar" ? "الدروس" : "Lessons"}
                      </p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        200+
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-0 left-0 w-48 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {locale === "ar" ? "الطلاب" : "Students"}
                      </p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        1000+
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-2xl">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Matches Dashboard Card Style */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t("features.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(`features.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t("howItWorks.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ number, key, icon: Icon }) => (
              <div key={key} className="text-center">
                <div className="relative mb-6 inline-block">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-xl">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-4 border-primary-500 flex items-center justify-center">
                    <span className="text-sm font-black text-primary-600 dark:text-primary-400">
                      {number}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t("testimonials.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-6">
                  "
                </div>
                <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
                  {t(
                    `testimonials.${testimonials[currentTestimonial].key}.text`
                  )}
                </p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t(
                    `testimonials.${testimonials[currentTestimonial].key}.name`
                  )}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    `testimonials.${testimonials[currentTestimonial].key}.country`
                  )}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "w-8 bg-gradient-to-r from-primary-600 to-secondary-600"
                      : "w-2 bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 dark:from-primary-700 dark:via-primary-600 dark:to-secondary-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, key, icon: Icon }) => (
              <div key={key} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {value}
                </div>
                <div className="text-lg font-semibold text-white/90">
                  {t(`stats.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
            {t("finalCta.title")}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10">
            {t("finalCta.subtitle")}
          </p>
          <Link href={`/${locale}/register`}>
            <button className="group px-12 py-5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xl font-bold shadow-2xl hover:shadow-primary-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
              <span>{t("finalCta.cta")}</span>
              <Award className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-10 w-10 text-primary-400" />
                <h3 className="text-2xl font-black text-white">
                  {locale === "ar" ? "أكاديمية عباد" : "Ebad Academy"}
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">
                {t("footer.about")}
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href={`/${locale}/about`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/contact`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {t("footer.contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">
                {t("footer.privacy")}
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href={`/${locale}/privacy`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/terms`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {t("footer.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Ebad Academy. {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
