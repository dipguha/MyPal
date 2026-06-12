"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PublicShell } from "@/components/ui/PublicShell";
import { cn } from "@/lib/cn";

const ForgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof ForgotSchema>;

const FIELD =
  "w-full rounded-[10px] border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none transition-colors placeholder:text-textS/70 focus:border-warm focus:ring-2 focus:ring-warm/20";

const FIELD_LABEL =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.06em] text-textS";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(ForgotSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/public/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      // Cognito's silence-on-unknown-email behaviour is preserved on the
      // backend, so we treat any non-error response as success. Only surface
      // rate-limit / unavailable errors.
      if (!res.ok && res.status !== 204) {
        const body = (await res.json().catch(() => null)) as {
          detail?: { code?: string; detail?: string } | string;
        } | null;
        if (res.status === 429) {
          setServerError(
            typeof body?.detail === "object"
              ? (body.detail.detail ?? "Too many requests. Try again shortly.")
              : "Too many requests. Try again shortly.",
          );
          return;
        }
        if (res.status >= 500) {
          setServerError(
            "We can't reach our authentication service right now. Try again in a moment.",
          );
          return;
        }
      }

      router.push(
        `/forgot-password/sent?email=${encodeURIComponent(values.email)}`,
      );
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  return (
    <PublicShell>
      <Link
        href="/sign-in"
        className="mb-4 inline-flex items-center gap-1 text-[12.5px] text-textS hover:text-warm"
      >
        ← Back to sign in
      </Link>

      <h1 className="mb-1 font-display text-[24px] font-bold text-text">
        Reset password
      </h1>
      <p className="mb-5 text-[13px] leading-relaxed text-textS">
        Enter your email and we&apos;ll send a 6-digit code. It expires in
        1 hour.
      </p>

      {serverError ? (
        <div
          role="alert"
          className="mb-3 rounded-md border border-rose/40 bg-rose/10 px-3.5 py-2.5 text-[13px] text-rose"
        >
          {serverError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label htmlFor="email" className={FIELD_LABEL}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(FIELD, errors.email && "border-rose/60")}
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-[11px] text-rose">{errors.email.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          Send reset code
        </button>
      </form>
    </PublicShell>
  );
}
