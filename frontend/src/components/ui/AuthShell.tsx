import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      {/* atmospheric backdrop — subtle warm + teal radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, rgba(232,160,64,0.10) 0%, transparent 60%)," +
            "radial-gradient(50% 50% at 0% 100%, rgba(56,196,180,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-display text-lg tracking-tight text-warm"
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-warm shadow-[0_0_18px_3px_rgba(232,160,64,0.5)]"
          />
          MyDigitalPal
        </Link>

        <div className="rounded-xl border border-border bg-card/80 p-7 backdrop-blur">
          <header className="mb-6">
            <h1 className="font-display text-3xl leading-tight text-text">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-textS">{subtitle}</p>
            ) : null}
          </header>
          {children}
        </div>

        {footer ? <div className="mt-5 text-center text-sm text-textS">{footer}</div> : null}
      </div>
    </main>
  );
}
