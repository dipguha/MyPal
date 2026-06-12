"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PublicShell } from "@/components/ui/PublicShell";
import { cn } from "@/lib/cn";

const VerifySchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

type FormValues = z.infer<typeof VerifySchema>;

type ResendStatus = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full rounded-[10px] border border-border bg-card2 px-3.5 py-2.5 text-center text-[18px] tracking-[0.45em] text-text outline-none transition-colors placeholder:text-textS/70 focus:border-warm focus:ring-2 focus:ring-warm/20";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(VerifySchema) });

  async function onSubmit({ code }: FormValues) {
    const res = await fetch("/api/public/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        detail?: { code?: string; detail?: string } | string;
      } | null;
      const msg =
        typeof body?.detail === "object"
          ? (body.detail.detail ?? "Invalid code.")
          : "Invalid code.";
      setError("code", { message: msg });
      return;
    }

    // Clear the signup draft once verification succeeds.
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("mypal-signup-draft");
    }

    // After sign-in, route the freshly verified user to /onboarding.
    router.push("/sign-in?verified=1&callbackUrl=/onboarding");
  }

  async function resend() {
    if (!email) return;
    setResendStatus("sending");
    setResendError(null);
    try {
      const res = await fetch("/api/public/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          detail?: { code?: string; detail?: string } | string;
        } | null;
        const msg =
          typeof body?.detail === "object"
            ? body.detail.detail
            : typeof body?.detail === "string"
              ? body.detail
              : "Could not resend the code.";
        setResendError(msg ?? "Could not resend the code.");
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
          Enter it below — the code expires in 24 hours.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-3"
        noValidate
      >
        <div>
          <label htmlFor="code" className="sr-only">
            6-digit verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className={cn(FIELD, errors.code && "border-rose/60")}
            {...register("code")}
          />
          {errors.code ? (
            <p
              role="alert"
              className="mt-1 text-center text-[11px] text-rose"
            >
              {errors.code.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          Verify and continue
        </button>
      </form>

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

      {/* Action row */}
      <div className="mt-5 flex flex-col items-center gap-2 text-[12.5px] text-textS sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <a
          href={mailto}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card2 px-3 py-1.5 text-text transition-colors hover:border-warm/60 hover:text-warm"
        >
          📧 Open email app
        </a>
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
        <button
          type="button"
          onClick={() => router.push("/sign-up")}
          className="text-warm hover:underline"
        >
          Wrong email? Go back
        </button>
        <span aria-hidden className="text-textS/50">
          ·
        </span>
        <Link href="/sign-in" className="text-warm hover:underline">
          Already verified? Sign in
        </Link>
      </div>
    </PublicShell>
  );
}

