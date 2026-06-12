"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PublicShell } from "@/components/ui/PublicShell";
import { cn } from "@/lib/cn";
import {
  PWD_BAR_COLOR,
  PWD_LABELS,
  PWD_TEXT_COLOR,
  pwdScore,
} from "@/lib/password-strength";

const ResetSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Needs an uppercase letter")
    .regex(/[a-z]/, "Needs a lowercase letter")
    .regex(/[0-9]/, "Needs a number")
    .regex(/[^A-Za-z0-9]/, "Needs a symbol"),
});

type FormValues = z.infer<typeof ResetSchema>;

const FIELD =
  "w-full rounded-[10px] border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none transition-colors placeholder:text-textS/70 focus:border-warm focus:ring-2 focus:ring-warm/20";

const FIELD_LABEL =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.06em] text-textS";

const COGNITO_ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "That code is incorrect. Please check and try again.",
  expired_code: "That code has expired. Request a new one.",
  weak_password:
    "Password is too weak — needs 8+ chars with upper, lower, number, and symbol.",
  rate_limited: "Too many attempts. Please try again shortly.",
  user_not_found: "We couldn't find an account with that email.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: initialEmail },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword") ?? "";
  const score = pwdScore(newPassword);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/public/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          new_password: values.newPassword,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          detail?: { code?: string; detail?: string } | string;
        } | null;
        const code =
          body && typeof body.detail === "object" ? body.detail.code : undefined;
        setServerError(
          (code && COGNITO_ERROR_MESSAGES[code]) ??
            "Couldn't reset your password. Please try again.",
        );
        return;
      }

      router.push("/sign-in?reset=1");
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  return (
    <PublicShell>
      <Link
        href="/forgot-password"
        className="mb-4 inline-flex items-center gap-1 text-[12.5px] text-textS hover:text-warm"
      >
        ← Wrong email? Start over
      </Link>

      <h1 className="mb-1 font-display text-[24px] font-bold text-text">
        Choose a new password
      </h1>
      <p className="mb-5 text-[13px] leading-relaxed text-textS">
        Enter the 6-digit code from the email plus your new password.
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
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={cn(FIELD, errors.email && "border-rose/60")}
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-[11px] text-rose">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="code" className={FIELD_LABEL}>
            6-digit code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className={cn(
              FIELD,
              "text-center text-[18px] tracking-[0.45em]",
              errors.code && "border-rose/60",
            )}
            {...register("code")}
          />
          {errors.code ? (
            <p className="mt-1 text-[11px] text-rose">{errors.code.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="newPassword" className={FIELD_LABEL}>
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className={cn(FIELD, errors.newPassword && "border-rose/60")}
            {...register("newPassword")}
          />
          {newPassword ? (
            <>
              <div className="mt-1.5 h-1 overflow-hidden rounded bg-border">
                <div
                  className={cn(
                    "h-full rounded transition-all duration-500",
                    PWD_BAR_COLOR[score],
                  )}
                  style={{ width: `${score * 25}%` }}
                />
              </div>
              <div
                className={cn(
                  "mt-1 text-[11px] font-semibold",
                  PWD_TEXT_COLOR[score],
                )}
              >
                {PWD_LABELS[score]}
              </div>
            </>
          ) : null}
          {errors.newPassword ? (
            <p className="mt-1 text-[11px] text-rose">
              {errors.newPassword.message}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-textS">
              8+ chars with upper, lower, number, and symbol.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          Set new password
        </button>

        <div className="mt-3 text-center text-[12.5px] text-textS">
          <Link href="/sign-in" className="text-warm hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </PublicShell>
  );
}
