import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  lesson: {
    findMany: vi.fn(),
  },
  userProgress: {
    findMany: vi.fn(),
  },
  quizAttempt: {
    findMany: vi.fn(),
  },
  userLevelStatus: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
  level: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/badge-checker', () => ({
  checkAndAwardBadges: vi.fn(),
}));

describe('checkAndUnlockNextLevel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 0% completion if no lessons in level', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([]);

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result).toEqual({
      levelUnlocked: false,
      completionPercentage: 0,
    });
  });

  it('should calculate completion percentage correctly', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    // 4 lessons in level
    mockPrisma.lesson.findMany.mockResolvedValue([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ]);

    // User completed 2 lessons
    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
      { lessonId: 2, completed: true },
    ]);

    // User passed 2 quizzes
    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 1, passed: true },
      { lessonId: 2, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result.completionPercentage).toBe(50); // 2/4 = 50%
    expect(result.levelUnlocked).toBe(false);
  });

  it('should NOT unlock next level if not all lessons completed', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    // Only 1 lesson completed
    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
    ]);

    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 1, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result.levelUnlocked).toBe(false);
    expect(result.completionPercentage).toBe(50);
  });

  it('should unlock next level when all lessons completed', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
      { lessonId: 2, completed: true },
    ]);

    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 1, passed: true },
      { lessonId: 2, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    mockPrisma.level.findUnique.mockResolvedValue({
      id: 1,
      levelNumber: 1,
    });

    mockPrisma.level.findFirst.mockResolvedValue({
      id: 2,
      levelNumber: 2,
    });

    mockPrisma.userLevelStatus.findUnique.mockResolvedValue(null);

    mockPrisma.level.findMany.mockResolvedValue([
      { id: 1, levelNumber: 1 },
      { id: 2, levelNumber: 2 },
    ]);

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result.levelUnlocked).toBe(true);
    expect(result.nextLevelId).toBe(2);
    expect(result.completionPercentage).toBe(100);
  });

  it('should NOT unlock if next level already unlocked', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([{ id: 1 }]);

    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
    ]);

    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 1, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    mockPrisma.level.findUnique.mockResolvedValue({
      id: 1,
      levelNumber: 1,
    });

    mockPrisma.level.findFirst.mockResolvedValue({
      id: 2,
      levelNumber: 2,
    });

    mockPrisma.userLevelStatus.findUnique.mockResolvedValue({
      isUnlocked: true,
    });

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result.levelUnlocked).toBe(false);
    expect(result.nextLevelId).toBe(2);
  });

  it('should handle last level completion', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([{ id: 1 }]);

    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
    ]);

    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 1, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    mockPrisma.level.findUnique.mockResolvedValue({
      id: 4,
      levelNumber: 4,
    });

    mockPrisma.level.findFirst.mockResolvedValue(null); // No next level

    const result = await checkAndUnlockNextLevel('user-1', 4);

    expect(result.levelUnlocked).toBe(false);
    expect(result.completionPercentage).toBe(100);
  });

  it('should require BOTH progress and quiz to count as complete', async () => {
    const { checkAndUnlockNextLevel } = await import('../level-unlock');

    mockPrisma.lesson.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    // Lesson 1: has progress but no quiz
    // Lesson 2: has quiz but no progress
    mockPrisma.userProgress.findMany.mockResolvedValue([
      { lessonId: 1, completed: true },
    ]);

    mockPrisma.quizAttempt.findMany.mockResolvedValue([
      { lessonId: 2, passed: true },
    ]);

    mockPrisma.userLevelStatus.upsert.mockResolvedValue({});

    const result = await checkAndUnlockNextLevel('user-1', 1);

    expect(result.completionPercentage).toBe(0); // Neither lesson fully complete
    expect(result.levelUnlocked).toBe(false);
  });
});

