import { auth } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { locales } from "./i18n";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: "ar",

  // Always use locale prefix
  localePrefix: "always",
});

export default async function middleware(request: any) {
  const { pathname } = request.nextUrl;

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
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
