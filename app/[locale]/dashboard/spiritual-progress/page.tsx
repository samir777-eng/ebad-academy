import { SpiritualProgressDashboard } from "@/components/spiritual/spiritual-progress-dashboard";
import { auth } from "@/lib/auth";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";

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

  const isRTL = locale === "ar";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "التقدم الروحي" : "Spiritual Progress"}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {isRTL
            ? "تتبع عباداتك اليومية وأعمالك الصالحة"
            : "Track your daily worship and good deeds"}
        </p>
      </div>

      {/* Dashboard */}
      <SpiritualProgressDashboard userId={session.user.id} locale={locale} />
    </div>
  );
}
