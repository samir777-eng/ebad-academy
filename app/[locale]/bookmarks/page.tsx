import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bookmark, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BookmarksPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { locale } = await params;
  const isRTL = locale === "ar";

  // Fetch all bookmarks with lesson details
  const bookmarks = await prisma.lessonBookmark.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      lesson: {
        include: {
          branch: true,
          level: true,
          userProgress: {
            where: { userId: session.user.id },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isRTL ? "الدروس المحفوظة" : "Bookmarked Lessons"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL
              ? `لديك ${bookmarks.length} درس محفوظ`
              : `You have ${bookmarks.length} bookmarked lesson${bookmarks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => {
              const lesson = bookmark.lesson;
              const title = isRTL ? lesson.titleAr : lesson.titleEn;
              const description = isRTL ? lesson.descriptionAr : lesson.descriptionEn;
              const branchName = isRTL ? lesson.branch.nameAr : lesson.branch.nameEn;
              const levelName = isRTL ? lesson.level.nameAr : lesson.level.nameEn;
              const isCompleted = lesson.userProgress[0]?.completed || false;
              const score = lesson.userProgress[0]?.score || 0;

              return (
                <Link
                  key={bookmark.id}
                  href={`/${locale}/lesson/${lesson.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {title}
                        </h3>
                        {description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {description}
                          </p>
                        )}
                      </div>
                      <Bookmark className="h-5 w-5 text-primary-600 fill-current flex-shrink-0 ml-2" />
                    </div>

                    {/* Branch & Level */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg">
                        {branchName}
                      </span>
                      <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg">
                        {levelName}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>
                          {lesson.duration} {isRTL ? "دقيقة" : "min"}
                        </span>
                      </div>

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold">
                            {isRTL ? "مكتمل" : "Completed"} • {Math.round(score)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bookmark className="h-24 w-24 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isRTL ? "لا توجد دروس محفوظة" : "No Bookmarked Lessons"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isRTL
                ? "احفظ دروسك المفضلة للوصول السريع إليها"
                : "Save your favorite lessons for quick access"}
            </p>
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              {isRTL ? "تصفح الدروس" : "Browse Lessons"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

