"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

/* ── shape ────────────────────────────────────────────────────────── */

// No Profile step (spec v1.3) — display name comes from sign-up, avatar from
// My Account → My Profile. Child mirrors Teenager.
type StepId = "welcome" | "family" | "briefing" | "interests" | "done";

type Role = "owner" | "admin" | "adult" | "grandparent" | "teenager" | "child";
type Plan = "solo" | "family";

interface OnboardingStatus {
  role: Role;
  plan: Plan;
  steps: StepId[];
  family_complete: boolean;
  briefing_complete: boolean;
  interests_complete: boolean;
  onboarding_complete: boolean;
  invitation_warning: boolean;
}

// Roles an Owner/Admin may assign to an added member (spec §4).
type FamilyRole = "admin" | "adult" | "grandparent" | "teenager" | "child";

interface FamilyMemberDraft {
  name: string;
  role: FamilyRole;
  email: string;
}

interface FamilyResult {
  created: number;
  invited: number;
  invitation_failures: number;
}

const STEP_LABEL: Record<StepId, string> = {
  welcome: "Welcome",
  family: "Family",
  briefing: "Briefing",
  interests: "Interests",
  done: "Done",
};

// Mirrors OnboardingStatusService.steps_for — the server is the source of
// truth; this is the pre-render fallback.
function computeSteps(role: Role, plan: Plan): StepId[] {
  const canFamily = (role === "owner" || role === "admin") && plan === "family";
  return [
    "welcome",
    ...(canFamily ? (["family"] as StepId[]) : []),
    "briefing",
    "interests",
    "done",
  ];
}

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

const ROLE_OPTIONS: { value: FamilyRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "adult", label: "Adult Member" },
  { value: "grandparent", label: "Grand Parent" },
  { value: "teenager", label: "Teenager" },
  { value: "child", label: "Children" },
];

const MAX_INTERESTS = 5;
const MAX_FAMILY_MEMBERS = 5;

/* ── shared UI ────────────────────────────────────────────────────── */

function StepBar({ steps, currentIndex }: { steps: StepId[]; currentIndex: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              aria-current={active ? "step" : undefined}
              aria-label={STEP_LABEL[s]}
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

const fieldLabel = "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-textS";

/* ── steps ────────────────────────────────────────────────────────── */

function StepWelcome({ steps, next }: { steps: StepId[]; next: () => void }) {
  const tiles: [string, string, string][] = [];
  if (steps.includes("family"))
    tiles.push(["👨‍👩‍👧‍👦", "Add family members", "Set up profiles for each person"]);
  tiles.push(["🌅", "Configure daily briefing", "Weather, commute, and news"]);
  tiles.push(["🎯", "Pick your interests", "Personalise your content feed"]);

  return (
    <div>
      <div className="mb-3 text-[40px]">🎉</div>
      <h1 className="font-display text-[28px] font-bold text-text">Welcome to MyPal!</h1>
      <p className="mt-2 mb-5 text-[13.5px] leading-relaxed text-textS">
        Let&apos;s take a minute to set up your account. You&apos;ll have your
        personalised hub ready by the end.
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
      <Button className="mt-5" fullWidth onClick={next}>
        Let&apos;s go →
      </Button>
    </div>
  );
}

function StepFamily({
  onSaved,
}: {
  onSaved: (result?: FamilyResult) => void;
}) {
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
    // Local validation: every member needs a name; non-children need an email.
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
      const res = await fetch("/api/onboarding/family_members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: members.map((m) => ({
            name: m.name.trim(),
            role: m.role,
            email: m.email.trim(),
          })),
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save family members — try again");
        return;
      }
      const result = (await res.json()) as FamilyResult;
      toast.success(
        `${result.created} family member${result.created === 1 ? "" : "s"} added.`,
      );
      onSaved(result);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">Add family members</h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        Everyone gets their own private profile. Add more any time from My Account.
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

      {members.map((m, i) => {
        const isChild = m.role === "child";
        return (
          <div key={i} className="mb-2 rounded-xl border border-border bg-card2 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={m.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                aria-label="Member name"
                className="rounded-lg border border-border/60 bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
              />
              <div className="relative">
                <select
                  value={m.role}
                  onChange={(e) => update(i, { role: e.target.value as FamilyRole })}
                  aria-label="Member role"
                  className="w-full appearance-none rounded-lg border border-border/60 bg-card px-3 py-2 pr-8 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-textS">
                  ▾
                </span>
              </div>
            </div>
            <input
              value={m.email}
              onChange={(e) => update(i, { email: e.target.value })}
              type="email"
              placeholder={isChild ? "email@example.com (optional)" : "email@example.com"}
              aria-label="Member email"
              className="mt-2 w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-warm focus:ring-2 focus:ring-warm/20"
            />
            {isChild ? (
              <p className="mt-1 text-[11.5px] text-textS">
                Leave blank if the child does not have an email address.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => removeMember(i)}
              className="mt-2 text-[12px] text-rose hover:underline"
            >
              Remove
            </button>
          </div>
        );
      })}

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
          Maximum of {MAX_FAMILY_MEMBERS} additional members reached (6 including you).
        </p>
      )}

      <Button fullWidth loading={submitting} onClick={submit}>
        Continue
      </Button>
      <Button className="mt-2" variant="secondary" fullWidth onClick={() => onSaved()}>
        Skip — add later
      </Button>
    </div>
  );
}

