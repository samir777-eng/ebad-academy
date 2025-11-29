import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Returns the health status of the application and its dependencies
 * Used by monitoring services and load balancers
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Check if database is responsive (< 1000ms is healthy)
    const dbHealthy = dbLatency < 1000;

    // Overall health status
    const healthy = dbHealthy;

    const response = {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbHealthy ? "healthy" : "slow",
          latency: `${dbLatency}ms`,
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
      },
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };

    return NextResponse.json(response, {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    // If health check fails, return error status
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        checks: {
          database: {
            status: "error",
            error: error instanceof Error ? error.message : "Connection failed",
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

