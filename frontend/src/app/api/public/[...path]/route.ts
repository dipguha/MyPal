// Public BFF proxy: forwards browser requests to the Rails API WITHOUT
// attaching a session token. Used by endpoints that must be reachable before a
// user has signed in (sign-up, confirm, resend verification, password reset).

import { NextRequest, NextResponse } from "next/server";

const RAILS = process.env.RAILS_INTERNAL_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = new URL(`/api/v1/${path.join("/")}`, RAILS);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete("cookie");
  headers.delete("host");
  headers.delete("authorization");

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(url, { method: req.method, headers, body });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
