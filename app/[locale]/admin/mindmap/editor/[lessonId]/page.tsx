import MindMapEditorWrapper from "@/components/admin/mindmap/MindMapEditorWrapper";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function MindMapEditorPage({
  params,
}: {
  params: Promise<{ lessonId: string; locale: string }>;
}) {
  const { lessonId, locale } = await params;
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: parseInt(lessonId) },
    include: {
      branch: true,
      level: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin/lessons/${lessonId}/edit`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mind Map Editor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {locale === "ar" ? lesson.titleAr : lesson.titleEn}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {locale === "ar" ? lesson.branch.nameAr : lesson.branch.nameEn}{" "}
                - {locale === "ar" ? lesson.level.nameAr : lesson.level.nameEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MindMapEditorWrapper lessonId={parseInt(lessonId)} locale={locale} />
      </div>
    </div>
  );
}
