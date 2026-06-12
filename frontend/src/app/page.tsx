import Link from "next/link";
import { redirect } from "next/navigation";

import { FaqAccordion } from "@/components/home/FaqAccordion";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

import { auth } from "../../auth";

const FEATURES = [
  { icon: "🌅", label: "Daily Briefing" },
  { icon: "🏥", label: "Family Health" },
  { icon: "💳", label: "Bills & Finance" },
  { icon: "📔", label: "Daily Journal" },
  { icon: "✈️", label: "Travel Planner" },
  { icon: "🐾", label: "Pet Care" },
  { icon: "📄", label: "Documents Vault" },
  { icon: "🎯", label: "Hobbies Feed" },
];

const STATS = [
  { v: "11", l: "Life categories" },
  { v: "6", l: "Members per family" },
  { v: "Free", l: "To get started" },
];

const PRIVACY = [
  "End-to-end encrypted health and financial data",
  "GDPR compliant — UK data centres",
  "Your data is never sold to advertisers",
  "Delete your account and all data at any time",
];

const PLANS = [
  {
    name: "Individual",
    price: "£2.99",
    accent: "teal" as const,
    features: [
      "1 member",
      "All 11 categories",
      "Daily AI briefing",
      "Generous document storage",
    ],
    cta: "Start 14-day free",
  },
  {
    name: "Family",
    price: "£4.99",
    accent: "warm" as const,
    features: [
      "Up to 6 members",
      "Everything in Individual",
      "Family sharing controls",
      "Priority support",
      "Unlimited storage",
    ],
    cta: "Start 14-day free",
  },
];

const ACCENT_CLASSES: Record<
  "teal" | "warm",
  { border: string; text: string; tick: string }
> = {
  teal: { border: "border-teal/30", text: "text-teal", tick: "text-teal" },
  warm: { border: "border-warm/40", text: "text-warm", tick: "text-warm" },
};

export default async function Home() {
  // Signed-in visitors get sent straight to the app — no flash of marketing.
  const session = await auth();
  if (session) redirect("/today");

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-warm to-rose text-[15px] shadow-md shadow-warm/30"
            >
              🤝
            </span>
            <span className="font-display text-lg font-bold text-warm">
              MyPal
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="rounded-[10px] bg-gradient-to-br from-warm to-rose px-3.5 py-2 text-[13px] font-semibold text-white shadow-md shadow-warm/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-warm/50 sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-[10px] bg-gradient-to-br from-warm to-rose px-3.5 py-2 text-[13px] font-semibold text-white shadow-md shadow-warm/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-warm/50 sm:px-4"
            >
              Sign up free
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 pb-12 pt-16 text-center sm:px-10 sm:pt-24"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,160,64,0.12), transparent 70%)",
        }}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-warm">
          Introducing MyPal
        </p>
        <h1 className="font-display text-[40px] font-black leading-[1.1] sm:text-5xl">
          <span className="bg-gradient-to-br from-text to-warm bg-clip-text text-transparent">
            Your Family&apos;s
            <br />
            Command Centre
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[1.7] text-textS">
          The average parent juggles 6 different apps for things that should
          live in one place. MyPal&apos;s AI agents replace them all — health,
          finances, travel, pets, and your daily family life, beautifully
          organised so you can focus on what matters.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 inline-block rounded-xl bg-gradient-to-br from-warm to-rose px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-warm/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-warm/50"
        >
          Get started free — no card needed
        </Link>
        <p className="mt-4 text-xs text-textS">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-warm hover:underline">
            Sign in →
          </Link>
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-6 pb-20 pt-8 sm:px-8">
        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.l}
              className="rounded-[13px] border border-border bg-card px-4 py-5 text-center"
            >
              <div className="font-display text-3xl font-black text-warm">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-textS">{s.l}</div>
            </div>
          ))}
        </div>

        {/* What we solve */}
        <h2 className="mb-1.5 font-display text-xl font-bold text-text">
          What problems we solve
        </h2>
        <p className="mb-4 text-[13px] leading-[1.7] text-textS">
          The average parent juggles 6 different apps for things that should
          live in one place. MyPal&apos;s AI agents replace them all.
        </p>
        <div className="mb-8 flex flex-wrap gap-1.5">
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-textS"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </span>
          ))}
        </div>

        {/* Privacy */}
        <section className="mb-6 rounded-[13px] border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-[22px]">🔒</span>
            <h3 className="font-display text-base font-bold text-text">
              Security &amp; Privacy First
            </h3>
          </div>
          <ul className="space-y-2">
            {PRIVACY.map((line) => (
              <li
                key={line}
                className="flex items-center gap-2.5 text-[13px] text-textS"
              >
                <span aria-hidden className="text-sage">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Plans */}
        <h2 className="mb-3 font-display text-lg font-bold text-text">
          Simple pricing
        </h2>
        <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {PLANS.map((p) => {
            const c = ACCENT_CLASSES[p.accent];
            return (
              <div
                key={p.name}
                className={`flex flex-col rounded-[13px] border bg-card p-4 ${c.border}`}
              >
                <div className={`font-display text-[17px] font-bold ${c.text}`}>
                  {p.name}
                </div>
                <div className="mb-2 mt-1 font-display text-[26px] font-black text-text">
                  {p.price}
                  <span className="text-[14px] font-normal text-textS">
                    /mo
                  </span>
                </div>
                <span className="mb-3 inline-block self-start rounded-[8px] bg-sage/15 px-2 py-0.5 text-[11px] font-semibold text-sage">
                  14 days free, no card needed
                </span>
                <ul className="flex-1 space-y-1.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[12.5px] text-textS"
                    >
                      <span aria-hidden className={c.tick}>
                        ✓
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-4 block w-full rounded-[11px] bg-gradient-to-br from-warm to-rose px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-warm/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-warm/50"
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <h2 className="mb-3 font-display text-base font-bold text-text">
          Common questions
        </h2>
        <FaqAccordion />

        {/* Closing CTA */}
        <section className="mt-6 rounded-[13px] border border-warm/30 bg-warm/10 p-7 text-center">
          <h2 className="mb-2 font-display text-[20px] font-bold text-text">
            Ready to bring some calm to family life?
          </h2>
          <p className="mx-auto mb-5 max-w-md text-[13px] leading-[1.6] text-textS">
            Try free for 14 days — no credit card needed. Add family members
            any time.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-xl bg-gradient-to-br from-warm to-rose px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-warm/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-warm/50"
          >
            Start 14-day free
          </Link>
          <p className="mt-3 text-xs text-textS">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-warm hover:underline">
              Sign in →
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
