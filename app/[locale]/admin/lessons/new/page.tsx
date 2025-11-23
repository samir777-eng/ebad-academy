import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  // Get levels and branches for the form
  const [levels, branches] = await Promise.all([
    prisma.level.findMany({ orderBy: { levelNumber: "asc" } }),
    prisma.branch.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin/lessons`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create New Lesson
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add a new lesson to the platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonForm
          locale={locale}
          levels={levels}
          branches={branches}
          mode="create"
        />
      </div>
    </div>
  );
}
