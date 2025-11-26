"use client";

import { Providers } from "@/components/providers";
import { useState } from "react";
import { DashboardHeader } from "./header";
import { DashboardSidebar } from "./sidebar";

export function DashboardLayout({
  children,
  locale,
  isAdmin,
}: {
  children: React.ReactNode;
  locale: string;
  isAdmin?: boolean;
}) {
  const isRTL = locale === "ar";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Providers>
      <div
        className="flex h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Sidebar - Right for Arabic, Left for English */}
        <DashboardSidebar
          locale={locale}
          isRTL={isRTL}
          isAdmin={isAdmin}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div
          className={`flex flex-1 flex-col lg:${
            isRTL ? "mr-64" : "ml-64"
          } transition-all duration-300`}
        >
          {/* Header */}
          <DashboardHeader
            locale={locale}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