function StepBriefing({ onSaved }: { onSaved: () => void }) {
  const [postcode, setPostcode] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [commute, setCommute] = useState<"drive" | "transit" | "cycle" | "walk">("drive");
  const [newsTopics, setNewsTopics] = useState<string[]>(["General", "Technology", "Sport"]);
  const [submitting, setSubmitting] = useState(false);

  const toggleNews = (cat: string) =>
    setNewsTopics((cats) =>
      cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat],
    );

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/briefing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_postcode: postcode.trim() || null,
          work_address: workAddress.trim() || null,
          commute_mode: commute,
          news_topics: newsTopics,
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

  return (
    <div>
      <h2 className="font-display text-[22px] font-bold text-text">Set up Daily Briefing</h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        Your morning briefing — personalised to your life.
      </p>

      <div className="mb-3">
        <Input
          label="Home postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="NR32 1AA"
        />
      </div>

      <div className="mb-3">
        <Input
          label="Work address (for commute)"
          value={workAddress}
          onChange={(e) => setWorkAddress(e.target.value)}
          placeholder="Norwich, NR1 3QD"
        />
      </div>

      <div className="mb-3">
        <div className={fieldLabel}>Commute mode</div>
        <div className="flex flex-wrap gap-2">
          {COMMUTE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={commute === opt.value}
              onClick={() => setCommute(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className={fieldLabel}>News categories</div>
        <div className="flex flex-wrap gap-1.5">
          {NEWS_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={newsTopics.includes(cat)}
              onClick={() => toggleNews(cat)}
            />
          ))}
        </div>
      </div>

      <Button fullWidth loading={submitting} onClick={submit}>
        Continue
      </Button>
      <Button className="mt-2" variant="secondary" fullWidth onClick={onSaved}>
        Skip for now
      </Button>
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
      <h2 className="font-display text-[22px] font-bold text-text">Your interests</h2>
      <p className="mt-1 mb-4 text-[13px] text-textS">
        MyPal will personalise your daily feed and find local events for you. Pick up
        to {MAX_INTERESTS}.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ALL_INTERESTS.map((tag) => {
          const active = interests.includes(tag);
          const atCap = !active && interests.length >= MAX_INTERESTS;
          return (
            <Chip
              key={tag}
              label={tag}
              selected={active}
              disabled={atCap}
              onClick={() => toggle(tag)}
            />
          );
        })}
      </div>
      <div className="mb-4 text-[12px] text-textS">
        {interests.length} of {MAX_INTERESTS} selected
      </div>
      <Button fullWidth loading={submitting} onClick={submit}>
        Finish setup
      </Button>
      <Button className="mt-2" variant="secondary" fullWidth onClick={onSaved}>
        Skip — personalise later
      </Button>
    </div>
  );
}

interface DoneRow {
  key: string;
  label: string;
  complete: boolean;
  detail: string;
}

