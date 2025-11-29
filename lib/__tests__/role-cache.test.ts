import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserRole, roleCache } from "../role-cache";

describe("RoleCache", () => {
  beforeEach(() => {
    // Clear cache before each test
    roleCache.clear();
  });

  describe("Basic Cache Operations", () => {
    it("should store and retrieve a role", () => {
      roleCache.set("user@example.com", "admin");
      const role = roleCache.get("user@example.com");
      expect(role).toBe("admin");
    });

    it("should return null for non-existent entries", () => {
      const role = roleCache.get("nonexistent@example.com");
      expect(role).toBeNull();
    });

    it("should invalidate a specific entry", () => {
      roleCache.set("user@example.com", "admin");
      roleCache.invalidate("user@example.com");
      const role = roleCache.get("user@example.com");
      expect(role).toBeNull();
    });

    it("should clear all entries", () => {
      roleCache.set("user1@example.com", "admin");
      roleCache.set("user2@example.com", "student");
      roleCache.clear();

      expect(roleCache.get("user1@example.com")).toBeNull();
      expect(roleCache.get("user2@example.com")).toBeNull();
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should expire entries after TTL", async () => {
      // Create a cache with 1 second TTL
      const { RoleCache } = await import("../role-cache");
      const shortCache = new RoleCache(1);

      shortCache.set("user@example.com", "admin");
      expect(shortCache.get("user@example.com")).toBe("admin");

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(shortCache.get("user@example.com")).toBeNull();
    });

    it("should not expire entries before TTL", async () => {
      // Create a cache with 10 second TTL
      const { RoleCache } = await import("../role-cache");
      const longCache = new RoleCache(10);

      longCache.set("user@example.com", "admin");

      // Wait 500ms (well before TTL)
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(longCache.get("user@example.com")).toBe("admin");
    });
  });

  describe("LRU Eviction", () => {
    it("should evict oldest entry when max size is reached", async () => {
      // Create a cache with max size of 3
      const { RoleCache } = await import("../role-cache");
      const smallCache = new RoleCache(300, 3);

      smallCache.set("user1@example.com", "admin");
      smallCache.set("user2@example.com", "student");
      smallCache.set("user3@example.com", "admin");

      // This should evict user1
      smallCache.set("user4@example.com", "student");

      expect(smallCache.get("user1@example.com")).toBeNull();
      expect(smallCache.get("user2@example.com")).toBe("student");
      expect(smallCache.get("user3@example.com")).toBe("admin");
      expect(smallCache.get("user4@example.com")).toBe("student");
    });

    it("should move accessed entries to end (LRU)", async () => {
      const { RoleCache } = await import("../role-cache");
      const smallCache = new RoleCache(300, 3);

      smallCache.set("user1@example.com", "admin");
      smallCache.set("user2@example.com", "student");
      smallCache.set("user3@example.com", "admin");

      // Access user1 to move it to end
      smallCache.get("user1@example.com");

      // This should evict user2 (oldest)
      smallCache.set("user4@example.com", "student");

      expect(smallCache.get("user1@example.com")).toBe("admin");
      expect(smallCache.get("user2@example.com")).toBeNull();
      expect(smallCache.get("user3@example.com")).toBe("admin");
      expect(smallCache.get("user4@example.com")).toBe("student");
    });
  });

  describe("Cache Statistics", () => {
    it("should return correct cache stats", () => {
      roleCache.set("user1@example.com", "admin");
      roleCache.set("user2@example.com", "student");

      const stats = roleCache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(1000);
      expect(stats.ttlSeconds).toBe(300);
    });
  });

  describe("Cleanup", () => {
    it("should remove expired entries during cleanup", async () => {
      const { RoleCache } = await import("../role-cache");
      const shortCache = new RoleCache(1);

      shortCache.set("user1@example.com", "admin");
      shortCache.set("user2@example.com", "student");

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const removed = shortCache.cleanup();

      expect(removed).toBe(2);
      expect(shortCache.getStats().size).toBe(0);
    });
  });

  describe("getUserRole Helper", () => {
    it("should return cached role on cache hit", async () => {
      roleCache.set("user@example.com", "admin");

      const fetchFromDb = vi.fn();
      const role = await getUserRole("user@example.com", fetchFromDb);

      expect(role).toBe("admin");
      expect(fetchFromDb).not.toHaveBeenCalled();
    });

    it("should fetch from database on cache miss", async () => {
      const fetchFromDb = vi.fn().mockResolvedValue("student");
      const role = await getUserRole("user@example.com", fetchFromDb);

      expect(role).toBe("student");
      expect(fetchFromDb).toHaveBeenCalledOnce();
    });

    it("should cache the fetched role", async () => {
      const fetchFromDb = vi.fn().mockResolvedValue("admin");

      // First call - cache miss
      await getUserRole("user@example.com", fetchFromDb);

      // Second call - cache hit
      const role = await getUserRole("user@example.com", fetchFromDb);

      expect(role).toBe("admin");
      expect(fetchFromDb).toHaveBeenCalledOnce(); // Only called once
    });
  });

  describe("Cache Invalidation Integration", () => {
    it("should invalidate cache when role is updated", async () => {
      const userEmail = "admin@example.com";

      // Populate cache
      roleCache.set(userEmail, "student");
      expect(roleCache.get(userEmail)).toBe("student");

      // Simulate role update (what happens in the API route)
      roleCache.invalidate(userEmail);

      // Cache should be empty
      expect(roleCache.get(userEmail)).toBeNull();
    });

    it("should invalidate cache when user is deleted", async () => {
      const userEmail = "deleted@example.com";

      // Populate cache
      roleCache.set(userEmail, "admin");
      expect(roleCache.get(userEmail)).toBe("admin");

      // Simulate user deletion (what happens in the API route)
      roleCache.invalidate(userEmail);

      // Cache should be empty
      expect(roleCache.get(userEmail)).toBeNull();
    });

    it("should fetch fresh role from database after cache invalidation", async () => {
      const userEmail = "updated@example.com";
      const fetchFromDb = vi
        .fn()
        .mockResolvedValueOnce("student") // First call
        .mockResolvedValueOnce("admin"); // Second call after invalidation

      // First call - cache miss, fetches "student"
      const role1 = await getUserRole(userEmail, fetchFromDb);
      expect(role1).toBe("student");
      expect(fetchFromDb).toHaveBeenCalledTimes(1);

      // Second call - cache hit, returns "student"
      const role2 = await getUserRole(userEmail, fetchFromDb);
      expect(role2).toBe("student");
      expect(fetchFromDb).toHaveBeenCalledTimes(1); // Still only 1 call

      // Invalidate cache (simulating role update)
      roleCache.invalidate(userEmail);

      // Third call - cache miss after invalidation, fetches "admin"
      const role3 = await getUserRole(userEmail, fetchFromDb);
      expect(role3).toBe("admin");
      expect(fetchFromDb).toHaveBeenCalledTimes(2); // Now 2 calls
    });
  });
});
