import Link from "next/link";

import { ThemeToggle } from "@/components/shell/ThemeToggle";

/**
 * Page shell for unauthenticated routes (sign-in, sign-up, forgot-password,
 * verify). Provides the warm radial background, the brand mark + ThemeToggle
 * header row, and a centred narrow column for the form content.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-screen bg-bg px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,160,64,0.10), transparent 70%)",
        }}
      />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-warm to-rose text-[16px] shadow-md shadow-warm/30"
            >
              🤝
            </span>
            <span className="font-display text-[18px] font-bold text-warm">
              MyPal
            </span>
          </Link>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </main>
  );
}
