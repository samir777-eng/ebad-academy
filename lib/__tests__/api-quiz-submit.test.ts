import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findUnique: vi.fn() },
    quizAttempt: { create: vi.fn() },
    userProgress: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/request-validation", () => ({
  validateRequestSize: vi.fn(),
  MAX_BODY_SIZE: { DEFAULT: 1048576 },
}));
vi.mock("@/lib/level-unlock", () => ({
  checkAndUnlockNextLevel: vi.fn(),
}));
vi.mock("@/lib/badge-checker", () => ({
  checkAndAwardBadges: vi.fn(),
  getNewlyAwardedBadges: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}));

const { auth } = await import("@/lib/auth");
const { prisma } = await import("@/lib/prisma");
const { validateRequestSize } = await import("@/lib/request-validation");
const { checkAndUnlockNextLevel } = await import("@/lib/level-unlock");
const { checkAndAwardBadges, getNewlyAwardedBadges } = await import(
  "@/lib/badge-checker"
);

describe("Quiz Submission API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/quiz/submit", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);
      vi.mocked(validateRequestSize).mockResolvedValue(null);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "1",
          answers: ["A", "B", "C"],
          score: 80,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if missing required fields", async () => {
      vi.mocked(validateRequestSize).mockResolvedValue(null);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "1",
          // Missing answers and score
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Missing required fields");
    });

    it("should return 400 for invalid lessonId format (SQL injection attempt)", async () => {
      vi.mocked(validateRequestSize).mockResolvedValue(null);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "1' OR '1'='1",
          answers: ["A"],
          score: 80,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid lesson ID format");
    });

    it("should return 400 for non-numeric lessonId", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(validateRequestSize).mockResolvedValue(null);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "abc",
          answers: ["A"],
          score: 80,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid lesson ID");
    });

    it("should return 404 if lesson not found", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(validateRequestSize).mockResolvedValue(null);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "999",
          answers: ["A"],
          score: 80,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Lesson not found");
    });

    it("should successfully submit quiz with passing score", async () => {
      const mockLesson = {
        id: 1,
        levelId: 1,
        questions: [
          { id: 1, correctAnswer: "A" },
          { id: 2, correctAnswer: "B" },
          { id: 3, correctAnswer: "C" },
        ],
      };

      const mockQuizAttempt = {
        id: "attempt-1",
        userId: "user-1",
        lessonId: 1,
        score: 80,
        totalQuestions: 3,
        correctAnswers: 2,
        passed: true,
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(validateRequestSize).mockResolvedValue(null);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(mockLesson as any);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        quizAttempt: mockQuizAttempt,
      } as any);
      vi.mocked(checkAndUnlockNextLevel).mockResolvedValue({
        levelUnlocked: true,
        nextLevelId: 2,
        completionPercentage: 100,
      });
      vi.mocked(checkAndAwardBadges).mockResolvedValue([1, 2]);
      vi.mocked(getNewlyAwardedBadges).mockResolvedValue([
        { id: 1, nameEn: "First Quiz", iconUrl: "/badge1.png" },
        { id: 2, nameEn: "Perfect Score", iconUrl: "/badge2.png" },
      ] as any);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "1",
          answers: ["A", "B", "C"],
          score: 80,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.score).toBe(80);
      expect(data.passed).toBe(true);
      expect(data.attemptId).toBe("attempt-1");
      expect(data.levelUnlocked).toBe(true);
      expect(data.nextLevelId).toBe(2);
      expect(data.completionPercentage).toBe(100);
      expect(data.newBadges).toHaveLength(2);

      // Verify transaction was called
      expect(prisma.$transaction).toHaveBeenCalled();

      // Verify level unlock check was called
      expect(checkAndUnlockNextLevel).toHaveBeenCalledWith("user-1", 1);

      // Verify badge check was called
      expect(checkAndAwardBadges).toHaveBeenCalledWith("user-1");
    });

    it("should successfully submit quiz with failing score", async () => {
      const mockLesson = {
        id: 1,
        levelId: 1,
        questions: [
          { id: 1, correctAnswer: "A" },
          { id: 2, correctAnswer: "B" },
          { id: 3, correctAnswer: "C" },
        ],
      };

      const mockQuizAttempt = {
        id: "attempt-2",
        userId: "user-1",
        lessonId: 1,
        score: 40,
        totalQuestions: 3,
        correctAnswers: 1,
        passed: false,
      };

      vi.mocked(auth).mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "User" },
      } as any);
      vi.mocked(validateRequestSize).mockResolvedValue(null);
      vi.mocked(prisma.lesson.findUnique).mockResolvedValue(mockLesson as any);
      vi.mocked(prisma.$transaction).mockResolvedValue({
        quizAttempt: mockQuizAttempt,
      } as any);
      vi.mocked(checkAndUnlockNextLevel).mockResolvedValue({
        levelUnlocked: false,
        completionPercentage: 50,
      });
      vi.mocked(checkAndAwardBadges).mockResolvedValue([]);
      vi.mocked(getNewlyAwardedBadges).mockResolvedValue([]);

      const { POST } = await import("@/app/api/quiz/submit/route");

      const request = new NextRequest("http://localhost:3000/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({
          lessonId: "1",
          answers: ["A", "X", "Y"],
          score: 40,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.score).toBe(40);
      expect(data.passed).toBe(false);
      expect(data.levelUnlocked).toBe(false);
      expect(data.newBadges).toHaveLength(0);
    });
  });
});
