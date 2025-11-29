import { Skeleton } from "./skeleton";

export function LessonHeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-4 w-96 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

export function LessonTabsSkeleton() {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
      ))}
    </div>
  );
}

export function LessonContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function LessonViewerSkeleton() {
  return (
    <div className="space-y-6">
      <LessonHeaderSkeleton />
      <LessonTabsSkeleton />
      <LessonContentSkeleton />
    </div>
  );
}

