"use client";

import { useState } from "react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: "hijri" | "gregorian";
  locale: string;
  placeholder?: string;
}

/**
 * Date picker component for Hijri and Gregorian dates
 * Provides a simple text input with format hints
 */
export default function DatePicker({
  label,
  value,
  onChange,
  type,
  locale,
  placeholder,
}: DatePickerProps) {
  const [showHint, setShowHint] = useState(false);

  const formatHint =
    type === "hijri"
      ? locale === "ar"
        ? "مثال: 12 ربيع الأول 1 هـ"
        : "Example: 12 Rabi' al-Awwal 1 AH"
      : locale === "ar"
      ? "مثال: 24 سبتمبر 622 م"
      : "Example: 24 September 622 CE";

  const commonHijriMonths = [
    "Muharram",
    "Safar",
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    "Jumada al-Awwal",
    "Jumada al-Thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ];

  const commonHijriMonthsAr = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأولى",
    "جمادى الثانية",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ];

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowHint(true)}
        onBlur={() => setTimeout(() => setShowHint(false), 200)}
        placeholder={placeholder || formatHint}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
      />

      {/* Format Hint */}
      <div className="mt-1 text-xs text-gray-700 font-medium">{formatHint}</div>

      {/* Quick Select Dropdown for Hijri Months */}
      {showHint && type === "hijri" && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-800 mb-2">
              {locale === "ar" ? "الأشهر الهجرية:" : "Hijri Months:"}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(locale === "ar" ? commonHijriMonthsAr : commonHijriMonths).map(
                (month, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      // Insert month name at cursor position
                      const parts = value.split(" ");
                      if (parts.length >= 1) {
                        onChange(
                          `${parts[0] || ""} ${month} ${parts[2] || ""}`
                        );
                      } else {
                        onChange(month);
                      }
                    }}
                    className="text-left px-2 py-1 text-xs text-gray-800 hover:bg-indigo-50 hover:text-indigo-900 rounded transition-colors"
                  >
                    {month}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
