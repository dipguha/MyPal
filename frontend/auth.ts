import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Cognito from "next-auth/providers/cognito";

import { initiateUserPasswordAuth } from "@/lib/cognito-auth";

const FASTAPI = process.env.FASTAPI_INTERNAL_URL ?? "http://localhost:8000";

export type AccountType = "solo" | "family";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshFailed";
    user: {
      onboardingComplete?: boolean;
      accountType?: AccountType;
    } & DefaultSession["user"];
  }
}

interface AuthMe {
  onboardingComplete: boolean;
  accountType: AccountType | null;
}

/** Fetches the auth-me view from FastAPI. Returns conservative defaults on
 * error rather than throwing — a transient backend failure should not block
 * sign-in; it just sends the user through onboarding once more.
 */
async function fetchAuthMe(accessToken: string): Promise<AuthMe> {
  try {
    const res = await fetch(`${FASTAPI}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return { onboardingComplete: false, accountType: null };
    const body = (await res.json()) as {
      onboarding_complete?: boolean;
      account_type?: AccountType;
    };
    return {
      onboardingComplete: !!body.onboarding_complete,
      accountType: body.account_type ?? null,
    };
  } catch {
    return { onboardingComplete: false, accountType: null };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Direct email + password sign-in via Cognito USER_PASSWORD_AUTH.
    // No browser redirect; tokens come straight back to the server.
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = typeof creds?.email === "string" ? creds.email : "";
        const password = typeof creds?.password === "string" ? creds.password : "";
        if (!email || !password) return null;

        const result = await initiateUserPasswordAuth(email, password);
        if ("code" in result) {
          throw new Error(result.code);
        }

        return {
          id: email,
          email,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + result.expiresIn,
        };
      },
    }),
    // OAuth Cognito retained for future social-style sign-in.
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        const u = user as {
          accessToken?: string;
          refreshToken?: string;
          expiresAt?: number;
        };
        if (u.accessToken) token.accessToken = u.accessToken;
        if (u.refreshToken) token.refreshToken = u.refreshToken;
        if (u.expiresAt) token.expiresAt = u.expiresAt;
      }
      if (account) {
        token.accessToken = account.access_token ?? token.accessToken;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.expiresAt = account.expires_at ?? token.expiresAt;
      }

      // On fresh sign-in OR explicit useSession().update() call, refresh the
      // backend flags. Cached on subsequent requests so we don't hit FastAPI
      // on every page navigation.
      const shouldRefresh =
        !!user ||
        trigger === "update" ||
        token.onboardingComplete === undefined;
      if (shouldRefresh && typeof token.accessToken === "string") {
        const me = await fetchAuthMe(token.accessToken);
        token.onboardingComplete = me.onboardingComplete;
        token.accountType = me.accountType;
      }

      // TODO: refresh-token rotation when token.expiresAt is near.
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.user = {
        ...session.user,
        onboardingComplete: token.onboardingComplete as boolean | undefined,
        accountType: token.accountType as AccountType | undefined,
      };
      return session;
    },
  },
});
