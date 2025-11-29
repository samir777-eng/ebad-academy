import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Audit Log Actions
 * Standardized action types for audit logging
 */
export const AuditAction = {
  // User Management
  USER_CREATED: "USER_CREATED",
  USER_DELETED: "USER_DELETED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_UPDATED: "USER_UPDATED",

  // Lesson Management
  LESSON_CREATED: "LESSON_CREATED",
  LESSON_UPDATED: "LESSON_UPDATED",
  LESSON_DELETED: "LESSON_DELETED",

  // Badge Management
  BADGE_CREATED: "BADGE_CREATED",
  BADGE_UPDATED: "BADGE_UPDATED",
  BADGE_DELETED: "BADGE_DELETED",
  BADGE_AWARDED: "BADGE_AWARDED",

  // Mind Map Management
  MINDMAP_NODE_CREATED: "MINDMAP_NODE_CREATED",
  MINDMAP_NODE_UPDATED: "MINDMAP_NODE_UPDATED",
  MINDMAP_NODE_DELETED: "MINDMAP_NODE_DELETED",
  MINDMAP_BULK_OPERATION: "MINDMAP_BULK_OPERATION",

  // Account Management
  ACCOUNT_DELETED: "ACCOUNT_DELETED",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * Entity Types for Audit Logging
 */
export const EntityType = {
  USER: "User",
  LESSON: "Lesson",
  BADGE: "Badge",
  MINDMAP_NODE: "MindMapNode",
  ACCOUNT: "Account",
} as const;

export type EntityTypeValue = (typeof EntityType)[keyof typeof EntityType];

/**
 * Audit Log Entry Interface
 */
export interface AuditLogEntry {
  userId: string;
  action: AuditActionType;
  entityType: EntityTypeValue;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 * @param entry - The audit log entry to create
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      logger.info("Audit Log:", {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        userId: entry.userId,
      });
    }
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    logger.error("Failed to create audit log:", error);
  }
}

/**
 * Extract IP address from request headers
 */
export function getIpAddress(request: Request): string | undefined {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    undefined
  );
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get("user-agent") || undefined;
}

/**
 * Helper function to create audit log from request
 */
export async function auditFromRequest(
  request: Request,
  userId: string,
  action: AuditActionType,
  entityType: EntityTypeValue,
  entityId: string,
  details?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogs(
  entityType?: EntityTypeValue,
  entityId?: string,
  limit: number = 100
) {
  return await prisma.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs for a specific user (admin who performed actions)
 */
export async function getUserAuditLogs(userId: string, limit: number = 100) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