function StepDone({
  rows,
  invitationWarning,
  goToApp,
  finishing,
}: {
  rows: DoneRow[];
  invitationWarning: boolean;
  goToApp: () => void;
  finishing: boolean;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-warm to-rose text-[28px] shadow-lg shadow-warm/40">
        🎉
      </div>
      <h2 className="font-display text-[24px] font-bold text-text">You&apos;re all set!</h2>
      <p className="mx-auto mt-1 mb-5 max-w-sm text-[13.5px] leading-relaxed text-textS">
        MyPal is ready. You can fine-tune anything in My Account later.
      </p>
      <div className="space-y-2 text-left">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-start gap-2 rounded-xl border border-border bg-card2 px-3 py-2 text-[13px]"
          >
            <span
              aria-hidden
              className={cn("shrink-0 text-[14px]", r.complete ? "text-sage" : "text-textS/60")}
            >
              {r.complete ? "✓" : "—"}
            </span>
            <div>
              <div className="font-semibold text-text">{r.label}</div>
              <div className="text-[12px] text-textS">{r.detail}</div>
            </div>
          </div>
        ))}
        {invitationWarning ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-[13px]">
            <span aria-hidden className="shrink-0 text-[14px] text-amber">
              !
            </span>
            <div>
              <div className="font-semibold text-text">Some invitations couldn&apos;t be sent</div>
              <div className="text-[12px] text-textS">Retry in My Account → Family Members.</div>
            </div>
          </div>
        ) : null}
      </div>
      <Button className="mt-5" fullWidth loading={finishing} onClick={goToApp}>
        Enter MyPal →
      </Button>
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
    return { ok: false, reason: err instanceof Error ? err.message : "Network error." };
  }
}

function firstIncompleteStep(status: OnboardingStatus): StepId {
  // Welcome is the entry point; we only resume past it.
  if (status.steps.includes("family") && !status.family_complete) return "family";
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
  const [invitationWarning, setInvitationWarning] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Returning users who already finished onboarding shouldn't see the wizard.
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
        const resume = firstIncompleteStep(s);
        const hasProgress =
          s.briefing_complete ||
          s.interests_complete ||
          (s.steps.includes("family") && s.family_complete);
        if (resume !== "welcome" && hasProgress) setCurrentStep(resume);
      }
      setLoading(false);
    })();
  }, [reloadStatus]);

  const steps = status
    ? status.steps.length
      ? status.steps
      : computeSteps(status.role, status.plan)
    : (["welcome"] as StepId[]);
  const currentIndex = steps.indexOf(currentStep);

  const advance = async () => {
    await reloadStatus();
    const next = steps[currentIndex + 1] ?? "done";
    setCurrentStep(next);
  };

  const onFamilySaved = async (result?: FamilyResult) => {
    if (result && result.invitation_failures > 0) setInvitationWarning(true);
    await advance();
  };

  const goToApp = async () => {
    setFinishing(true);
    try {
      const res = await fetch("/api/onboarding/complete", { method: "PATCH" });
      if (!res.ok) {
        toast.error("Couldn't mark onboarding complete — please try again.");
        return;
      }
      await updateSession();
    } catch {
      toast.error("Network error — please try again.");
      return;
    } finally {
      setFinishing(false);
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
          <Button
            className="mt-3"
            variant="secondary"
            onClick={async () => {
              setLoading(true);
              await reloadStatus();
              setLoading(false);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const doneRows: DoneRow[] = [];
  if (steps.includes("family")) {
    doneRows.push({
      key: "family",
      label: "Family",
      complete: status.family_complete,
      detail: status.family_complete
        ? "Members added — invitations on their way"
        : "Add members any time in My Account",
    });
  }
  doneRows.push({
    key: "briefing",
    label: "Daily briefing",
    complete: status.briefing_complete,
    detail: status.briefing_complete
      ? "Your morning briefing is ready"
      : "Set up any time in My Account",
  });
  doneRows.push({
    key: "interests",
    label: "Interests",
    complete: status.interests_complete,
    detail: status.interests_complete
      ? "Your feed is personalised"
      : "Set up any time in My Account",
  });

  return (
    <div className="mx-auto max-w-xl">
      <StepBar steps={steps} currentIndex={currentIndex} />
      <Card>
        {currentStep === "welcome" ? (
          <StepWelcome steps={steps} next={() => setCurrentStep(steps[1])} />
        ) : null}
        {currentStep === "family" ? <StepFamily onSaved={onFamilySaved} /> : null}
        {currentStep === "briefing" ? <StepBriefing onSaved={advance} /> : null}
        {currentStep === "interests" ? <StepInterests onSaved={advance} /> : null}
        {currentStep === "done" ? (
          <StepDone
            rows={doneRows}
            invitationWarning={invitationWarning}
            goToApp={goToApp}
            finishing={finishing}
          />
        ) : null}
      </Card>
    </div>
  );
}
