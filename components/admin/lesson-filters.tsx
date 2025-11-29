"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Level {
  id: number;
  levelNumber: number;
  nameEn: string;
}

interface Branch {
  id: number;
  slug: string;
  nameEn: string;
}

interface LessonFiltersProps {
  levels: Level[];
  branches: Branch[];
  initialLevel?: number;
  initialBranch?: string;
}

export function LessonFilters({
  levels,
  branches,
  initialLevel,
  initialBranch,
}: LessonFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [level, setLevel] = useState(initialLevel?.toString() || "");
  const [branch, setBranch] = useState(initialBranch || "");

  const updateFilters = (newLevel: string, newBranch: string) => {
    const params = new URLSearchParams(searchParams);

    if (newLevel) {
      params.set("level", newLevel);
    } else {
      params.delete("level");
    }

    if (newBranch) {
      params.set("branch", newBranch);
    } else {
      params.delete("branch");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleLevelChange = (value: string) => {
    setLevel(value);
    updateFilters(value, branch);
  };

  const handleBranchChange = (value: string) => {
    setBranch(value);
    updateFilters(level, value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Filters
      </h2>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Level
          </label>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            value={level}
            onChange={(e) => handleLevelChange(e.target.value)}
            disabled={isPending}
          >
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                Level {lvl.levelNumber} - {lvl.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Branch
          </label>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            value={branch}
            onChange={(e) => handleBranchChange(e.target.value)}
            disabled={isPending}
          >
            <option value="">All Branches</option>
            {branches.map((br) => (
              <option key={br.id} value={br.slug}>
                {br.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
