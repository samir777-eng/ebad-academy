import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditActionType, EntityTypeValue } from "../audit";
import { AuditAction, EntityType } from "../audit";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("AuditAction", () => {
  it("should have all user management actions", () => {
    expect(AuditAction.USER_CREATED).toBe("USER_CREATED");
    expect(AuditAction.USER_DELETED).toBe("USER_DELETED");
    expect(AuditAction.USER_ROLE_CHANGED).toBe("USER_ROLE_CHANGED");
    expect(AuditAction.USER_UPDATED).toBe("USER_UPDATED");
  });

  it("should have all lesson management actions", () => {
    expect(AuditAction.LESSON_CREATED).toBe("LESSON_CREATED");
    expect(AuditAction.LESSON_UPDATED).toBe("LESSON_UPDATED");
    expect(AuditAction.LESSON_DELETED).toBe("LESSON_DELETED");
  });

  it("should have all badge management actions", () => {
    expect(AuditAction.BADGE_CREATED).toBe("BADGE_CREATED");
    expect(AuditAction.BADGE_UPDATED).toBe("BADGE_UPDATED");
    expect(AuditAction.BADGE_DELETED).toBe("BADGE_DELETED");
    expect(AuditAction.BADGE_AWARDED).toBe("BADGE_AWARDED");
  });

  it("should have all mindmap management actions", () => {
    expect(AuditAction.MINDMAP_NODE_CREATED).toBe("MINDMAP_NODE_CREATED");
    expect(AuditAction.MINDMAP_NODE_UPDATED).toBe("MINDMAP_NODE_UPDATED");
    expect(AuditAction.MINDMAP_NODE_DELETED).toBe("MINDMAP_NODE_DELETED");
    expect(AuditAction.MINDMAP_BULK_OPERATION).toBe("MINDMAP_BULK_OPERATION");
  });

  it("should have account management actions", () => {
    expect(AuditAction.ACCOUNT_DELETED).toBe("ACCOUNT_DELETED");
  });
});

describe("EntityType", () => {
  it("should have all entity types", () => {
    expect(EntityType.USER).toBe("User");
    expect(EntityType.LESSON).toBe("Lesson");
    expect(EntityType.BADGE).toBe("Badge");
    expect(EntityType.MINDMAP_NODE).toBe("MindMapNode");
    expect(EntityType.ACCOUNT).toBe("Account");
  });
});

describe("createAuditLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create audit log with all fields", async () => {
    const { createAuditLog } = await import("../audit");
    const { prisma } = await import("@/lib/prisma");

    const entry = {
      userId: "user-123",
      action: AuditAction.USER_DELETED as AuditActionType,
      entityType: EntityType.USER as EntityTypeValue,
      entityId: "deleted-user-456",
      details: { reason: "Account closure request" },
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    };

    await createAuditLog(entry);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        action: "USER_DELETED",
        entityType: "User",
        entityId: "deleted-user-456",
        details: JSON.stringify({ reason: "Account closure request" }),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      },
    });
  });

  it("should create audit log without optional fields", async () => {
    const { createAuditLog } = await import("../audit");
    const { prisma } = await import("@/lib/prisma");

    const entry = {
      userId: "user-123",
      action: AuditAction.LESSON_CREATED as AuditActionType,
      entityType: EntityType.LESSON as EntityTypeValue,
      entityId: "lesson-789",
    };

    await createAuditLog(entry);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        action: "LESSON_CREATED",
        entityType: "Lesson",
        entityId: "lesson-789",
        details: null,
        ipAddress: null,
        userAgent: null,
      },
    });
  });

  it("should handle errors gracefully", async () => {
    const { createAuditLog } = await import("../audit");
    const { prisma } = await import("@/lib/prisma");
    const { logger } = await import("@/lib/logger");

    vi.mocked(prisma.auditLog.create).mockRejectedValueOnce(
      new Error("Database error")
    );

    const entry = {
      userId: "user-123",
      action: AuditAction.USER_DELETED as AuditActionType,
      entityType: EntityType.USER as EntityTypeValue,
      entityId: "user-456",
    };

    await createAuditLog(entry);

    expect(logger.error).toHaveBeenCalledWith(
      "Failed to create audit log:",
      expect.any(Error)
    );
  });
});

describe("getIpAddress", () => {
  it("should extract IP from x-forwarded-for header", async () => {
    const { getIpAddress } = await import("../audit");

    const mockRequest = {
      headers: {
        get: vi.fn((header: string) => {
          if (header === "x-forwarded-for") return "192.168.1.1, 10.0.0.1";
          return null;
        }),
      },
    };

    const result = getIpAddress(mockRequest as any);

    expect(result).toBe("192.168.1.1");
  });

  it("should return undefined if no IP headers present", async () => {
    const { getIpAddress } = await import("../audit");

    const mockRequest = {
      headers: {
        get: vi.fn(() => null),
      },
    };

    const result = getIpAddress(mockRequest as any);

    expect(result).toBeUndefined();
  });
});

describe("getUserAgent", () => {
  it("should extract user agent from request", async () => {
    const { getUserAgent } = await import("../audit");

    const mockRequest = {
      headers: {
        get: vi.fn((header: string) => {
          if (header === "user-agent") return "Mozilla/5.0";
          return null;
        }),
      },
    };

    const result = getUserAgent(mockRequest as any);

    expect(result).toBe("Mozilla/5.0");
  });
});
