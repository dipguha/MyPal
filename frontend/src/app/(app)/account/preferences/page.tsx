"use client";

import { useState } from "react";

import { BtnSm } from "@/components/ui/BtnSm";
import { useTheme } from "@/components/shell/ThemeProvider";
import { cn } from "@/lib/cn";
import { useUpdateMemberSettings } from "@/hooks/useMemberSettings";

type Theme = "light" | "system" | "dark";

const THEME_OPTIONS: { icon: string; label: string; value: Theme }[] = [
  { icon: "☀️", label: "Light", value: "light" },
  { icon: "💻", label: "System", value: "system" },
  { icon: "🌙", label: "Dark", value: "dark" },
];

const NOTIF_ROWS = [
  { t: "Daily briefing", sub: "Morning summary at 8:00am", on: true },
  { t: "Task reminders", sub: "Due and overdue tasks", on: true },
  { t: "Bill due dates", sub: "3 days before payment", on: true },
  { t: "Health appointments", sub: "24 hours before", on: true },
  { t: "Family activity", sub: "When family members add items", on: false },
];

const LANG_ROWS = [
  { l: "Language", v: "English (UK)" },
  { l: "Date format", v: "DD-Mon-YYYY" },
  { l: "Currency", v: "GBP (£)" },
  { l: "Time zone", v: "Europe/London" },
];

export default function Page() {
  const { theme, setTheme } = useTheme();
  const update = useUpdateMemberSettings();
  const [open, setOpen] = useState({ lang: true, appear: false, notif: false });
  const toggle = (k: keyof typeof open) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="flex flex-col gap-3">
      <PrefSection
        icon="🌐"
        label="Language & Region"
        open={open.lang}
        onToggle={() => toggle("lang")}
      >
        {LANG_ROWS.map((f) => (
          <div
            key={f.l}
            className="flex items-center gap-2 border-b border-border py-2 last:border-b-0"
          >
            <span className="flex-1 text-[13px] text-text">{f.l}</span>
            <span className="mr-2 text-[13px] text-textS">{f.v}</span>
            <BtnSm disabled title="Coming in a future update">
              Change
            </BtnSm>
          </div>
        ))}
      </PrefSection>

      <PrefSection
        icon="🎨"
        label="Appearance"
        open={open.appear}
        onToggle={() => toggle("appear")}
      >
        <div className="flex items-center gap-2 py-1">
          <span className="flex-1 text-[13px] text-text">Theme</span>
          <div className="flex gap-1.5">
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    update.mutate({ theme: opt.value });
                  }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[12px] transition-colors",
                    active
                      ? "border-warm/50 bg-warm/15 font-semibold text-warm"
                      : "border-border bg-card2 text-textS hover:text-warm",
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </PrefSection>

      <PrefSection
        icon="🔔"
        label="Notifications"
        open={open.notif}
        onToggle={() => toggle("notif")}
      >
        <div className="relative pointer-events-none opacity-60">
          <span className="absolute -top-1 right-0 z-[1] rounded-md bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber">
            ✦ Phase 2
          </span>
          {NOTIF_ROWS.map((s) => (
            <div
              key={s.t}
              className="flex items-center gap-2 border-b border-border py-2 last:border-b-0"
            >
              <div className="flex-1">
                <div className="text-[13px] text-text">{s.t}</div>
                <div className="text-[11.5px] text-textS">{s.sub}</div>
              </div>
              <Switch on={s.on} />
            </div>
          ))}
        </div>
      </PrefSection>
    </div>
  );
}

function PrefSection({
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  icon: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-textS">
          {icon} {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "text-[13px] text-textS transition-transform",
            open && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>
      {open ? <div className="mt-2.5">{children}</div> : null}
    </section>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <div
      className={cn(
        "flex h-5 w-9 items-center rounded-full p-0.5",
        on ? "bg-sage" : "bg-border",
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-full bg-white",
          on ? "ml-auto" : "ml-0",
        )}
      />
    </div>
  );
}
