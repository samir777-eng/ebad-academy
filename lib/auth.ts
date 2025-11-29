import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { logger } from "./logger";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: PrismaAdapter is not compatible with CredentialsProvider
  // adapter: PrismaAdapter(prisma),
  trustHost: true, // Fix CSRF issues in development/testing/production
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          logger.log("[AUTH] Authorize called with email:", credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            logger.log("[AUTH] Missing credentials");
            throw new Error("Missing email or password");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          logger.log("[AUTH] User found:", user ? "Yes" : "No");
          if (user) {
            logger.log("[AUTH] User details:", {
              id: user.id,
              email: user.email,
              hasPassword: !!user.password,
            });
          }

          if (!user || !user.password) {
            logger.log("[AUTH] User not found or no password");
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          logger.log("[AUTH] Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            logger.log("[AUTH] Invalid password");
            throw new Error("Invalid password");
          }

          logger.log("[AUTH] Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            languagePref: user.languagePref,
          };
        } catch (error) {
          logger.error("[AUTH] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - refresh session if older than this
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.languagePref = (user as any).languagePref;
        token.iat = Math.floor(Date.now() / 1000); // Issued at timestamp
      }

      // Refresh token data on update trigger
      if (trigger === "update" && token.id) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, languagePref: true, name: true, email: true },
        });
        if (updatedUser) {
          token.role = updatedUser.role;
          token.languagePref = updatedUser.languagePref;
          token.name = updatedUser.name;
          token.email = updatedUser.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).languagePref = token.languagePref;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
