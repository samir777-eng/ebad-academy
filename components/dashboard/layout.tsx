"use client";

import { Providers } from "@/components/providers";
import { useEffect, useState } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sync collapse state from sidebar (via localStorage)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("sidebar-collapsed");
        setIsCollapsed(saved === "true");
      } catch (error) {
        // localStorage not available
        console.error("localStorage not available:", error);
      }
    };

    // Initial load
    handleStorage();

    // Listen for changes
    window.addEventListener("storage", handleStorage);
    // Custom event for same-tab updates
    window.addEventListener("sidebar-collapse-change", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sidebar-collapse-change", handleStorage);
    };
  }, []);

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
          className={`flex flex-1 flex-col transition-all duration-300 ${
            isRTL
              ? isCollapsed
                ? "lg:mr-20"
                : "lg:mr-64"
              : isCollapsed
              ? "lg:ml-20"
              : "lg:ml-64"
          }`}
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
