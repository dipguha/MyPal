"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const SignUpSchema = z.object({
  firstName: z.string().min(1, "Required").max(80),
  lastName: z.string().min(1, "Required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Needs an uppercase letter")
    .regex(/[a-z]/, "Needs a lowercase letter")
    .regex(/[0-9]/, "Needs a number")
    .regex(/[^A-Za-z0-9]/, "Needs a symbol"),
  phone: z.string().max(30).optional().or(z.literal("")),
  accountType: z.enum(["solo", "family"]),
  agreed: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms to continue" }),
  }),
  marketingOptIn: z.boolean().optional(),
});

type FormValues = z.infer<typeof SignUpSchema>;

type ServerError = { code: string; detail: string };

const DRAFT_KEY = "mypal-signup-draft";

interface DraftState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accountType: "solo" | "family";
  marketingOptIn?: boolean;
}

const FIELD =
  "w-full rounded-[10px] border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none transition-colors placeholder:text-textS/70 focus:border-warm focus:ring-2 focus:ring-warm/20";

const FIELD_LABEL =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[.06em] text-textS";

const PLAN_LABEL = { solo: "Individual", family: "Family" } as const;
const PLAN_PRICE = { solo: "£2.99/mo", family: "£4.99/mo" } as const;

function loadDraft(): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftState) : null;
  } catch {
    return null;
  }
}

