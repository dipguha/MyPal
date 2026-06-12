"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PublicShell } from "@/components/ui/PublicShell";
import { cn } from "@/lib/cn";

const SignInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof SignInSchema>;

const COGNITO_ERROR_MESSAGES: Record<string, string> = {
  NotAuthorizedException: "Incorrect email or password.",
  UserNotFoundException: "Incorrect email or password.",
  UserNotConfirmedException:
    "Please verify your email before signing in. Check your inbox for the 6-digit code we sent.",
  PasswordResetRequiredException:
    "You need to reset your password before you can sign in.",
  TooManyRequestsException: "Too many attempts. Please try again shortly.",
  ConfigError: "Sign-in isn't configured yet for this environment.",
};

const FIELD =
  "w-full rounded-[10px] border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none transition-colors placeholder:text-textS/70 focus:border-warm focus:ring-2 focus:ring-warm/20";

const FIELD_LABEL =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.06em] text-textS";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/today";
  const verified = params.get("verified") === "1";
  const reset = params.get("reset") === "1";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (res?.error) {
      setServerError(
        COGNITO_ERROR_MESSAGES[res.error] ??
          "Sign-in failed. Please check your details and try again.",
      );
      return;
    }
    // Read the freshly issued JWT so we can route onboarding-aware.
    const session = await getSession();
    const target = session?.user?.onboardingComplete
      ? callbackUrl
      : "/onboarding";
    router.push(target);
    router.refresh();
  }

  return (
    <PublicShell>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[12.5px] text-textS hover:text-warm"
      >
        ← Back to home
      </Link>

      <h1 className="mb-1 font-display text-[26px] font-bold text-text">
        Welcome back
      </h1>
      <p className="mb-5 text-[13px] text-textS">
        Sign in to your MyPal account
      </p>

      {verified ? (
        <div
          role="status"
          className="mb-4 rounded-md border border-sage/40 bg-sage/10 px-3.5 py-3 text-[13px] text-sage"
        >
          Email verified! You can now sign in.
        </div>
      ) : null}

      {reset ? (
        <div
          role="status"
          className="mb-4 rounded-md border border-sage/40 bg-sage/10 px-3.5 py-3 text-[13px] text-sage"
        >
          Password reset! Sign in with your new password.
        </div>
      ) : null}

      {/* Google placeholder (deferred — see _plans/sign-in_tech.md) */}
      <button
        type="button"
        disabled
        title="Google sign-in is coming soon"
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-[11px] border border-border bg-card2 px-4 py-3 text-[13.5px] font-medium text-text opacity-60"
      >
        <span className="w-5 text-center text-[16px] font-bold">G</span>
        <span>Continue with Google</span>
        <span className="ml-auto text-[12px] text-textS">soon</span>
      </button>

      <div className="my-4 flex items-center gap-3 text-[12px] text-textS">
        <span className="h-px flex-1 bg-border" />
        or sign in with email
        <span className="h-px flex-1 bg-border" />
      </div>

      {serverError ? (
        <div
          role="alert"
          className="mb-3 rounded-md border border-rose/40 bg-rose/10 px-3.5 py-2.5 text-[13px] text-rose"
        >
          {serverError}{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-warm hover:underline"
          >
            Forgot your password?
          </Link>
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
            placeholder="you@example.com"
            className={cn(FIELD, errors.email && "border-rose/60")}
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-[11px] text-rose">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className={FIELD_LABEL}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(FIELD, errors.password && "border-rose/60")}
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1 text-[11px] text-rose">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-[12.5px] text-warm hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          Sign in
        </button>
      </form>

      <div
        aria-disabled
        className="mt-4 flex items-center justify-center gap-2 rounded-[10px] border border-border bg-card2/50 px-4 py-2 text-[12.5px] text-textS"
        title="Phone sign-in is coming soon"
      >
        <span aria-hidden>📱</span>
        Sign in with phone
        <span className="rounded-full bg-card px-2 py-px text-[10px] font-semibold text-textS">
          coming soon
        </span>
      </div>

      <div className="mt-5 text-center text-[13px] text-textS">
        New to MyPal?{" "}
        <Link href="/sign-up" className="text-warm hover:underline">
          Create account
        </Link>
      </div>
    </PublicShell>
  );
}
