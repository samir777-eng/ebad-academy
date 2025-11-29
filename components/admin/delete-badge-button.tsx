"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteBadgeButton({
  badgeId,
  badgeName,
}: {
  badgeId: number;
  badgeName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/badges/${badgeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete badge");
      }

      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Failed to delete badge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Delete badge"
      >
        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Delete Badge?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete &ldquo;{badgeName}&rdquo;? This
              will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>Remove the badge from all users who earned it</li>
              <li>Delete all badge records permanently</li>
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
                    Delete Badge
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
