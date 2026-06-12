"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { PublicShell } from "@/components/ui/PublicShell";

type ResendStatus = "idle" | "sending" | "sent" | "error";

export default function ForgotSentPage() {
  return (
    <Suspense fallback={null}>
      <ForgotSentInner />
    </Suspense>
  );
}

function ForgotSentInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  async function resend() {
    if (!email || resendStatus === "sending") return;
    setResendStatus("sending");
    setResendError(null);
    try {
      const res = await fetch("/api/public/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok && res.status !== 204) {
        const body = (await res.json().catch(() => null)) as {
          detail?: { detail?: string } | string;
        } | null;
        const msg =
          typeof body?.detail === "object"
            ? body.detail.detail
            : typeof body?.detail === "string"
              ? body.detail
              : "Couldn't send a new code.";
        setResendError(msg ?? "Couldn't send a new code.");
        setResendStatus("error");
        return;
      }
      setResendStatus("sent");
    } catch {
      setResendError("Network error. Please try again.");
      setResendStatus("error");
    }
  }

  const mailto = email ? `mailto:${email}` : "mailto:";
  const resetHref = email
    ? `/forgot-password/reset?email=${encodeURIComponent(email)}`
    : "/forgot-password/reset";

  return (
    <PublicShell>
      <div className="text-center">
        <div
          aria-hidden
          className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-warm/15 text-[34px]"
        >
          📬
        </div>
        <h1 className="font-display text-[24px] font-bold text-text">
          Check your inbox
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-textS">
          We&apos;ve sent a 6-digit code to{" "}
          {email ? (
            <span className="font-semibold text-text">{email}</span>
          ) : (
            <span className="font-semibold text-text">your email</span>
          )}
          .<br />
          It expires in 1 hour.
        </p>
      </div>

      <a
        href={mailto}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50"
      >
        📧 Open email app
      </a>

      <Link
        href={resetHref}
        className="mt-2 block w-full rounded-xl border border-border bg-card px-5 py-2.5 text-center text-[13.5px] text-text transition hover:border-warm/60 hover:text-warm"
      >
        Have your code? Enter it →
      </Link>

      {resendStatus === "sent" ? (
        <div
          role="status"
          className="mt-4 rounded-md border border-sage/40 bg-sage/10 px-3.5 py-2.5 text-[13px] text-sage"
        >
          New code sent. Give it a minute, then check your inbox.
        </div>
      ) : null}
      {resendStatus === "error" && resendError ? (
        <div
          role="alert"
          className="mt-4 rounded-md border border-rose/40 bg-rose/10 px-3.5 py-2.5 text-[13px] text-rose"
        >
          {resendError}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col items-center gap-2 text-[12.5px] text-textS sm:flex-row sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={resend}
          disabled={!email || resendStatus === "sending"}
          className="text-warm hover:underline disabled:opacity-60"
        >
          {resendStatus === "sending" ? "Resending…" : "Resend email"}
        </button>
        <span aria-hidden className="text-textS/50">
          ·
        </span>
        <Link href="/sign-in" className="text-warm hover:underline">
          Back to sign in
        </Link>
      </div>
    </PublicShell>
  );
}
