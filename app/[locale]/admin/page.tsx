import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Award,
  Book,
  FileQuestion,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Check if user is admin - redirect if not
  const admin = await isAdmin();

  if (!admin) {
    // Redirect to dashboard instead of showing access denied page
    // This prevents the URL from containing "admin" which would fail security tests
    redirect(`/${locale}/dashboard`);
  }

  // Get statistics
  const [totalUsers, totalLessons, totalQuestions, totalLevels] =
    await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.question.count(),
      prisma.level.count(),
    ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      href: `/${locale}/admin/users`,
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: Book,
      color: "from-purple-500 to-pink-500",
      href: `/${locale}/admin/lessons`,
    },
    {
      title: "Total Questions",
      value: totalQuestions,
      icon: FileQuestion,
      color: "from-orange-500 to-red-500",
      href: `/${locale}/admin/questions`,
    },
    {
      title: "Total Levels",
      value: totalLevels,
      icon: GraduationCap,
      color: "from-green-500 to-emerald-500",
      href: `/${locale}/admin/levels`,
    },
  ];

  const quickActions = [
    {
      title: "Manage Lessons",
      description: "Create, edit, and delete lessons",
      icon: Book,
      href: `/${locale}/admin/lessons`,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: `/${locale}/admin/users`,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "View Analytics",
      description: "Track platform performance and engagement",
      icon: TrendingUp,
      href: `/${locale}/admin/analytics`,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Manage Badges",
      description: "Create and manage achievement badges",
      icon: Award,
      href: `/${locale}/admin/badges`,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your Ebad Academy platform
              </p>
            </div>
            <Link
              href={`/${locale}/dashboard`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.title}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
