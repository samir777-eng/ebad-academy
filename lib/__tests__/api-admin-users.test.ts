import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/admin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userProgress: {
      deleteMany: vi.fn(),
    },
    quizAttempt: {
      deleteMany: vi.fn(),
    },
    userLevelStatus: {
      deleteMany: vi.fn(),
    },
    userBadge: {
      deleteMany: vi.fn(),
    },
    spiritualProgress: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/role-cache", () => ({
  roleCache: {
    invalidate: vi.fn(),
  },
}));

vi.mock("@/lib/audit", () => ({
  auditFromRequest: vi.fn(),
  AuditAction: {
    USER_DELETED: "USER_DELETED",
    USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  },
  EntityType: {
    USER: "USER",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { requireAdmin } from "@/lib/admin";
import { auditFromRequest } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleCache } from "@/lib/role-cache";

describe("Admin User Management APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/admin/users/[id]", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/users/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockRejectedValue(new Error("Forbidden"));

      const { DELETE } = await import("@/app/api/admin/users/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(500);
    });

    it("should return 400 if trying to delete own account", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "123", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const { DELETE } = await import("@/app/api/admin/users/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Cannot delete your own account");
    });

    it("should return 404 if user not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/users/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("User not found");
    });

    it("should successfully delete user and invalidate cache", async () => {
      const userToDelete = {
        id: "123",
        email: "user@example.com",
        name: "Test User",
        role: "student",
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(userToDelete as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([]);

      const { DELETE } = await import("@/app/api/admin/users/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify cache invalidation
      expect(roleCache.invalidate).toHaveBeenCalledWith(userToDelete.email);

      // Verify audit log
      expect(auditFromRequest).toHaveBeenCalled();
    });
  });

  describe("PUT /api/admin/users/[id]/role", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { PUT } = await import("@/app/api/admin/users/[id]/role/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "admin" }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const { PUT } = await import("@/app/api/admin/users/[id]/role/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "superadmin" }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid role");
    });

    it("should return 400 if trying to change own role", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "123", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const { PUT } = await import("@/app/api/admin/users/[id]/role/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "student" }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Cannot change your own role");
    });

    it("should return 404 if user not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const { PUT } = await import("@/app/api/admin/users/[id]/role/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "admin" }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("User not found");
    });

    it("should successfully update user role and invalidate cache", async () => {
      const currentUser = {
        id: "123",
        email: "user@example.com",
        name: "Test User",
        role: "student",
      };

      const updatedUser = {
        ...currentUser,
        role: "admin",
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);

      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(currentUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const { PUT } = await import("@/app/api/admin/users/[id]/role/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/123/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "admin" }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user.role).toBe("admin");

      // Verify cache invalidation
      expect(roleCache.invalidate).toHaveBeenCalledWith(currentUser.email);

      // Verify audit log
      expect(auditFromRequest).toHaveBeenCalled();
    });
  });
});
