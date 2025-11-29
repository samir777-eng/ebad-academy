"use client";

import { List, Network } from "lucide-react";
import { useState } from "react";
import AdminVisualMindMapEditor from "./AdminVisualMindMapEditor";
import SimpleMindMapEditor from "./SimpleMindMapEditor";

interface MindMapEditorWrapperProps {
  lessonId: number;
  locale: string;
}

export default function MindMapEditorWrapper({
  lessonId,
  locale,
}: MindMapEditorWrapperProps) {
  const [viewMode, setViewMode] = useState<"tree" | "visual">("tree");

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div
          className="inline-flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm"
          role="group"
          aria-label={locale === "ar" ? "وضع العرض" : "View mode"}
        >
          <button
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              viewMode === "tree"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            aria-pressed={viewMode === "tree"}
            aria-label={locale === "ar" ? "عرض الشجرة" : "Tree view"}
          >
            <List className="w-5 h-5" />
            <span>{locale === "ar" ? "عرض الشجرة" : "Tree View"}</span>
          </button>
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              viewMode === "visual"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            aria-pressed={viewMode === "visual"}
            aria-label={locale === "ar" ? "العرض المرئي" : "Visual view"}
          >
            <Network className="w-5 h-5" />
            <span>{locale === "ar" ? "العرض المرئي" : "Visual View"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      {viewMode === "tree" ? (
        <SimpleMindMapEditor lessonId={lessonId.toString()} locale={locale} />
      ) : (
        <AdminVisualMindMapEditor lessonId={lessonId} locale={locale} />
      )}
    </div>
  );
}

