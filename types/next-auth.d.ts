import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types to include custom user properties
   */
  interface Session {
    user: {
      id: string;
      role: string;
      languagePref: string;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types to include custom properties
   */
  interface User {
    id: string;
    role: string;
    languagePref: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types to include custom properties
   */
  interface JWT {
    id: string;
    role: string;
    languagePref: string;
  }
}

