"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Is my health data safe?",
    a: "All health data is end-to-end encrypted. We use AWS KMS and PostgreSQL row-level security. Your data never leaves EU servers.",
  },
  {
    q: "What do the AI agents actually do?",
    a: "Each life category has a dedicated AI agent — your Finance agent tracks bills and flags upcoming due dates, while your Health agent keeps on top of appointments and prescriptions. They work quietly in the background so you don't have to.",
  },
  {
    q: "Can I use it just for myself?",
    a: "Yes. Individual accounts have full access to all features, including AI agents. You can add family members any time.",
  },
  {
    q: "Can I trust AI agents with sensitive family data?",
    a: "Yes. AI agents only access data you've added to MyPal — they never connect to external accounts without your permission. All processing happens on encrypted data within our UK servers, and you can review or delete anything at any time.",
  },
  {
    q: "What if I want to cancel?",
    a: "Cancel any time. You can export all your data as JSON or CSV before leaving. Account deletion is permanent after a 30-day grace period.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="rounded-[11px] border border-border bg-card2"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-3.5 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-warm/60"
            >
              <span className="text-[13.5px] font-semibold text-text">
                {faq.q}
              </span>
              <span
                aria-hidden
                className={cn(
                  "ml-3 inline-block shrink-0 text-[11px] text-textS transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              >
                ▼
              </span>
            </button>
            {isOpen ? (
              <div
                id={`faq-panel-${i}`}
                role="region"
                className="px-3.5 pb-3 text-[12.5px] leading-[1.6] text-textS"
              >
                {faq.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
