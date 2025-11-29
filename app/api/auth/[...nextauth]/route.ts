import { handlers } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// Extract GET and POST from handlers
const { GET: originalGET, POST: originalPOST } = handlers;

// Wrap POST handler with rate limiting for login attempts
async function POST(req: NextRequest) {
  // Skip rate limiting in test environment
  if (
    process.env.SKIP_CSRF_CHECK === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    return originalPOST(req);
  }

  // Apply rate limiting: max 5 login attempts per 15 minutes per IP
  const rateLimitResult = await checkRateLimit(req, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (!rateLimitResult.allowed) {
    // Return a 429 response with proper headers
    return new NextResponse(
      JSON.stringify({
        error: "Too many login attempts. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(Date.now() + rateLimitResult.resetIn),
        },
      }
    );
  }

  // Call the original handler
  return originalPOST(req);
}

// Export GET as-is and POST with rate limiting
export { originalGET as GET, POST };
