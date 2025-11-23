import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Edit, Plus, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LessonFilters } from "@/components/admin/lesson-filters";
import { DeleteLessonButton } from "@/components/admin/delete-lesson-button";

export default async function AdminLessonsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ level?: string; branch?: string }>;
}) {
  const { locale } = await params;
  const { level, branch } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Require admin access
  try {
    await requireAdmin();
  } catch (error) {
    redirect(`/${locale}/admin`);
  }

  const levelFilter = level ? parseInt(level) : undefined;
  const branchFilter = branch;

  // Get all lessons with filters
  const lessons = await prisma.lesson.findMany({
    where: {
      ...(levelFilter && { levelId: levelFilter }),
      ...(branchFilter && { branch: { slug: branchFilter } }),
    },
    include: {
      level: true,
      branch: true,
      questions: true,
    },
    orderBy: [{ levelId: "asc" }, { branchId: "asc" }, { order: "asc" }],
  });

  // Get levels and branches for filters
  const [levels, branches] = await Promise.all([
    prisma.level.findMany({ orderBy: { levelNumber: "asc" } }),
    prisma.branch.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/admin`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Manage Lessons
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {lessons.length} lessons total
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/admin/lessons/new`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              New Lesson
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <LessonFilters
          locale={locale}
          levels={levels}
          branches={branches}
          initialLevel={levelFilter}
          initialBranch={branchFilter}
        />

        {/* Lessons Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Videos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lessons.map((lesson) => {
                  const videoUrlsEn = lesson.videoUrlsEn
                    ? JSON.parse(lesson.videoUrlsEn as string)
                    : [];
                  const videoUrlsAr = lesson.videoUrlsAr
                    ? JSON.parse(lesson.videoUrlsAr as string)
                    : [];
                  const totalVideos = videoUrlsEn.length + videoUrlsAr.length;

                  return (
                    <tr
                      key={lesson.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lesson.titleEn}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lesson.titleAr}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        Level {lesson.level.levelNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {lesson.branch.nameEn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {lesson.questions.length} questions
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          <Video className="w-4 h-4" />
                          {totalVideos}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${locale}/admin/lessons/${lesson.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteLessonButton
                            lessonId={lesson.id}
                            lessonTitle={lesson.titleEn}
                            locale={locale}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
