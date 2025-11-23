import { DashboardLayout } from "@/components/dashboard/layout";
import { isAdmin } from "@/lib/admin";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await isAdmin();

  return (
    <DashboardLayout locale={locale} isAdmin={admin}>
      {children}
    </DashboardLayout>
  );
}
