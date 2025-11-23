import { DashboardLayout } from "@/components/dashboard/layout";
import { QuizInterface } from "@/components/quiz/quiz-interface";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    locale: string;
    lessonId: string;
  }>;
};

export default async function QuizPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { locale, lessonId } = await params;
  const lessonIdNum = parseInt(lessonId);

  if (isNaN(lessonIdNum)) {
    notFound();
  }

  // Fetch lesson with questions
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonIdNum },
    include: {
      branch: true,
      level: true,
      questions: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Check if user has access to this lesson (level must be unlocked)
  const userLevelStatus = await prisma.userLevelStatus.findUnique({
    where: {
      userId_levelId: {
        userId: session.user.id,
        levelId: lesson.levelId,
      },
    },
  });

  if (!userLevelStatus?.isUnlocked) {
    redirect(`/${locale}/dashboard`);
  }

  // Check if there are questions
  if (lesson.questions.length === 0) {
    redirect(`/${locale}/lesson/${lessonId}`);
  }

  // Get user progress
  const userProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  return (
    <DashboardLayout locale={locale}>
      <QuizInterface
        lesson={lesson}
        userProgress={userProgress}
        locale={locale}
        userId={session.user.id}
      />
    </DashboardLayout>
  );
}

