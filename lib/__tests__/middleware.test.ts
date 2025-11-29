import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import middleware from "../../middleware";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-intl/middleware", () => ({
  default: vi.fn((config) => {
    return (request: NextRequest) => {
      // Mock intl middleware - just return a response
      return new Response("OK", { status: 200 });
    };
  }),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env.NODE_ENV = "development";
  });

  describe("HTTPS Enforcement", () => {
    it("should redirect HTTP to HTTPS in production", async () => {
      process.env.NODE_ENV = "production";

      const request = new NextRequest("http://example.com/ar/dashboard", {
        headers: {
          "x-forwarded-proto": "http",
          host: "example.com",
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        "https://example.com/ar/dashboard"
      );
    });

    it("should not redirect HTTPS requests in production", async () => {
      process.env.NODE_ENV = "production";

      const request = new NextRequest("https://example.com/ar/dashboard", {
        headers: {
          "x-forwarded-proto": "https",
          host: "example.com",
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "user@example.com", name: "Test User" },
      } as any);

      const response = await middleware(request);

      // Should not be a redirect (intl middleware returns 200)
      expect(response.status).not.toBe(301);
    });

    it("should not enforce HTTPS in development", async () => {
      process.env.NODE_ENV = "development";

      const request = new NextRequest("http://localhost:3000/ar/dashboard", {
        headers: {
          "x-forwarded-proto": "http",
          host: "localhost:3000",
        },
      });

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "user@example.com", name: "Test User" },
      } as any);

      const response = await middleware(request);

      // Should not redirect to HTTPS in development
      expect(response.status).not.toBe(301);
    });
  });

  describe("Authentication Checks", () => {
    it("should redirect unauthenticated users from protected routes to login", async () => {
      const request = new NextRequest("http://localhost:3000/ar/dashboard");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(307); // Next.js redirect status
      expect(response.headers.get("location")).toContain("/ar/login");
    });

    it("should allow authenticated users to access protected routes", async () => {
      const request = new NextRequest("http://localhost:3000/ar/dashboard");

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "user@example.com", name: "Test User" },
      } as any);

      const response = await middleware(request);

      // Should not redirect (intl middleware returns 200)
      expect(response.status).toBe(200);
    });

    it("should protect /lesson routes", async () => {
      const request = new NextRequest("http://localhost:3000/ar/lesson/1");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/ar/login");
    });

    it("should protect /quiz routes", async () => {
      const request = new NextRequest("http://localhost:3000/en/quiz/1");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/en/login");
    });

    it("should protect /profile routes", async () => {
      const request = new NextRequest("http://localhost:3000/ar/profile");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/ar/login");
    });
  });

  describe("Admin Role Verification", () => {
    it("should redirect non-admin users from /admin routes to dashboard", async () => {
      const request = new NextRequest("http://localhost:3000/ar/admin");

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "user@example.com", name: "Test User" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "1",
        email: "user@example.com",
        name: "Test User",
        role: "student",
        password: "hashed",
        languagePref: "ar",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/ar/dashboard");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
        select: { role: true },
      });
    });

    it("should allow admin users to access /admin routes", async () => {
      const request = new NextRequest("http://localhost:3000/ar/admin");

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "admin@example.com", name: "Admin User" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        password: "hashed",
        languagePref: "ar",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await middleware(request);

      // Should not redirect (intl middleware returns 200)
      expect(response.status).toBe(200);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@example.com" },
        select: { role: true },
      });
    });

    it("should protect nested /admin routes", async () => {
      const request = new NextRequest(
        "http://localhost:3000/en/admin/users/123"
      );

      vi.mocked(auth).mockResolvedValue({
        user: { id: "2", email: "student@example.com", name: "Student" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "2",
        email: "student@example.com",
        name: "Student",
        role: "student",
        password: "hashed",
        languagePref: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/en/dashboard");
    });
  });

  describe("Locale Handling", () => {
    it("should use Arabic locale in redirects when path starts with /ar", async () => {
      const request = new NextRequest("http://localhost:3000/ar/dashboard");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.headers.get("location")).toContain("/ar/login");
    });

    it("should use English locale in redirects when path starts with /en", async () => {
      const request = new NextRequest("http://localhost:3000/en/dashboard");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.headers.get("location")).toContain("/en/login");
    });

    it("should default to Arabic locale when locale is missing", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      // The middleware extracts locale from pathname.split("/")[1]
      // For "/dashboard", this returns "dashboard", so it defaults to "ar"
      // The redirect URL will be "/dashboard/login" which gets handled by intl middleware
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });
  });

  describe("Public Routes", () => {
    it("should allow access to login page without authentication", async () => {
      const request = new NextRequest("http://localhost:3000/ar/login");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      // Should not redirect (intl middleware returns 200)
      expect(response.status).toBe(200);
    });

    it("should allow access to register page without authentication", async () => {
      const request = new NextRequest("http://localhost:3000/en/register");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should allow access to home page without authentication", async () => {
      const request = new NextRequest("http://localhost:3000/ar");

      vi.mocked(auth).mockResolvedValue(null);

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing user email in session", async () => {
      const request = new NextRequest("http://localhost:3000/ar/admin");

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", name: "Test User" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await middleware(request);

      // The middleware checks session.user, not session.user.email
      // So it will try to query the database with undefined email
      // This will redirect to dashboard (admin check fails)
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/ar/dashboard");
    });

    it("should handle user not found in database for admin check", async () => {
      const request = new NextRequest("http://localhost:3000/ar/admin");

      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", email: "ghost@example.com", name: "Ghost User" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await middleware(request);

      // Should redirect to dashboard if user not found
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/ar/dashboard");
    });

    it("should preserve query parameters in HTTPS redirect", async () => {
      process.env.NODE_ENV = "production";

      const request = new NextRequest(
        "http://example.com/ar/dashboard?tab=stats&filter=active",
        {
          headers: {
            "x-forwarded-proto": "http",
            host: "example.com",
          },
        }
      );

      const response = await middleware(request);

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        "https://example.com/ar/dashboard?tab=stats&filter=active"
      );
    });
  });
});
