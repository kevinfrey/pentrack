import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { authConfig } from "./auth.config";

interface DbUser {
  id: string;
  name: string;
  email: string;
  image: string;
  password_hash: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers.filter(p => (p as { id?: string }).id !== "credentials"),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(credentials.email as string) as DbUser | undefined;
        if (!user || !user.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(user.email!);
        if (!existing) {
          db.prepare("INSERT INTO users (id, name, email, email_verified, image) VALUES (?, ?, ?, 1, ?)")
            .run(crypto.randomUUID(), user.name ?? "", user.email!, user.image ?? "");
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = db.prepare("SELECT id FROM users WHERE email = ?").get(user.email) as { id: string } | undefined;
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
