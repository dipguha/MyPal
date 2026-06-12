"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/* ── shape ────────────────────────────────────────────────────────── */

type StepId =
  | "welcome"
  | "profile"
  | "family"
  | "briefing"
  | "interests"
  | "done";

interface OnboardingStatus {
  profile_complete: boolean;
  family_complete: boolean;
  briefing_complete: boolean;
  interests_complete: boolean;
  onboarding_complete: boolean;
  account_type: "solo" | "family";
}

// Spec R-03: invite-time roles are Adult Member, Teenager, Children.
// Admin is designated post-signup by the Owner (spec R-02).
type FamilyRole = "adult" | "teenager" | "child";

interface FamilyMemberDraft {
  name: string;
  role: FamilyRole;
  email: string;
}

const INDIVIDUAL_STEPS: StepId[] = [
  "welcome",
  "profile",
  "briefing",
  "interests",
  "done",
];
const FAMILY_STEPS: StepId[] = [
  "welcome",
  "profile",
  "family",
  "briefing",
  "interests",
  "done",
];

const STEP_LABEL: Record<StepId, string> = {
  welcome: "Welcome",
  profile: "Profile",
  family: "Family",
  briefing: "Briefing",
  interests: "Interests",
  done: "Done",
};

const ALL_INTERESTS = [
  "📸 Photography",
  "🚴 Cycling",
  "🍳 Cooking",
  "📚 Reading",
  "⚽ Football",
  "✈️ Travel",
  "💻 Technology",
  "🌱 Gardening",
  "🎵 Music",
  "🏃 Running",
  "🎮 Gaming",
  "🍷 Wine",
  "🎨 Art",
  "🧘 Yoga",
];

const NEWS_CATEGORIES = [
  "General",
  "Technology",
  "Finance",
  "Sport",
  "Health",
  "Local",
];

const COMMUTE_OPTIONS: { value: "drive" | "transit" | "cycle" | "walk"; label: string }[] = [
  { value: "drive", label: "🚗 Drive" },
  { value: "transit", label: "🚌 Transit" },
  { value: "cycle", label: "🚲 Cycle" },
  { value: "walk", label: "🚶 Walk" },
];

const AVATAR_EMOJIS = [
  "👩",
  "👨",
  "🧑",
  "👵",
  "👴",
  "👶",
  "🧒",
  "👧",
  "👦",
  "👨‍🦱",
  "👩‍🦰",
  "🧑‍🦳",
];

const MAX_INTERESTS = 5;
const MAX_FAMILY_MEMBERS = 5;

const ROLE_OPTIONS: { value: FamilyRole; label: string }[] = [
  { value: "adult", label: "Adult Member" },
  { value: "teenager", label: "Teenager" },
  { value: "child", label: "Children" },
];

/* ── shared UI ────────────────────────────────────────────────────── */

function StepBar({
  steps,
  currentIndex,
}: {
  steps: StepId[];
  currentIndex: number;
}) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold transition-colors",
                done
                  ? "bg-sage text-bg"
                  : active
                    ? "bg-warm text-bg"
                    : "bg-card2 text-textS",
              )}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "h-[2px] flex-1 rounded transition-colors",
                  done ? "bg-sage" : "bg-card2",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl bg-gradient-to-br from-warm to-rose px-5 py-3 text-[14px] font-semibold text-white shadow-md shadow-warm/30 transition hover:shadow-warm/50 disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full rounded-xl border border-border bg-card px-5 py-3 text-[14px] text-text transition hover:border-textS"
    >
      {children}
    </button>
  );
}

/* ── steps ────────────────────────────────────────────────────────── */

