import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Google,
    GitHub,
    Credentials({ credentials: {}, async authorize() { return null; } }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute = ["/collection", "/pens", "/inks", "/wishlist", "/stats"]
        .some(p => nextUrl.pathname.startsWith(p));
      if (isAppRoute) return isLoggedIn;
      return true;
    },
  },
};
