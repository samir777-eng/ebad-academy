import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SpiritualProgressDashboard } from "@/components/spiritual/spiritual-progress-dashboard";
import { DashboardLayout } from "@/components/dashboard/layout";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import { ChevronRight, Home, Heart } from "lucide-react";

export default async function SpiritualProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const admin = await isAdmin();
  const isRTL = locale === "ar";

  return (
    <DashboardLayout locale={locale} isAdmin={admin}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol
              className={`flex items-center gap-2 text-sm ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>{isRTL ? "لوحة التحكم" : "Dashboard"}</span>
                </Link>
              </li>
              <li>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 ${
                    isRTL ? "rotate-180" : ""
                  }`}
                />
              </li>
              <li className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                <Heart className="w-4 h-4" />
                <span>{isRTL ? "التقدم الروحي" : "Spiritual Progress"}</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {isRTL ? "التقدم الروحي" : "Spiritual Progress"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? "تتبع عباداتك اليومية وأعمالك الصالحة"
                : "Track your daily worship and good deeds"}
            </p>
          </div>

          {/* Dashboard */}
          <SpiritualProgressDashboard
            userId={session.user.id}
            locale={locale}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
