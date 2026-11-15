import "server-only";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db/client";
import { env, githubAuthEnabled } from "@/lib/env";

const providers: Provider[] = [Nodemailer({ server: env.EMAIL_SERVER, from: env.EMAIL_FROM })];

// GitHub is optional locally so a fresh clone works with just docker compose.
if (githubAuthEnabled) {
  providers.push(GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Database sessions (not JWT) so removing a member or signing out
  // revokes access immediately, at the cost of one DB read per request.
  session: { strategy: "database" },
  providers,
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
