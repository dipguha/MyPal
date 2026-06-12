"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Thin wrapper around next-auth's SessionProvider so the (app) layout can
 * mount it as a client component alongside QueryProvider. Required for
 * `useSession()` to work in any client component inside the shell.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
