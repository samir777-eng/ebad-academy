import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "./i18n";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: "ar",

  // Always use locale prefix
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // HTTPS enforcement in production
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get("host")}${request.nextUrl.pathname}${
        request.nextUrl.search
      }`,
      301
    );
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/lesson",
    "/quiz",
    "/profile",
    "/admin",
  ];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session?.user) {
      // Redirect to login page
      const locale = pathname.split("/")[1] || "ar";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check if route requires admin access
    const isAdminRoute = pathname.includes("/admin");
    if (isAdminRoute) {
      // Get user role with caching (reduces database queries by ~80%)
      const { getUserRole } = await import("@/lib/role-cache");
      const userEmail = session.user.email!;
      const role = await getUserRole(userEmail, async () => {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { role: true },
        });
        return user?.role || null;
      });

      if (role !== "admin") {
        // Redirect non-admin users to dashboard
        const locale = pathname.split("/")[1] || "ar";
        const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`, or `/monitoring` (Sentry tunnel)
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|monitoring|.*\\..*).*)",
  ],
};