function StepWelcome({
  accountType,
  next,
}: {
  accountType: "solo" | "family";
  next: () => void;
}) {
  const tiles: [string, string, string][] =
    accountType === "family"
      ? [
          ["🧑", "Set up your profile", "Choose a display name and avatar"],
          ["👨‍👩‍👧‍👦", "Add family members", "Set up profiles for each person"],
          ["🌅", "Configure daily briefing", "Weather, commute, and news"],
          ["🎯", "Pick your interests", "Personalise your content feed"],
        ]
      : [
          ["🧑", "Set up your profile", "Choose a display name and avatar"],
          ["🌅", "Configure daily briefing", "Weather, commute, and news"],
          ["🎯", "Pick your interests", "Personalise your content feed"],
        ];
  return (
    <div>
      <div className="mb-3 text-[40px]">🎉</div>
      <h1 className="font-display text-[28px] font-bold text-text">
        Welcome to MyPal!
      </h1>
      <p className="mt-2 mb-5 text-[13.5px] leading-relaxed text-textS">
        Let&apos;s take 2 minutes to set up your account. You&apos;ll have your
        personalised family hub ready by the end.
      </p>
      <div className="space-y-2.5">
        {tiles.map(([icon, title, sub]) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl border border-border bg-card2 px-3 py-2.5"
          >
            <span className="text-[18px]">{icon}</span>
            <div>
              <div className="text-[13.5px] font-semibold text-text">{title}</div>
              <div className="text-[12px] text-textS">{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <PrimaryButton className="mt-5" onClick={next}>
        Let&apos;s go →
      </PrimaryButton>
    </div>
  );
}

function StepProfile({
  initialName,
  onSaved,
}: {
  initialName: string;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(initialName);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!emoji || !displayName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_emoji: emoji,
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save your profile — try again");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">
        Set up your profile
      </h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        Choose a display name and pick an avatar.
      </p>

      <div className="mb-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-textS">
          Display name
        </div>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 100))}
          placeholder="James"
          className="w-full rounded-xl border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-textS">
          Pick an avatar
        </div>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              className={cn(
                "grid h-12 w-full place-items-center rounded-lg border text-[24px] transition-colors",
                emoji === e
                  ? "border-warm bg-warm/15"
                  : "border-border bg-card2 hover:border-warm/40",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <PrimaryButton
        onClick={submit}
        disabled={!emoji || !displayName.trim() || submitting}
      >
        {submitting ? "Saving…" : "Continue"}
      </PrimaryButton>
    </div>
  );
}

function StepFamily({ onSaved }: { onSaved: () => void }) {
  const [members, setMembers] = useState<FamilyMemberDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addMember = () =>
    setMembers((m) => [...m, { name: "", role: "adult", email: "" }]);
  const removeMember = (i: number) =>
    setMembers((m) => m.filter((_, j) => j !== i));
  const update = (i: number, patch: Partial<FamilyMemberDraft>) =>
    setMembers((m) => m.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const submit = async () => {
    if (members.length === 0) {
      onSaved();
      return;
    }
    // Local validation: non-children require an email.
    for (const m of members) {
      if (!m.name.trim()) {
        toast.error("Please give each member a name");
        return;
      }
      if (m.role !== "child" && !m.email.trim()) {
        toast.error(`Email required for ${m.name || "this member"}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: members.map((m) => ({
            name: m.name.trim(),
            role: m.role,
            email: m.role === "child" ? undefined : m.email.trim(),
          })),
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save family members — try again");
        return;
      }
      toast.success(
        `${members.length} family member${
          members.length === 1 ? "" : "s"
        } added. Invitations will be sent shortly.`,
      );
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">
        Add family members
      </h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        Everyone gets their own private profile. Add more any time from My
        Account.
      </p>

      <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card2 px-3 py-2.5 opacity-60">
        <span className="text-[18px]">🧑</span>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-text">You</div>
        </div>
        <span className="rounded-full bg-warm/20 px-2 py-0.5 text-[10px] font-semibold text-warm">
          Owner
        </span>
      </div>

      {members.map((m, i) => (
        <div
          key={i}
          className="mb-2 rounded-xl border border-border bg-card2 p-3"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={m.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Name"
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
            />
            <select
              value={m.role}
              onChange={(e) =>
                update(i, { role: e.target.value as FamilyRole })
              }
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {m.role !== "child" ? (
            <input
              value={m.email}
              onChange={(e) => update(i, { email: e.target.value })}
              type="email"
              placeholder="email@example.com"
              className="mt-2 w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
            />
          ) : (
            <p className="mt-2 text-[11.5px] text-textS">
              No invitation — Children profiles are created without a login.
            </p>
          )}
          <button
            type="button"
            onClick={() => removeMember(i)}
            className="mt-2 text-[12px] text-rose hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      {members.length < MAX_FAMILY_MEMBERS ? (
        <button
          type="button"
          onClick={addMember}
          className="mb-4 w-full rounded-lg border border-dashed border-border bg-card2/50 py-2 text-[12.5px] font-medium text-textS hover:border-warm/60 hover:text-warm"
        >
          + Add member
        </button>
      ) : (
        <p className="mb-4 text-[12px] text-textS">
          Maximum of {MAX_FAMILY_MEMBERS} additional members reached.
        </p>
      )}

      <PrimaryButton onClick={submit} disabled={submitting}>
        {submitting ? "Saving…" : "Continue"}
      </PrimaryButton>
      <SecondaryButton onClick={onSaved}>Skip — add later</SecondaryButton>
    </div>
  );
}

function StepBriefing({ onSaved }: { onSaved: () => void }) {
  const [postcode, setPostcode] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [commute, setCommute] = useState<"drive" | "transit" | "cycle" | "walk">(
    "drive",
  );
  const [newsCategories, setNewsCategories] = useState<string[]>([
    "General",
    "Technology",
    "Sport",
  ]);
  const [submitting, setSubmitting] = useState(false);

  const toggleNews = (cat: string) =>
    setNewsCategories((cats) =>
      cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat],
    );

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/briefing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode: postcode.trim() || null,
          work_address: workAddress.trim() || null,
          commute_mode: commute,
          news_topics: newsCategories,
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save your briefing — try again");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  const fieldInput =
    "w-full rounded-xl border border-border bg-card2 px-3.5 py-2.5 text-[14px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20";
  const fieldLabel =
    "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-textS";

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">
        Set up Daily Briefing
      </h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        Your morning briefing — personalised to your life.
      </p>

      <div className="mb-3">
        <div className={fieldLabel}>Home postcode</div>
        <input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="NR32 1AA"
          className={fieldInput}
        />
      </div>

      <div className="mb-3">
        <div className={fieldLabel}>Work address (for commute)</div>
        <input
          value={workAddress}
          onChange={(e) => setWorkAddress(e.target.value)}
          placeholder="Norwich, NR1 3QD"
          className={fieldInput}
        />
      </div>

      <div className="mb-3">
        <div className={fieldLabel}>Commute mode</div>
        <div className="flex gap-2">
          {COMMUTE_OPTIONS.map((opt) => {
            const active = commute === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCommute(opt.value)}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-2 text-[12px] transition-colors",
                  active
                    ? "border-warm bg-warm/20 text-warm"
                    : "border-border bg-card2 text-textS hover:border-warm/40",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className={fieldLabel}>News categories</div>
        <div className="flex flex-wrap gap-1.5">
          {NEWS_CATEGORIES.map((cat) => {
            const active = newsCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleNews(cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] transition-colors",
                  active
                    ? "border-warm bg-warm/20 text-warm"
                    : "border-border bg-card2 text-textS hover:border-warm/40",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <PrimaryButton onClick={submit} disabled={submitting}>
        {submitting ? "Saving…" : "Continue"}
      </PrimaryButton>
      <SecondaryButton onClick={onSaved}>Skip for now</SecondaryButton>
    </div>
  );
}

function StepInterests({ onSaved }: { onSaved: () => void }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (tag: string) =>
    setInterests((cur) => {
      if (cur.includes(tag)) return cur.filter((t) => t !== tag);
      if (cur.length >= MAX_INTERESTS) return cur; // cap per spec F-06
      return [...cur, tag];
    });

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!res.ok) {
        toast.error("Couldn't save your interests — try again");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">
        Your interests
      </h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        MyPal will personalise your daily feed and find local events for you.
        Pick up to {MAX_INTERESTS}.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ALL_INTERESTS.map((tag) => {
          const active = interests.includes(tag);
          const atCap = !active && interests.length >= MAX_INTERESTS;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={atCap}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                active
                  ? "border-warm bg-warm/20 text-warm"
                  : "border-border bg-card2 text-textS hover:border-warm/40",
                atCap && "cursor-not-allowed opacity-50",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mb-4 text-[12px] text-textS">
        {interests.length} of {MAX_INTERESTS} selected
      </div>
      <PrimaryButton onClick={submit} disabled={submitting}>
        {submitting ? "Saving…" : "Finish setup"}
      </PrimaryButton>
      <SecondaryButton onClick={onSaved}>Skip — personalise later</SecondaryButton>
    </div>
  );
}

interface DoneSummary {
  profile: { complete: boolean; detail: string };
  family?: { complete: boolean; detail: string };
  briefing: { complete: boolean; detail: string };
  interests: { complete: boolean; detail: string };
}

function StepDone({
  summary,
  goToApp,
}: {
  summary: DoneSummary;
  goToApp: () => void;
}) {
  const rows: { complete: boolean; label: string; detail: string }[] = [
    { ...summary.profile, label: "Profile" },
    ...(summary.family ? [{ ...summary.family, label: "Family" }] : []),
    { ...summary.briefing, label: "Daily briefing" },
    { ...summary.interests, label: "Interests" },
  ];
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-warm to-rose text-[28px] shadow-lg shadow-warm/40">
        🎉
      </div>
      <h2 className="font-display text-[24px] font-bold text-text">
        You&apos;re all set!
      </h2>
      <p className="mx-auto mt-1 mb-5 max-w-sm text-[13.5px] leading-relaxed text-textS">
        MyPal is ready. You can fine-tune anything in My Account later.
      </p>
      <div className="space-y-2 text-left">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start gap-2 rounded-xl border border-border bg-card2 px-3 py-2 text-[13px]"
          >
            <span
              aria-hidden
              className={cn(
                "shrink-0 text-[14px]",
                r.complete ? "text-sage" : "text-textS/60",
              )}
            >
              {r.complete ? "✓" : "—"}
            </span>
            <div>
              <div className="font-semibold text-text">{r.label}</div>
              <div className="text-[12px] text-textS">{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <PrimaryButton className="mt-5" onClick={goToApp}>
        Enter MyPal →
      </PrimaryButton>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */

async function fetchStatus(): Promise<
  { ok: true; data: OnboardingStatus } | { ok: false; reason: string }
> {
  try {
    const res = await fetch("/api/onboarding/status", { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, reason: `Status request failed (HTTP ${res.status}).` };
    }
    return { ok: true, data: (await res.json()) as OnboardingStatus };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Network error.",
    };
  }
}

function firstIncompleteStep(
  status: OnboardingStatus,
  steps: StepId[],
): StepId {
  // Welcome is always the entry point; we only resume past Welcome.
  if (!status.profile_complete) return "profile";
  if (steps.includes("family") && !status.family_complete) return "family";
  if (!status.briefing_complete) return "briefing";
  if (!status.interests_complete) return "interests";
  return "done";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Returning users who have already finished onboarding shouldn't see the
  // wizard if they navigate to /onboarding directly.
  useEffect(() => {
    if (session?.user?.onboardingComplete) {
      router.replace("/today");
    }
  }, [session, router]);

  const reloadStatus = useCallback(async () => {
    const result = await fetchStatus();
    if (result.ok) {
      setStatus(result.data);
      setLoadError(null);
      return result.data;
    }
    setLoadError(result.reason);
    return null;
  }, []);

  // Initial load — fetch status, resume at the right step.
  useEffect(() => {
    (async () => {
      const s = await reloadStatus();
      if (s) {
        const steps = s.account_type === "family" ? FAMILY_STEPS : INDIVIDUAL_STEPS;
        const resume = firstIncompleteStep(s, steps);
        // Returning user with partial progress: skip Welcome and resume.
        if (
          resume !== "welcome" &&
          (s.profile_complete ||
            s.briefing_complete ||
            s.interests_complete ||
            (s.account_type === "family" && s.family_complete))
        ) {
          setCurrentStep(resume);
        }
      }
      setLoading(false);
    })();
  }, [reloadStatus]);

  const accountType = status?.account_type ?? session?.user?.accountType ?? "solo";
  const steps = accountType === "family" ? FAMILY_STEPS : INDIVIDUAL_STEPS;
  const currentIndex = steps.indexOf(currentStep);
  const initialName = session?.user?.name?.split(" ")[0] ?? "";

  const advance = async () => {
    await reloadStatus();
    const next = steps[currentIndex + 1] ?? "done";
    setCurrentStep(next);
  };

  const goToApp = async () => {
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) {
        // Surface the failure rather than silently sending the user to /today
        // with the flag still false (which loops them back to /onboarding on
        // next sign-in).
        toast.error(
          "Couldn't mark onboarding complete — please try again.",
        );
        return;
      }
      await updateSession();
    } catch {
      toast.error("Network error — please try again.");
      return;
    }
    router.push("/today");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="text-[13px] text-textS">Loading…</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-rose/40 bg-rose/10 p-5">
          <div className="font-display text-[16px] font-bold text-text">
            Couldn&apos;t load onboarding
          </div>
          <p className="mt-1 text-[12.5px] text-textS">
            {loadError ?? "Unknown error. Check your network connection."}
          </p>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              await reloadStatus();
              setLoading(false);
            }}
            className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] text-text hover:border-warm/60 hover:text-warm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const summary: DoneSummary = {
    profile: {
      complete: status.profile_complete,
      detail: status.profile_complete
        ? "Display name and avatar saved"
        : "Set up any time in My Account",
    },
    briefing: {
      complete: status.briefing_complete,
      detail: status.briefing_complete
        ? "Daily briefing ready"
        : "Set up any time in My Account",
    },
    interests: {
      complete: status.interests_complete,
      detail: status.interests_complete
        ? "Personalised feed ready"
        : "Set up any time in My Account",
    },
  };
  if (accountType === "family") {
    summary.family = {
      complete: status.family_complete,
      detail: status.family_complete
        ? "Members added — invitations will be sent shortly"
        : "No members added — set up any time in My Account",
    };
  }

  return (
    <div className="mx-auto max-w-xl">
      <StepBar steps={steps} currentIndex={currentIndex} />
      <Card>
        {currentStep === "welcome" ? (
          <StepWelcome
            accountType={accountType}
            next={() => setCurrentStep(steps[1])}
          />
        ) : null}
        {currentStep === "profile" ? (
          <StepProfile initialName={initialName} onSaved={advance} />
        ) : null}
        {currentStep === "family" ? <StepFamily onSaved={advance} /> : null}
        {currentStep === "briefing" ? <StepBriefing onSaved={advance} /> : null}
        {currentStep === "interests" ? (
          <StepInterests onSaved={advance} />
        ) : null}
        {currentStep === "done" ? (
          <StepDone summary={summary} goToApp={goToApp} />
        ) : null}
      </Card>
    </div>
  );
}
