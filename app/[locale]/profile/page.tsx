import { DashboardLayout } from "@/components/dashboard/layout";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { locale } = await params;

  // Fetch user data with statistics
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      progress: {
        where: { completed: true },
      },
      quizAttempts: true,
      levelStatus: {
        where: { isUnlocked: true },
        include: { level: true },
        orderBy: { levelId: "desc" },
      },
      badges: {
        include: { badge: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate statistics
  const totalLessonsCompleted = user.progress.length;
  const totalQuizzesTaken = user.quizAttempts.length;
  const averageScore =
    totalQuizzesTaken > 0
      ? user.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        totalQuizzesTaken
      : 0;
  const currentLevel = user.levelStatus[0]?.level || null;
  const badgesEarned = user.badges.length;

  const stats = {
    memberSince: user.createdAt,
    totalLessonsCompleted,
    totalQuizzesTaken,
    averageScore: Math.round(averageScore),
    currentLevel: currentLevel
      ? locale === "ar"
        ? currentLevel.nameAr
        : currentLevel.nameEn
      : "-",
    badgesEarned,
  };

  return (
    <DashboardLayout locale={locale}>
      <ProfileSettings
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          languagePref: user.languagePref,
        }}
        stats={stats}
        badges={user.badges.map((ub) => ({
          id: ub.badge.id,
          nameAr: ub.badge.nameAr,
          nameEn: ub.badge.nameEn,
          descriptionAr: ub.badge.descriptionAr,
          descriptionEn: ub.badge.descriptionEn,
          iconUrl: ub.badge.iconUrl,
          earnedAt: ub.earnedDate,
        }))}
        locale={locale}
      />
    </DashboardLayout>
  );
}
