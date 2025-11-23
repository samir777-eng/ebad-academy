/**
 * Simple in-memory rate limiting for API routes
 * In production, use Redis or a dedicated rate limiting service
 */

type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

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
 * Check if a request should be rate limited
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config;

  // Get identifier (IP address or custom identifier)
  const key =
    identifier ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = store[key];

  // If no entry exists or the window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    store[key] = {
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

