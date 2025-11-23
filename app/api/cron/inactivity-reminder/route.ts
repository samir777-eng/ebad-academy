import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, createInactivityReminderEmail } from "@/lib/email";

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
    // Verify cron secret (optional but recommended for production)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate date thresholds
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find users who haven't been active recently
    // We'll check their last quiz attempt or lesson progress update
    const inactiveUsers = await prisma.user.findMany({
      where: {
        // Exclude users who opted out of emails (if you add this field later)
        // emailNotifications: true,
      },
      include: {
        progress: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        quizAttempts: {
          orderBy: { attemptDate: "desc" },
          take: 1,
        },
      },
    });

    const usersToRemind: Array<{
      user: typeof inactiveUsers[number];
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

    console.log(
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
    console.error("Error in inactivity reminder cron job:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

