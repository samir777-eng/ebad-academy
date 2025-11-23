import { DashboardLayout } from "@/components/dashboard/layout";
import { LessonViewer } from "@/components/lesson/lesson-viewer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function LessonPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { locale, id } = await params;
  const lessonId = parseInt(id);

  if (isNaN(lessonId)) {
    notFound();
  }

  // Fetch lesson with related data
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
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

  // If level is not unlocked, redirect to dashboard
  if (!userLevelStatus?.isUnlocked) {
    redirect(`/${locale}/dashboard`);
  }

  // Get user progress for this lesson
  const userProgress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id,
      },
    },
  });

  // Get previous and next lessons in the same branch
  const previousLesson = await prisma.lesson.findFirst({
    where: {
      branchId: lesson.branchId,
      order: { lt: lesson.order },
    },
    orderBy: { order: "desc" },
    select: { id: true },
  });

  const nextLesson = await prisma.lesson.findFirst({
    where: {
      branchId: lesson.branchId,
      order: { gt: lesson.order },
    },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  return (
    <DashboardLayout locale={locale}>
      <LessonViewer
        lesson={lesson}
        userProgress={userProgress}
        previousLessonId={previousLesson?.id}
        nextLessonId={nextLesson?.id}
        locale={locale}
        userId={session.user.id}
      />
    </DashboardLayout>
  );
}
