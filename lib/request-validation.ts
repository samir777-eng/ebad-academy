/**
 * Request validation utilities for API routes
 * Includes body size limits and content type validation
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Maximum request body size in bytes
 * Default: 1MB for most requests, 10MB for file uploads
 */
export const MAX_BODY_SIZE = {
  DEFAULT: 1 * 1024 * 1024, // 1MB
  FILE_UPLOAD: 10 * 1024 * 1024, // 10MB
  LARGE_CONTENT: 5 * 1024 * 1024, // 5MB (for rich text content)
};

/**
 * Check if request body size exceeds the limit
 * @param request - The incoming request
 * @param maxSize - Maximum allowed size in bytes
 * @returns Error response if size exceeded, null otherwise
 */
export async function validateRequestSize(
  request: NextRequest,
  maxSize: number = MAX_BODY_SIZE.DEFAULT
): Promise<NextResponse | null> {
  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    if (size > maxSize) {
      return NextResponse.json(
        {
          error: "Request body too large",
          maxSize: `${(maxSize / 1024 / 1024).toFixed(2)}MB`,
          receivedSize: `${(size / 1024 / 1024).toFixed(2)}MB`,
        },
        {
          status: 413, // Payload Too Large
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  return null;
}

/**
 * Validate request content type
 * @param request - The incoming request
 * @param allowedTypes - Array of allowed content types
 * @returns Error response if content type not allowed, null otherwise
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[]
): NextResponse | null {
  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return NextResponse.json(
      {
        error: "Content-Type header is required",
        allowedTypes,
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const isAllowed = allowedTypes.some((type) =>
    contentType.toLowerCase().includes(type.toLowerCase())
  );

  if (!isAllowed) {
    return NextResponse.json(
      {
        error: "Invalid Content-Type",
        received: contentType,
        allowedTypes,
      },
      {
        status: 415, // Unsupported Media Type
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return null;
}

/**
 * Validate JSON request body
 * @param request - The incoming request
 * @param maxSize - Maximum allowed size in bytes
 * @returns Parsed JSON body or error response
 */
export async function validateJsonRequest<T = any>(
  request: NextRequest,
  maxSize: number = MAX_BODY_SIZE.DEFAULT
): Promise<{ data: T } | { error: NextResponse }> {
  // Check content type
  const contentTypeError = validateContentType(request, ["application/json"]);
  if (contentTypeError) {
    return { error: contentTypeError };
  }

  // Check size
  const sizeError = await validateRequestSize(request, maxSize);
  if (sizeError) {
    return { error: sizeError };
  }

  // Parse JSON
  try {
    const data = await request.json();
    return { data };
  } catch (error) {
    return {
      error: NextResponse.json(
        {
          error: "Invalid JSON body",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    };
  }
}

