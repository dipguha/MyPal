import { NextResponse } from "next/server";

import { auth } from "./auth";

// Runs on the edge before any matched route. Two responsibilities:
//   1. block unauthenticated /api/* calls (except NextAuth's own routes)
//   2. redirect unauthenticated visitors away from the (app) shell
//
// Real authorisation still happens in FastAPI; this is defence-in-depth.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/public/")
  ) {
    if (!isAuthed) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isAuthed && PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    const signIn = new URL("/sign-in", req.nextUrl);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }
});

const PROTECTED_PAGES = ["/onboarding", "/today", "/life-admin", "/wellbeing", "/lifestyle", "/account"];

export const config = {
  matcher: ["/api/:path*", "/onboarding/:path*", "/today/:path*", "/life-admin/:path*", "/wellbeing/:path*", "/lifestyle/:path*", "/account/:path*"],
};
