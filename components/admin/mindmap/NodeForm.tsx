"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface NodeFormProps {
  lessonId: number;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NodeForm({
  lessonId,
  parentId,
  onSuccess,
  onCancel,
}: NodeFormProps) {
  const t = useTranslations("admin.mindmap");
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    type: "TOPIC",
    color: "#4F46E5",
    icon: "",
    shape: "circle",
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/mindmap/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lessonId,
          parentId: parentId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create node");
      }

      alert(t("nodeCreated"));
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: reload the page
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Failed to create node:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
    >
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {t("createNode") || "Create New Node"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {t("createNodeDescription") || "Add a new concept to your mind map"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("titleArabic") || "Arabic Title"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.titleAr}
          onChange={(e) =>
            setFormData({ ...formData, titleAr: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          dir="rtl"
          placeholder="مثال: التوحيد"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("titleArHelp") || "Enter the concept name in Arabic"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("titleEnglish") || "English Title"}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.titleEn}
          onChange={(e) =>
            setFormData({ ...formData, titleEn: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          placeholder="Example: Tawheed"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("titleEnHelp") || "Enter the concept name in English"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("descriptionArabic") || "Arabic Description"}
        </label>
        <textarea
          value={formData.descriptionAr}
          onChange={(e) =>
            setFormData({ ...formData, descriptionAr: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          rows={3}
          dir="rtl"
          placeholder="وصف تفصيلي للمفهوم (اختياري)"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("descriptionArHelp") || "Optional: Add more details in Arabic"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("descriptionEnglish") || "English Description"}
        </label>
        <textarea
          value={formData.descriptionEn}
          onChange={(e) =>
            setFormData({ ...formData, descriptionEn: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          rows={3}
          placeholder="Detailed description (optional)"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("descriptionEnHelp") || "Optional: Add more details in English"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("type") || "Node Type"}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white"
          >
            <option value="ROOT">{t("root") || "🌳 Root"}</option>
            <option value="CATEGORY">{t("category") || "📁 Category"}</option>
            <option value="TOPIC">{t("topic") || "📌 Topic"}</option>
            <option value="SUBTOPIC">{t("subtopic") || "📍 Subtopic"}</option>
            <option value="DETAIL">{t("detail") || "📝 Detail"}</option>
            <option value="NOTE">{t("note") || "💡 Note"}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {t("typeHelp") || "Choose hierarchy level"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("shape") || "Shape"}
          </label>
          <select
            value={formData.shape}
            onChange={(e) =>
              setFormData({ ...formData, shape: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white"
          >
            <option value="circle">{t("circle") || "⭕ Circle"}</option>
            <option value="rect">{t("rectangle") || "▭ Rectangle"}</option>
            <option value="diamond">{t("diamond") || "◆ Diamond"}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {t("shapeHelp") || "Visual appearance"}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("color") || "Node Color"}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-900 placeholder:text-gray-400"
              placeholder="#4F46E5"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t("colorHelp") || "Choose a color to organize visually"}
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <div className="flex-1">
            <label
              htmlFor="isPublished"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              {t("publishImmediately") || "Publish Immediately"}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t("publishHelp") ||
                "Make this node visible to students right away"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("creating") || "Creating..."}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("create") || "Create Node"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              // Default behavior: reset the form
              setFormData({
                titleAr: "",
                titleEn: "",
                descriptionAr: "",
                descriptionEn: "",
                type: "TOPIC",
                color: "#4F46E5",
                icon: "",
                shape: "circle",
                isPublished: false,
              });
            }
          }}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-semibold transition-all border border-gray-300"
        >
          {t("cancel") || "Reset"}
        </button>
      </div>
    </form>
  );
}
