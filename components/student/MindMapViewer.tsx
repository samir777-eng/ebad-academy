"use client";

import type { MindMapNode, MindMapViewerProps } from "@/types/mindmap";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import VisualMindMap from "./VisualMindMap";

export default function MindMapViewer({
  lessonId,
  locale,
}: MindMapViewerProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize loadMindMap to prevent recreation on every render
  const loadMindMap = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/mindmap/tree?lessonId=${lessonId}`);
      const data = await res.json();

      // Get all published nodes (flatten the tree)
      const publishedNodes = data.nodes.filter((n: any) => n.isPublished);
      setNodes(publishedNodes);
      setError(null);
    } catch (error) {
      console.error("Failed to load mind map:", error);
      const errorMessage =
        locale === "ar"
          ? "فشل في تحميل الخريطة الذهنية. يرجى المحاولة مرة أخرى."
          : "Failed to load mind map. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lessonId, locale]);

  useEffect(() => {
    loadMindMap();
  }, [loadMindMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-slate-600 dark:text-slate-400">
            {locale === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="text-center p-6">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            {locale === "ar" ? "خطأ" : "Error"}
          </p>
          <p className="text-red-500 dark:text-red-300">{error}</p>
          <button
            onClick={loadMindMap}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="text-center p-6">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {locale === "ar"
              ? "لا توجد عقد في الخريطة الذهنية"
              : "No nodes in mind map"}
          </p>
        </div>
      </div>
    );
  }

  // Dynamically import ErrorBoundary to wrap VisualMindMap
  const ErrorBoundary = require("../ErrorBoundary").default;

  return (
    <ErrorBoundary>
      <VisualMindMap nodes={nodes} locale={locale} lessonId={lessonId} />
    </ErrorBoundary>
  );
}
