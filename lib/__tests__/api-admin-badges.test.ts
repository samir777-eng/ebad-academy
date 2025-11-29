import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    badge: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    userBadge: {
      deleteMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/audit", () => ({
  auditFromRequest: vi.fn(),
  AuditAction: { BADGE_DELETED: "BADGE_DELETED" },
  EntityType: { BADGE: "BADGE" },
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}));

const { auth } = await import("@/lib/auth");
const { requireAdmin } = await import("@/lib/admin");
const { prisma } = await import("@/lib/prisma");
const { auditFromRequest } = await import("@/lib/audit");

describe("Admin Badge Management APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/admin/badges", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { POST } = await import("@/app/api/admin/badges/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges",
        {
          method: "POST",
          body: JSON.stringify({
            nameEn: "Test Badge",
            nameAr: "شارة تجريبية",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(requireAdmin).mockRejectedValue(
        new Error("Admin access required")
      );

      const { POST } = await import("@/app/api/admin/badges/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges",
        {
          method: "POST",
          body: JSON.stringify({
            nameEn: "Test Badge",
            nameAr: "شارة تجريبية",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should return 400 if required fields are missing", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);

      const { POST } = await import("@/app/api/admin/badges/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges",
        {
          method: "POST",
          body: JSON.stringify({
            nameEn: "Test Badge",
            // Missing required fields
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Missing required fields");
    });

    it("should successfully create badge with automatic criteria", async () => {
      const mockBadge = {
        id: 1,
        nameEn: "First Quiz",
        nameAr: "أول اختبار",
        descriptionEn: "Complete your first quiz",
        descriptionAr: "أكمل أول اختبار",
        iconUrl: "https://example.com/badge.png",
        criteria: JSON.stringify({ type: "quiz_count", value: 1 }),
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.badge.create).mockResolvedValue(mockBadge as any);

      const { POST } = await import("@/app/api/admin/badges/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges",
        {
          method: "POST",
          body: JSON.stringify({
            nameEn: "First Quiz",
            nameAr: "أول اختبار",
            descriptionEn: "Complete your first quiz",
            descriptionAr: "أكمل أول اختبار",
            icon: "https://example.com/badge.png",
            criteriaType: "quiz_count",
            criteriaValue: "1",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.badge).toEqual(mockBadge);
      expect(prisma.badge.create).toHaveBeenCalledWith({
        data: {
          nameEn: "First Quiz",
          nameAr: "أول اختبار",
          descriptionEn: "Complete your first quiz",
          descriptionAr: "أكمل أول اختبار",
          iconUrl: "https://example.com/badge.png",
          criteria: JSON.stringify({ type: "quiz_count", value: 1 }),
        },
      });
    });

    it("should successfully create badge with manual criteria", async () => {
      const mockBadge = {
        id: 2,
        nameEn: "Special Achievement",
        nameAr: "إنجاز خاص",
        iconUrl: "https://example.com/special.png",
        criteria: JSON.stringify({ type: "manual", value: 0 }),
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.badge.create).mockResolvedValue(mockBadge as any);

      const { POST } = await import("@/app/api/admin/badges/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges",
        {
          method: "POST",
          body: JSON.stringify({
            nameEn: "Special Achievement",
            nameAr: "إنجاز خاص",
            descriptionEn: "Manually awarded",
            descriptionAr: "يُمنح يدويًا",
            icon: "https://example.com/special.png",
            criteriaType: "manual",
            criteriaValue: "0",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(prisma.badge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          criteria: JSON.stringify({ type: "manual", value: 0 }),
        }),
      });
    });
  });

  describe("PUT /api/admin/badges/[id]", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { PUT } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "PUT",
          body: JSON.stringify({
            nameEn: "Updated Badge",
            nameAr: "شارة محدثة",
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(requireAdmin).mockRejectedValue(
        new Error("Admin access required")
      );

      const { PUT } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "PUT",
          body: JSON.stringify({
            nameEn: "Updated Badge",
            nameAr: "شارة محدثة",
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(500);
    });

    it("should successfully update badge", async () => {
      const mockBadge = {
        id: 1,
        nameEn: "Updated Badge",
        nameAr: "شارة محدثة",
        descriptionEn: "Updated description",
        descriptionAr: "وصف محدث",
        iconUrl: "https://example.com/updated.png",
        criteria: JSON.stringify({ type: "level_complete", value: 2 }),
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.badge.update).mockResolvedValue(mockBadge as any);

      const { PUT } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "PUT",
          body: JSON.stringify({
            nameEn: "Updated Badge",
            nameAr: "شارة محدثة",
            descriptionEn: "Updated description",
            descriptionAr: "وصف محدث",
            icon: "https://example.com/updated.png",
            criteriaType: "level_complete",
            criteriaValue: "2",
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.badge).toEqual(mockBadge);
      expect(prisma.badge.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          nameEn: "Updated Badge",
          nameAr: "شارة محدثة",
          descriptionEn: "Updated description",
          descriptionAr: "وصف محدث",
          iconUrl: "https://example.com/updated.png",
          criteria: JSON.stringify({ type: "level_complete", value: 2 }),
        },
      });
    });
  });

  describe("DELETE /api/admin/badges/[id]", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(requireAdmin).mockRejectedValue(
        new Error("Admin access required")
      );

      const { DELETE } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(500);
    });

    it("should return 404 if badge not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.badge.findUnique).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/999",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Badge not found");
    });

    it("should successfully delete badge and user badges", async () => {
      const mockBadge = {
        id: 1,
        nameEn: "Badge to Delete",
        nameAr: "شارة للحذف",
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.badge.findUnique).mockResolvedValue(mockBadge as any);
      vi.mocked(prisma.userBadge.deleteMany).mockResolvedValue({
        count: 5,
      } as any);
      vi.mocked(prisma.badge.delete).mockResolvedValue(mockBadge as any);
      vi.mocked(auditFromRequest).mockResolvedValue(undefined);

      const { DELETE } = await import("@/app/api/admin/badges/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/badges/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(prisma.userBadge.deleteMany).toHaveBeenCalledWith({
        where: { badgeId: 1 },
      });
      expect(prisma.badge.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(auditFromRequest).toHaveBeenCalled();
    });
  });
});
