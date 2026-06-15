// Generic BFF proxy: forwards browser requests to the Rails API, attaching the
// Cognito access token from the NextAuth session. No business logic lives
// here — keep this thin.

import { NextRequest, NextResponse } from "next/server";

import { auth } from "../../../../auth";

const RAILS = process.env.RAILS_INTERNAL_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { path } = await ctx.params;
  const url = new URL(`/api/v1/${path.join("/")}`, RAILS);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  headers.delete("cookie");
  headers.delete("host");

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(url, { method: req.method, headers, body });

  // Strip headers that Next's response layer recomputes; passing them through
  // causes content-decoding errors in the browser.
  const respHeaders = new Headers(upstream.headers);
  respHeaders.delete("content-length");
  respHeaders.delete("content-encoding");
  respHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
