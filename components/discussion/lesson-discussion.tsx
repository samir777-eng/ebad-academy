"use client";

import { CheckCircle, MessageCircle, Pin, ThumbsUp } from "lucide-react";
import { useState } from "react";

type Discussion = {
  id: number;
  title: string;
  content: string;
  userName: string;
  createdAt: Date;
  isPinned: boolean;
  isResolved: boolean;
  likesCount: number;
  repliesCount: number;
};

type LessonDiscussionProps = {
  lessonId: number;
  locale: string;
};

export function LessonDiscussion({ lessonId, locale }: LessonDiscussionProps) {
  const [discussions] = useState<Discussion[]>([]);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const isRTL = locale === "ar";

  const createDiscussion = async () => {
    // TODO: Implement API call
    console.log("Creating discussion:", { lessonId, newTitle, newContent });
    setShowNewDiscussion(false);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "المناقشات" : "Discussions"}
          </h2>
        </div>
        <button
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          {isRTL ? "+ سؤال جديد" : "+ New Question"}
        </button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRTL ? "طرح سؤال جديد" : "Ask a New Question"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "العنوان" : "Title"}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  isRTL ? "اكتب عنوان السؤال..." : "Enter question title..."
                }
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "التفاصيل" : "Details"}
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={
                  isRTL
                    ? "اشرح سؤالك بالتفصيل..."
                    : "Explain your question in detail..."
                }
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createDiscussion}
                disabled={!newTitle || !newContent}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? "نشر السؤال" : "Post Question"}
              </button>
              <button
                onClick={() => setShowNewDiscussion(false)}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? "لا توجد مناقشات بعد. كن أول من يطرح سؤالاً!"
                : "No discussions yet. Be the first to ask a question!"}
            </p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer"
            >
              {/* Discussion content would go here */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {discussion.isPinned && (
                      <Pin className="h-4 w-4 text-primary-600" />
                    )}
                    {discussion.isResolved && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {discussion.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {discussion.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{discussion.userName}</span>
                    <span>•</span>
                    <span>
                      {new Date(discussion.createdAt).toLocaleDateString(
                        locale
                      )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {discussion.likesCount}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {discussion.repliesCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
