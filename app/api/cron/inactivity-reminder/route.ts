import { createInactivityReminderEmail, sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Inactivity Reminder Cron Job
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions, or external cron)
 * to send reminder emails to inactive users.
 *
 * Schedule: Run daily at 9:00 AM UTC
 *
 * Security: Protect this endpoint with a secret token in production
 */

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (REQUIRED for security)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // In production, CRON_SECRET must be set
    if (process.env.NODE_ENV === "production" && !cronSecret) {
      logger.error("CRON_SECRET is not set in production environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify the authorization header matches the secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron job attempt detected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In development without CRON_SECRET, log a warning but allow execution
    if (!cronSecret) {
      logger.warn(
        "CRON_SECRET not set - cron endpoint is unprotected. Set CRON_SECRET in production!"
      );
    }

    // Calculate date thresholds
    const now = new Date();
    // Note: Only using 14-day threshold currently. Add 3-day and 7-day thresholds when needed.
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    // OPTIMIZATION: Instead of fetching ALL users and filtering in memory,
    // we filter at the database level using OR conditions for efficiency
    // We look for users whose last activity was 3, 7, or 14 days ago
    const inactiveUsers = await prisma.user.findMany({
      where: {
        // Exclude users who opted out of emails (if you add this field later)
        // emailNotifications: true,
        OR: [
          // Users with progress updated 3, 7, or 14 days ago
          {
            progress: {
              some: {
                updatedAt: {
                  gte: fourteenDaysAgo,
                  lte: fifteenDaysAgo,
                },
              },
            },
          },
          // Users with quiz attempts 3, 7, or 14 days ago
          {
            quizAttempts: {
              some: {
                attemptDate: {
                  gte: fourteenDaysAgo,
                  lte: fifteenDaysAgo,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        progress: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            updatedAt: true,
          },
        },
        quizAttempts: {
          orderBy: { attemptDate: "desc" },
          take: 1,
          select: {
            attemptDate: true,
          },
        },
      },
    });

    const usersToRemind: Array<{
      user: (typeof inactiveUsers)[number];
      daysSinceLastActivity: number;
    }> = [];

    // Determine which users need reminders
    for (const user of inactiveUsers) {
      const lastProgressUpdate = user.progress[0]?.updatedAt;
      const lastQuizAttempt = user.quizAttempts[0]?.attemptDate;

      // Get the most recent activity
      const lastActivity = [lastProgressUpdate, lastQuizAttempt]
        .filter(Boolean)
        .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0];

      if (!lastActivity) {
        // User has never been active, skip
        continue;
      }

      const daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Send reminders at 3, 7, and 14 days
      if (
        daysSinceLastActivity === 3 ||
        daysSinceLastActivity === 7 ||
        daysSinceLastActivity === 14
      ) {
        usersToRemind.push({ user, daysSinceLastActivity });
      }
    }

    // Send reminder emails
    const emailResults = await Promise.allSettled(
      usersToRemind.map(async ({ user, daysSinceLastActivity }) => {
        return sendEmail(
          user.email,
          createInactivityReminderEmail({
            name: user.name || "Student",
            email: user.email,
            daysSinceLastActivity,
          })
        );
      })
    );

    // Count successes and failures
    const successful = emailResults.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failed = emailResults.filter(
      (result) => result.status === "rejected"
    ).length;

    logger.log(
      `Inactivity reminder cron job completed: ${successful} emails sent, ${failed} failed`
    );

    return NextResponse.json({
      success: true,
      totalUsers: inactiveUsers.length,
      usersReminded: usersToRemind.length,
      emailsSent: successful,
      emailsFailed: failed,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    logger.error("Error in inactivity reminder cron job:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
