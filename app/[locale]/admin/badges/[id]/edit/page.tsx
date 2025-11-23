import { BadgeForm } from "@/components/admin/badge-form";
import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditBadgePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  const badgeData = await prisma.badge.findUnique({
    where: { id: parseInt(id) },
  });

  if (!badgeData) {
    notFound();
  }

  // Parse criteria JSON and transform to component format
  const criteria = JSON.parse(badgeData.criteria);
  const badge = {
    ...badgeData,
    icon: badgeData.iconUrl,
    criteriaType: criteria.type || "lessons_completed",
    criteriaValue: criteria.value || 10,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin/badges`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Badge
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update badge details and criteria
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BadgeForm locale={locale} badge={badge} mode="edit" />
      </div>
    </div>
  );
}
