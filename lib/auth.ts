import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: PrismaAdapter is not compatible with CredentialsProvider
  // adapter: PrismaAdapter(prisma),
  trustHost: true, // Fix CSRF issues in development/testing
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(
            "[AUTH] Authorize called with email:",
            credentials?.email
          );

          if (!credentials?.email || !credentials?.password) {
            console.log("[AUTH] Missing credentials");
            throw new Error("Missing email or password");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("[AUTH] User found:", user ? "Yes" : "No");
          if (user) {
            console.log("[AUTH] User details:", {
              id: user.id,
              email: user.email,
              hasPassword: !!user.password,
            });
          }

          if (!user || !user.password) {
            console.log("[AUTH] User not found or no password");
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("[AUTH] Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("[AUTH] Invalid password");
            throw new Error("Invalid password");
          }

          console.log("[AUTH] Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            languagePref: user.languagePref,
          };
        } catch (error) {
          console.error("[AUTH] Error in authorize:", error);
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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.languagePref = (user as any).languagePref;
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
