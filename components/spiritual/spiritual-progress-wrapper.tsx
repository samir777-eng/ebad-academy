"use client";

import { DashboardStatsSkeleton } from "@/components/ui/dashboard-skeleton";
import dynamic from "next/dynamic";

// Lazy load SpiritualProgressDashboard for better performance
const SpiritualProgressDashboard = dynamic(
  () =>
    import("./spiritual-progress-dashboard").then((mod) => ({
      default: mod.SpiritualProgressDashboard,
    })),
  {
    loading: () => (
      <div className="space-y-6">
        <DashboardStatsSkeleton />
        <DashboardStatsSkeleton />
      </div>
    ),
    ssr: false, // Dashboard is client-only with state
  }
);

type SpiritualProgressWrapperProps = {
  userId: string;
  locale: string;
};

export function SpiritualProgressWrapper({
  userId,
  locale,
}: SpiritualProgressWrapperProps) {
  return <SpiritualProgressDashboard userId={userId} locale={locale} />;
}
