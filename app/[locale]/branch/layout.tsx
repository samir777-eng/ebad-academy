import { DashboardLayout } from "@/components/dashboard/layout";

export default async function BranchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <DashboardLayout locale={locale}>{children}</DashboardLayout>;
}

