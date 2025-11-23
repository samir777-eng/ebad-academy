"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";

type Badge = {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  criteriaType: string;
  criteriaValue: number;
};

type BadgeFormProps = {
  locale: string;
  badge?: Badge;
  mode: "create" | "edit";
};

const EMOJI_OPTIONS = [
  "🏆", "🥇", "🥈", "🥉", "⭐", "🌟", "✨", "💫",
  "🎖️", "🏅", "👑", "💎", "🔥", "⚡", "🎯", "🎓",
  "📚", "✅", "🎉", "🌙", "☀️", "🌈", "🦅", "🦁",
];

const CRITERIA_TYPES = [
  { value: "lessons_completed", label: "Lessons Completed" },
  { value: "level_completed", label: "Level Completed" },
  { value: "quizzes_passed", label: "Quizzes Passed" },
  { value: "perfect_score", label: "Perfect Scores (100%)" },
  { value: "manual", label: "Manual Assignment" },
];

export function BadgeForm({ locale, badge, mode }: BadgeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameEn: badge?.nameEn || "",
    nameAr: badge?.nameAr || "",
    descriptionEn: badge?.descriptionEn || "",
    descriptionAr: badge?.descriptionAr || "",
    icon: badge?.icon || "🏆",
    criteriaType: badge?.criteriaType || "lessons_completed",
    criteriaValue: badge?.criteriaValue || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/admin/badges"
          : `/api/admin/badges/${badge?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save badge");
      }

      router.push(`/${locale}/admin/badges`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Badge Name (English) *
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., First Steps"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Badge Name (Arabic) *
            </label>
            <input
              type="text"
              required
              value={formData.nameAr}
              onChange={(e) =>
                setFormData({ ...formData, nameAr: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="مثال: الخطوات الأولى"
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (English) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData({ ...formData, descriptionEn: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe how to earn this badge"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Arabic) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionAr}
              onChange={(e) =>
                setFormData({ ...formData, descriptionAr: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="اشرح كيفية الحصول على هذه الشارة"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Icon Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Badge Icon
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select an emoji to represent this badge
        </p>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData({ ...formData, icon: emoji })}
              className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                formData.icon === emoji
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-110"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Unlock Criteria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock Criteria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Criteria Type *
            </label>
            <select
              required
              value={formData.criteriaType}
              onChange={(e) =>
                setFormData({ ...formData, criteriaType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {CRITERIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.criteriaType !== "manual" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Value *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.criteriaValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    criteriaValue: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {formData.criteriaType === "manual" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            This badge will be manually assigned to users by admins.
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/badges`)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === "create" ? "Create Badge" : "Update Badge"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

