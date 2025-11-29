"use client";

import {
  Eye,
  Loader2,
  MoreVertical,
  Shield,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function UserActionsMenu({
  user,
  locale,
}: {
  user: User;
  locale: string;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);

  const handleToggleRole = async () => {
    setLoading(true);
    try {
      const newRole = user.role === "admin" ? "student" : "admin";
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      router.refresh();
      setShowRoleConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      router.refresh();
      setShowDeleteConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="py-1">
                <a
                  href={`/${locale}/admin/users/${user.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  View Progress
                </a>
                <button
                  onClick={() => {
                    setShowRoleConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {user.role === "admin" ? (
                    <>
                      <ShieldOff className="w-4 h-4" />
                      Demote to Student
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Promote to Admin
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role Change Confirmation */}
      {showRoleConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {user.role === "admin"
                ? "Demote to Student?"
                : "Promote to Admin?"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user.role === "admin"
                ? `Are you sure you want to remove admin privileges from "${user.name}"? They will no longer be able to access the admin panel.`
                : `Are you sure you want to give admin privileges to "${user.name}"? They will be able to access the admin panel and manage all content.`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRoleConfirm(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleRole}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>{user.role === "admin" ? "Demote" : "Promote"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Delete User?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete &ldquo;{user.name}&rdquo;? This
              will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>User account and profile</li>
              <li>All progress records</li>
              <li>All quiz attempts</li>
              <li>All earned badges</li>
            </ul>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                    Delete User
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
