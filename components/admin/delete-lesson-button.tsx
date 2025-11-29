"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteLessonButton({
  lessonId,
  lessonTitle,
}: {
  lessonId: number;
  lessonTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Delete lesson"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Delete Lesson?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete &ldquo;{lessonTitle}&rdquo;? This
              will also delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>All quiz questions for this lesson</li>
              <li>All user progress records</li>
              <li>All quiz attempts</li>
            </ul>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Lesson
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
