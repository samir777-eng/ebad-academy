import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with optional filtering
 * Query params:
 * - entityType: Filter by entity type (User, Lesson, Badge, etc.)
 * - entityId: Filter by specific entity ID
 * - userId: Filter by admin who performed the action
 * - action: Filter by specific action type
 * - limit: Number of records to return (default: 100, max: 1000)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin access
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 100;

    // Build where clause
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    // Get audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      // Note: We don't have a relation to User in AuditLog, so we fetch user info separately below
    });

    // Fetch user info for each audit log
    const userIds = [...new Set(auditLogs.map((log) => log.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Enrich audit logs with user info
    const enrichedLogs = auditLogs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
      user: userMap.get(log.userId) || null,
    }));

    return NextResponse.json({
      success: true,
      logs: enrichedLogs,
      count: enrichedLogs.length,
    });
  } catch (error: any) {
    logger.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
