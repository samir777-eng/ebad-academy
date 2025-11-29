"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface UserFiltersProps {
  initialSearch?: string;
  initialRole?: string;
}

export function UserFilters({
  initialSearch = "",
  initialRole = "",
}: UserFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);

  const updateFilters = (newSearch: string, newRole: string) => {
    const params = new URLSearchParams(searchParams);

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newRole) {
      params.set("role", newRole);
    } else {
      params.delete("role");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateFilters(value, role);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    updateFilters(search, value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>
    </div>
  );
}
