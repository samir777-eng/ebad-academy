/**
 * Simple in-memory cache for user roles to reduce database queries in middleware
 *
 * This cache stores user roles with a TTL (Time To Live) to balance between
 * performance and data freshness. When a user's role changes, the cache entry
 * will expire after the TTL period.
 *
 * Cache Strategy:
 * - TTL: 5 minutes (300 seconds) - balances performance vs freshness
 * - Max Size: 1000 entries - prevents memory issues
 * - LRU Eviction: Removes least recently used entries when max size is reached
 */

interface CacheEntry {
  role: string;
  timestamp: number;
}

export class RoleCache {
  private cache: Map<string, CacheEntry>;
  private readonly TTL_MS: number;
  private readonly MAX_SIZE: number;

  constructor(ttlSeconds: number = 300, maxSize: number = 1000) {
    this.cache = new Map();
    this.TTL_MS = ttlSeconds * 1000;
    this.MAX_SIZE = maxSize;
  }

  /**
   * Get a role from cache if it exists and hasn't expired
   */
  get(email: string): string | null {
    const entry = this.cache.get(email);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.TTL_MS) {
      this.cache.delete(email);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(email);
    this.cache.set(email, entry);

    return entry.role;
  }

  /**
   * Set a role in cache
   */
  set(email: string, role: string): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(email, {
      role,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate a specific user's role cache
   */
  invalidate(email: string): void {
    this.cache.delete(email);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; ttlSeconds: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      ttlSeconds: this.TTL_MS / 1000,
    };
  }

  /**
   * Clean up expired entries (optional maintenance)
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [email, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL_MS) {
        this.cache.delete(email);
        removed++;
      }
    }

    return removed;
  }
}

// Singleton instance
export const roleCache = new RoleCache();

/**
 * Get user role with caching
 * First checks cache, then falls back to database query
 */
export async function getUserRole(
  email: string,
  fetchFromDb: () => Promise<string | null>
): Promise<string | null> {
  // Try cache first
  const cachedRole = roleCache.get(email);
  if (cachedRole !== null) {
    return cachedRole;
  }

  // Cache miss - fetch from database
  const role = await fetchFromDb();

  if (role) {
    roleCache.set(email, role);
  }

  return role;
}
