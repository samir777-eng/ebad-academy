/**
 * Pagination utilities for consistent pagination across the application
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Default pagination limits
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | { page?: string; limit?: string }
): { page: number; limit: number; skip: number } {
  const pageStr =
    searchParams instanceof URLSearchParams
      ? searchParams.get("page")
      : searchParams.page;
  const limitStr =
    searchParams instanceof URLSearchParams
      ? searchParams.get("limit")
      : searchParams.limit;

  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(limitStr || String(DEFAULT_PAGE_SIZE), 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;
  const hasPrevious = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
    hasPrevious,
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}

