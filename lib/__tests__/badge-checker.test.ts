import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  badge: {
    findMany: vi.fn(),
  },
  userBadge: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('checkAndAwardBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if user not found', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');
    
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await checkAndAwardBadges('non-existent-user');
    expect(result).toEqual([]);
  });

  it('should award badge for lessons_completed criteria', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [{ id: 1 }, { id: 2 }, { id: 3 }], // 3 completed lessons
      quizAttempts: [],
      levelStatus: [],
      badges: [],
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 1,
        criteria: JSON.stringify({ type: 'lessons_completed', value: 3 }),
      },
    ]);

    mockPrisma.userBadge.create.mockResolvedValue({ id: 1 });

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([1]);
    expect(mockPrisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        badgeId: 1,
      },
    });
  });

  it('should NOT award badge if criteria not met', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [{ id: 1 }], // Only 1 completed lesson
      quizAttempts: [],
      levelStatus: [],
      badges: [],
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 1,
        criteria: JSON.stringify({ type: 'lessons_completed', value: 5 }),
      },
    ]);

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([]);
    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });

  it('should NOT award badge if user already has it', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [{ id: 1 }, { id: 2 }, { id: 3 }],
      quizAttempts: [],
      levelStatus: [],
      badges: [{ badgeId: 1 }], // Already has badge 1
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 1,
        criteria: JSON.stringify({ type: 'lessons_completed', value: 3 }),
      },
    ]);

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([]);
    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });

  it('should skip manual badges', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [],
      quizAttempts: [],
      levelStatus: [],
      badges: [],
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 1,
        criteria: JSON.stringify({ type: 'manual' }),
      },
    ]);

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([]);
    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });

  it('should award badge for quizzes_passed criteria', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [],
      quizAttempts: [
        { id: 1, passed: true, score: 80 },
        { id: 2, passed: true, score: 90 },
      ],
      levelStatus: [],
      badges: [],
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 2,
        criteria: JSON.stringify({ type: 'quizzes_passed', value: 2 }),
      },
    ]);

    mockPrisma.userBadge.create.mockResolvedValue({ id: 1 });

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([2]);
  });

  it('should award badge for perfect_score criteria', async () => {
    const { checkAndAwardBadges } = await import('../badge-checker');

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      progress: [],
      quizAttempts: [
        { id: 1, passed: true, score: 100 },
        { id: 2, passed: true, score: 80 },
      ],
      levelStatus: [],
      badges: [],
    });

    mockPrisma.badge.findMany.mockResolvedValue([
      {
        id: 3,
        criteria: JSON.stringify({ type: 'perfect_score', value: 1 }),
      },
    ]);

    mockPrisma.userBadge.create.mockResolvedValue({ id: 1 });

    const result = await checkAndAwardBadges('user-1');
    
    expect(result).toEqual([3]);
  });
});

describe('manuallyAwardBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should award badge if user does not have it', async () => {
    const { manuallyAwardBadge } = await import('../badge-checker');

    mockPrisma.userBadge.findFirst.mockResolvedValue(null);
    mockPrisma.userBadge.create.mockResolvedValue({ id: 1 });

    const result = await manuallyAwardBadge('user-1', 5);
    
    expect(result).toBe(true);
    expect(mockPrisma.userBadge.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        badgeId: 5,
      },
    });
  });

  it('should NOT award badge if user already has it', async () => {
    const { manuallyAwardBadge } = await import('../badge-checker');

    mockPrisma.userBadge.findFirst.mockResolvedValue({ id: 1 });

    const result = await manuallyAwardBadge('user-1', 5);
    
    expect(result).toBe(false);
    expect(mockPrisma.userBadge.create).not.toHaveBeenCalled();
  });
});

