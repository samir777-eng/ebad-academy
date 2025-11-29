/**
 * Serverless-compatible rate limiting using Vercel KV
 * Falls back to in-memory storage for local development
 */

import { kv } from "@vercel/kv";

// In-memory fallback for local development
type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const localStore: RateLimitStore = {};
const hasKV = !!process.env.KV_REST_API_URL;

export type RateLimitConfig = {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Custom identifier for the rate limit (e.g., IP address, user ID)
   * If not provided, will use IP address from request
   */
  identifier?: string;
};

export type RateLimitResult = {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;
  /**
   * Number of requests remaining in the current window
   */
  remaining: number;
  /**
   * Time in milliseconds until the rate limit resets
   */
  resetIn: number;
  /**
   * Total number of requests allowed in the window
   */
  limit: number;
};

/**
 * Check if a request should be rate limited (local fallback)
 */
function checkRateLimitLocal(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = localStore[key];

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    localStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
      limit: maxRequests,
    };
  }

  // Increment the count
  entry.count++;

  // Check if the limit has been exceeded
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetTime - now;

  return {
    allowed,
    remaining,
    resetIn,
    limit: maxRequests,
  };
}

/**
 * Check if a request should be rate limited (Vercel KV)
 */
async function checkRateLimitKV(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const kvKey = `ratelimit:${key}`;

  try {
    // Get current count and reset time
    const data = await kv.get<{ count: number; resetTime: number }>(kvKey);

    // If no entry exists or the window has expired, create a new one
    if (!data || data.resetTime < now) {
      const resetTime = now + windowMs;
      await kv.set(kvKey, { count: 1, resetTime }, { px: windowMs });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetIn: windowMs,
        limit: maxRequests,
      };
    }

    // Increment the count
    const newCount = data.count + 1;
    await kv.set(
      kvKey,
      { count: newCount, resetTime: data.resetTime },
      {
        pxat: data.resetTime,
      }
    );

    // Check if the limit has been exceeded
    const allowed = newCount <= maxRequests;
    const remaining = Math.max(0, maxRequests - newCount);
    const resetIn = data.resetTime - now;

    return {
      allowed,
      remaining,
      resetIn,
      limit: maxRequests,
    };
  } catch (error) {
    // If KV fails, allow the request but log the error
    console.error("Rate limit KV error:", error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetIn: windowMs,
      limit: maxRequests,
    };
  }
}

/**
 * Check if a request should be rate limited
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier } = config;

  // Get identifier (IP address or custom identifier)
  const key =
    identifier ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Use Vercel KV in production if available, otherwise use local store
  if (hasKV) {
    return await checkRateLimitKV(key, maxRequests, windowMs);
  } else {
    return checkRateLimitLocal(key, maxRequests, windowMs);
  }
}

/**
 * Create a rate limit response with appropriate headers
 * @param result - Rate limit result
 * @param message - Optional custom error message
 * @returns Response object
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
): Response {
  return new Response(
    JSON.stringify({
      error: message || "Too many requests. Please try again later.",
      retryAfter: Math.ceil(result.resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(
          Date.now() + result.resetIn
        ).toISOString(),
        "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
      },
    }
  );
}