function saveDraft(d: DraftState): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      accountType: "family",
      agreed: undefined as unknown as true,
      marketingOptIn: false,
    },
    mode: "onBlur",
  });

  const accountType = watch("accountType");
  const password = watch("password") ?? "";
  const agreed = watch("agreed") === true;
  const score = pwdScore(password);

  // Restore the draft (e.g. after "Wrong email? Go back" on the verify page).
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    reset({
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      password: "",
      phone: draft.phone ?? "",
      accountType: draft.accountType,
      agreed: undefined as unknown as true,
      marketingOptIn: draft.marketingOptIn ?? false,
    });
    setStep(1);
  }, [reset]);

  const chooseType = (type: "solo" | "family") => {
    setValue("accountType", type, { shouldValidate: false });
    setStep(1);
  };

  async function onSubmit(values: FormValues) {
    setServerError(null);

    // Stash non-secret values so "Wrong email? Go back" can restore the form.
    saveDraft({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      accountType: values.accountType,
      marketingOptIn: values.marketingOptIn ?? false,
    });

    try {
      const res = await fetch("/api/public/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone || undefined,
          marketing_opt_in: values.marketingOptIn ?? false,
          account_type: values.accountType,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          detail?: ServerError | string;
        } | null;
        const err =
          body && typeof body.detail === "object"
            ? (body.detail as ServerError)
            : null;
        if (err?.code === "email_taken") {
          setError("email", { message: err.detail });
        } else if (err?.code === "weak_password") {
          setError("password", { message: err.detail });
        } else {
          setServerError(err?.detail ?? "Something went wrong. Please try again.");
        }
        return;
      }

      router.push(`/sign-up/verify?email=${encodeURIComponent(values.email)}`);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  /* ── Step 0 — pick plan + Google placeholder ─────────────────── */
  if (step === 0) {
    return (
      <PublicShell>
        <h1 className="mb-1 font-display text-[26px] font-bold text-text">
          Create your account
        </h1>
        <p className="mb-5 text-[13px] text-textS">
          How would you like to use MyPal?
        </p>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlanCard
            type="solo"
            accent="teal"
            price="£2.99"
            description="Personal account. Full access to all features. Add family members any time."
            onSelect={chooseType}
          />
          <PlanCard
            type="family"
            accent="warm"
            price="£4.99"
            description="Shared account for up to 6 members. Individual private profiles for each person."
            onSelect={chooseType}
          />
        </div>

        <div className="my-4 flex items-center gap-3 text-[12px] text-textS">
          <span className="h-px flex-1 bg-border" />
          or sign up with
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled
          title="Google sign-up is coming soon"
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-[11px] border border-border bg-card2 px-4 py-3 text-[13.5px] font-medium text-text opacity-60"
        >
          <span className="w-5 text-center text-[16px] font-bold">G</span>
          <span>Continue with Google</span>
          <span className="ml-auto text-[12px] text-textS">soon</span>
        </button>

        <div className="mt-5 text-center text-[13px] text-textS">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-warm hover:underline">
            Sign in
          </Link>
        </div>
      </PublicShell>
    );
  }

  /* ── Step 1 — details form ───────────────────────────────────── */
  return (
    <PublicShell>
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            clearDraft();
            setStep(0);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card2 px-3 py-1 text-[12px] text-text hover:border-warm/60 hover:text-warm"
        >
          ← Back
        </button>
        <span className="rounded-full bg-warm/10 px-2.5 py-0.5 text-[12px] font-semibold text-warm">
          Creating {PLAN_LABEL[accountType]} account
        </span>
      </div>

      {/* Plan reminder strip */}
      <div className="mb-5 rounded-[10px] border border-warm/30 bg-warm/10 px-4 py-2.5 text-[12.5px] text-text">
        <span className="font-semibold">
          {PLAN_LABEL[accountType]} · {PLAN_PRICE[accountType]}
        </span>{" "}
        <span className="text-textS">— 14 days free, no card needed</span>
      </div>

      <h1 className="mb-1 font-display text-[22px] font-bold text-text">
        Your details
      </h1>
      <p className="mb-5 text-[13px] text-textS">
        Create your personal profile
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {serverError ? (
          <div
            role="alert"
            className="rounded-md border border-rose/40 bg-rose/10 px-3.5 py-2.5 text-[13px] text-rose"
          >
            {serverError}
          </div>
        ) : null}

        <input type="hidden" {...register("accountType")} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={FIELD_LABEL}>
              First name
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              placeholder="James"
              className={cn(FIELD, errors.firstName && "border-rose/60")}
              {...register("firstName")}
            />
            {errors.firstName ? (
              <p className="mt-1 text-[11px] text-rose">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="lastName" className={FIELD_LABEL}>
              Last name
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              placeholder="Smith"
              className={cn(FIELD, errors.lastName && "border-rose/60")}
              {...register("lastName")}
            />
            {errors.lastName ? (
              <p className="mt-1 text-[11px] text-rose">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={FIELD_LABEL}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="james@example.com"
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
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className={cn(FIELD, errors.password && "border-rose/60")}
            {...register("password")}
          />
          {password ? (
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
          {errors.password ? (
            <p className="mt-1 text-[11px] text-rose">
              {errors.password.message}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-textS">
              8+ chars with upper, lower, number, and symbol.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={FIELD_LABEL}>
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+44 7700 900000"
            className={cn(FIELD, errors.phone && "border-rose/60")}
            {...register("phone")}
          />
          <p className="mt-1 text-[11px] text-textS">
            Optional — used for account recovery.
          </p>
          {errors.phone ? (
            <p className="mt-1 text-[11px] text-rose">{errors.phone.message}</p>
          ) : null}
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border bg-card2 accent-warm"
            {...register("agreed")}
          />
          <span className="text-[12.5px] leading-relaxed text-textS">
            I agree to MyPal&apos;s{" "}
            <span className="text-warm">Terms of Service</span> and{" "}
            <span className="text-warm">Privacy Policy</span>
          </span>
        </label>
        {errors.agreed ? (
          <p className="text-[11px] text-rose">{errors.agreed.message}</p>
        ) : null}

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border bg-card2 accent-warm"
            {...register("marketingOptIn")}
          />
          <span className="text-[12.5px] leading-relaxed text-textS">
            Send me helpful tips and product updates (optional)
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !agreed}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-lg hover:shadow-warm/50 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          Create account &amp; continue
        </button>

        <Link
          href="/"
          className="mt-2 block w-full rounded-xl border border-border bg-card px-5 py-2.5 text-center text-[13.5px] text-text transition hover:border-textS"
        >
          Back to home
        </Link>
      </form>
    </PublicShell>
  );
}

/* ── plan card ────────────────────────────────────────────────── */

interface PlanCardProps {
  type: "solo" | "family";
  accent: "teal" | "warm";
  price: string;
  description: string;
  onSelect: (t: "solo" | "family") => void;
}

function PlanCard({ type, accent, price, description, onSelect }: PlanCardProps) {
  const accentText = accent === "teal" ? "text-teal" : "text-warm";
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="flex flex-col rounded-[13px] border border-border bg-card p-5 text-left transition-colors hover:border-warm/60"
    >
      <div className={cn("font-display text-[17px] font-bold", accentText)}>
        {PLAN_LABEL[type]}
      </div>
      <div className="mb-2 mt-1 font-display text-[26px] font-black text-text">
        {price}
        <span className="text-[14px] font-normal text-textS">/mo</span>
      </div>
      <span className="mb-3 inline-block self-start rounded-[8px] bg-sage/15 px-2 py-0.5 text-[11px] font-semibold text-sage">
        14 days free, no card needed
      </span>
      <p className="text-[12px] leading-relaxed text-textS">{description}</p>
    </button>
  );
}

