import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  return user?.role === "admin";
}

/**
 * Require admin access - throws error if not admin
 * Use this in server components/actions that require admin access
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Get the current user with role information
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  return await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      languagePref: true,
    },
  });
}

