import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    question: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    userProgress: { deleteMany: vi.fn() },
    quizAttempt: { deleteMany: vi.fn() },
  },
}));
vi.mock("@/lib/audit", () => ({
  auditFromRequest: vi.fn(),
  AuditAction: { LESSON_DELETED: "LESSON_DELETED" },
  EntityType: { LESSON: "LESSON" },
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}));

const { auth } = await import("@/lib/auth");
const { requireAdmin } = await import("@/lib/admin");
const { prisma } = await import("@/lib/prisma");
const { auditFromRequest } = await import("@/lib/audit");

describe("Admin Lesson Management APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/admin/lessons", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { POST } = await import("@/app/api/admin/lessons/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons",
        {
          method: "POST",
          body: JSON.stringify({
            titleEn: "Test Lesson",
            titleAr: "درس تجريبي",
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

      const { POST } = await import("@/app/api/admin/lessons/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons",
        {
          method: "POST",
          body: JSON.stringify({
            titleEn: "Test Lesson",
            titleAr: "درس تجريبي",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should successfully create lesson without questions", async () => {
      const mockLesson = {
        id: 1,
        titleEn: "Test Lesson",
        titleAr: "درس تجريبي",
        descriptionEn: "Test description",
        descriptionAr: "وصف تجريبي",
        levelId: 1,
        branchId: 1,
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.lesson.create).mockResolvedValue(mockLesson as any);

      const { POST } = await import("@/app/api/admin/lessons/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons",
        {
          method: "POST",
          body: JSON.stringify({
            titleEn: "Test Lesson",
            titleAr: "درس تجريبي",
            descriptionEn: "Test description",
            descriptionAr: "وصف تجريبي",
            videoUrlsEn: ["https://youtube.com/watch?v=123"],
            videoUrlsAr: ["https://youtube.com/watch?v=456"],
            pdfUrl: "https://example.com/lesson.pdf",
            duration: "30",
            order: "1",
            levelId: "1",
            branchId: "1",
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.lesson).toEqual(mockLesson);
      expect(prisma.lesson.create).toHaveBeenCalled();
    });

    it("should successfully create lesson with questions", async () => {
      const mockLesson = {
        id: 1,
        titleEn: "Test Lesson",
        titleAr: "درس تجريبي",
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.lesson.create).mockResolvedValue(mockLesson as any);
      vi.mocked(prisma.question.create).mockResolvedValue({} as any);

      const { POST } = await import("@/app/api/admin/lessons/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons",
        {
          method: "POST",
          body: JSON.stringify({
            titleEn: "Test Lesson",
            titleAr: "درس تجريبي",
            descriptionEn: "Test",
            descriptionAr: "تجريبي",
            videoUrlsEn: [],
            videoUrlsAr: [],
            duration: "30",
            order: "1",
            levelId: "1",
            branchId: "1",
            questions: [
              {
                questionTextEn: "What is Islam?",
                questionTextAr: "ما هو الإسلام؟",
                type: "multiple_choice",
                optionsEn: ["A", "B", "C"],
                optionsAr: ["أ", "ب", "ج"],
                correctAnswer: "A",
                explanationEn: "Explanation",
                explanationAr: "شرح",
              },
            ],
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.question.create).toHaveBeenCalled();
    });
  });

  describe("PUT /api/admin/lessons/[id]", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { PUT } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
        {
          method: "PUT",
          body: JSON.stringify({
            titleEn: "Updated Lesson",
            titleAr: "درس محدث",
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

      const { PUT } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
        {
          method: "PUT",
          body: JSON.stringify({
            titleEn: "Updated Lesson",
            titleAr: "درس محدث",
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(500);
    });

    it("should successfully update lesson and replace questions", async () => {
      const mockLesson = {
        id: 1,
        titleEn: "Updated Lesson",
        titleAr: "درس محدث",
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.lesson.update).mockResolvedValue(mockLesson as any);
      vi.mocked(prisma.question.deleteMany).mockResolvedValue({
        count: 2,
      } as any);
      vi.mocked(prisma.question.create).mockResolvedValue({} as any);

      const { PUT } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
        {
          method: "PUT",
          body: JSON.stringify({
            titleEn: "Updated Lesson",
            titleAr: "درس محدث",
            descriptionEn: "Updated description",
            descriptionAr: "وصف محدث",
            videoUrlsEn: [],
            videoUrlsAr: [],
            duration: "45",
            order: "2",
            levelId: "1",
            branchId: "1",
            questions: [
              {
                questionTextEn: "New question?",
                questionTextAr: "سؤال جديد؟",
                type: "multiple_choice",
                optionsEn: ["A", "B"],
                optionsAr: ["أ", "ب"],
                correctAnswer: "A",
                explanationEn: "Explanation",
                explanationAr: "شرح",
              },
            ],
          }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.lesson).toEqual(mockLesson);
      expect(prisma.lesson.update).toHaveBeenCalled();
      expect(prisma.question.deleteMany).toHaveBeenCalledWith({
        where: { lessonId: 1 },
      });
      expect(prisma.question.create).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/lessons/[id]", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
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

      const { DELETE } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "1" }),
      });

      expect(response.status).toBe(500);
    });

    it("should return 404 if lesson not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null);

      const { DELETE } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/999",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "999" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Lesson not found");
    });

    it("should successfully delete lesson and related data", async () => {
      const mockLesson = {
        id: 1,
        titleEn: "Lesson to Delete",
        titleAr: "درس للحذف",
        levelId: 1,
        branchId: 1,
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "admin-1", email: "admin@example.com", name: "Admin" },
      } as any);
      vi.mocked(requireAdmin).mockResolvedValue(undefined);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(mockLesson as any);
      vi.mocked(prisma.question.deleteMany).mockResolvedValue({
        count: 3,
      } as any);
      vi.mocked(prisma.userProgress.deleteMany).mockResolvedValue({
        count: 5,
      } as any);
      vi.mocked(prisma.quizAttempt.deleteMany).mockResolvedValue({
        count: 2,
      } as any);
      vi.mocked(prisma.lesson.delete).mockResolvedValue(mockLesson as any);
      vi.mocked(auditFromRequest).mockResolvedValue(undefined);

      const { DELETE } = await import("@/app/api/admin/lessons/[id]/route");

      const request = new NextRequest(
        "http://localhost:3000/api/admin/lessons/1",
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
      expect(prisma.question.deleteMany).toHaveBeenCalledWith({
        where: { lessonId: 1 },
      });
      expect(prisma.userProgress.deleteMany).toHaveBeenCalledWith({
        where: { lessonId: 1 },
      });
      expect(prisma.quizAttempt.deleteMany).toHaveBeenCalledWith({
        where: { lessonId: 1 },
      });
      expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(auditFromRequest).toHaveBeenCalled();
    });
  });
});
