"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { AddHobbyModal } from "@/components/account/AddHobbyModal";
import { EditProfileModal } from "@/components/account/EditProfileModal";
import {
  DOC_TYPE_META,
  IdentityDocModal,
} from "@/components/account/IdentityDocModal";
import { BtnSm } from "@/components/ui/BtnSm";
import {
  type IdentityDocType,
  type IdentityDocument,
  useIdentityDocuments,
} from "@/hooks/useIdentityDocuments";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/cn";
import { formatGB, monthsUntil } from "@/lib/dates";

const SINGLETON_DOC_TYPES: IdentityDocType[] = [
  "passport",
  "driving_licence",
  "national_insurance",
  "brp",
  "ghic",
  "oci_card",
];

function expiryColor(
  expiry: string | null,
  hasExpiry: boolean,
): { dot: string; sub: string } {
  if (!hasExpiry || !expiry) return { dot: "bg-textM", sub: "text-textS" };
  const months = monthsUntil(expiry);
  if (months === null) return { dot: "bg-textM", sub: "text-textS" };
  if (months < 0) return { dot: "bg-rose", sub: "text-rose" };
  if (months <= 3) return { dot: "bg-amber", sub: "text-amber" };
  return { dot: "bg-sage", sub: "text-textS" };
}

const BILLING_HISTORY = [
  { date: "14-May-2026", desc: "Family Plan — May 2026", amt: "£4.99" },
  { date: "14-Apr-2026", desc: "Family Plan — Apr 2026", amt: "£4.99" },
  { date: "14-Mar-2026", desc: "Family Plan — Mar 2026", amt: "£4.99" },
  { date: "14-Feb-2026", desc: "Family Plan — Feb 2026", amt: "£4.99" },
  { date: "14-Jan-2026", desc: "Family Plan — Jan 2026", amt: "£4.99" },
];

export default function Page() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: docs = [] } = useIdentityDocuments();

  const [editing, setEditing] = useState(false);
  const [addHobby, setAddHobby] = useState(false);
  const [idocsOpen, setIdocsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [docModal, setDocModal] = useState<{
    type: IdentityDocType;
    existing: IdentityDocument | null;
  } | null>(null);

  const expiringCount = useMemo(() => {
    let n = 0;
    for (const d of docs) {
      const months = monthsUntil(d.expiry_date);
      if (months !== null && months <= 3 && months >= 0) n += 1;
    }
    return n;
  }, [docs]);

  if (isLoading || !profile) {
    return <p className="text-textS">Loading profile…</p>;
  }

  const docByType = new Map(docs.map((d) => [d.doc_type, d]));
  const interests = profile.interests ?? [];

  async function toggleInterest(tag: string) {
    const next = interests.includes(tag)
      ? interests.filter((t) => t !== tag)
      : [...interests, tag];
    try {
      await updateProfile.mutateAsync({ interests: next });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Identity card */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-3.5">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-warm to-rose text-[24px]">
            {profile.avatar_emoji || "👤"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[18px] font-bold leading-tight text-text">
              {profile.full_name || profile.display_name}
            </div>
            <div className="truncate text-[12.5px] text-textS">
              {profile.email}
              {profile.phone ? ` · ${profile.phone}` : ""}
            </div>
          </div>
          <BtnSm onClick={() => setEditing(true)}>Edit</BtnSm>
        </div>
        <ProfileMetaRow
          label="Home address"
          value={profile.home_address || "—"}
        />
        <ProfileMetaRow
          label="Date of birth"
          value={profile.date_of_birth ? formatGB(profile.date_of_birth) : "—"}
        />
        <ProfileMetaRow
          label="Account type"
          value="Family Plan"
          last
        />
      </section>

      {/* 2. Identity Documents */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setIdocsOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textS">
              🪪 Identity Documents
            </span>
            {!idocsOpen && expiringCount > 0 ? (
              <span className="rounded-md bg-amber/15 px-1.5 py-0.5 text-[10px] font-bold text-amber">
                {expiringCount} expiring soon
              </span>
            ) : null}
          </div>
          <span
            aria-hidden
            className={cn(
              "text-[13px] text-textS transition-transform",
              idocsOpen && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>
        {idocsOpen ? (
          <div className="mt-3">
            {docs.map((d) => {
              const meta = DOC_TYPE_META[d.doc_type];
              const colors = expiryColor(d.expiry_date, meta.hasExpiry);
              const subline = [
                d.country,
                meta.hasExpiry
                  ? d.expiry_date
                    ? `Expires ${formatGB(d.expiry_date)}`
                    : "No expiry on file"
                  : "No expiry",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2.5 border-b border-border py-2"
                >
                  <span
                    className={cn(
                      "inline-block h-2 w-2 flex-none rounded-full",
                      colors.dot,
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-text">
                      {d.doc_label || meta.label}
                    </div>
                    <div className={cn("text-[11.5px]", colors.sub)}>
                      {subline || "—"}
                    </div>
                  </div>
                  <BtnSm
                    onClick={() =>
                      setDocModal({ type: d.doc_type, existing: d })
                    }
                  >
                    Edit
                  </BtnSm>
                </div>
              );
            })}
            {SINGLETON_DOC_TYPES.filter((t) => !docByType.has(t)).map((t) => {
              const meta = DOC_TYPE_META[t];
              return (
                <button
                  key={t}
                  onClick={() => setDocModal({ type: t, existing: null })}
                  className="flex w-full items-center gap-2.5 border-b border-border py-2 text-left text-[12px] text-textS hover:text-warm last:border-b-0"
                >
                  <span className="w-2 flex-none text-center text-[14px] text-textM">
                    +
                  </span>
                  <span>Add {meta.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setDocModal({ type: "other", existing: null })}
              className="flex w-full items-center gap-2.5 py-2 text-left text-[12px] text-textS hover:text-warm"
            >
              <span className="w-2 flex-none text-center text-[14px] text-textM">
                +
              </span>
              <span>Add other document</span>
            </button>
          </div>
        ) : null}
      </section>

      {/* 3. Hobbies & Interests */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-textS">
          🎯 Hobbies &amp; Interests
        </div>
        <div className="mb-2.5 text-[12px] text-textS">
          Tap to remove — MyPal AI personalises suggestions based on your
          interests.
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {interests.map((t) => (
            <button
              key={t}
              onClick={() => toggleInterest(t)}
              className="rounded-full border-[1.5px] border-warm bg-warm/15 px-3.5 py-1 text-[13px] text-warm hover:bg-warm/25"
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setAddHobby(true)}
            className="rounded-full border-[1.5px] border-dashed border-border bg-card2 px-3.5 py-1 text-[13px] text-textS hover:border-warm/40 hover:text-text"
          >
            + Add
          </button>
        </div>
        <div className="text-[11.5px] text-textM">
          {interests.length} active
        </div>
      </section>

      {/* 4. My Plan */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setPlanOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textS">
              💳 My Plan
            </span>
            {!planOpen ? (
              <span className="rounded-md bg-warm/15 px-1.5 py-0.5 text-[10px] font-bold text-warm">
                Family · Active
              </span>
            ) : null}
          </div>
          <span
            aria-hidden
            className={cn(
              "text-[13px] text-textS transition-transform",
              planOpen && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>
        {planOpen ? (
          <div className="mt-2.5">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="font-display text-[16px] font-bold text-warm">
                Family Plan
              </div>
              <span className="rounded-md bg-warm/15 px-1.5 py-0.5 text-[10px] font-bold text-warm">
                Active
              </span>
              <BtnSm className="ml-auto">Manage plan</BtnSm>
            </div>
            <ProfileMetaRow label="Monthly cost" value="£4.99" />
            <ProfileMetaRow label="Next renewal" value="14-Jun-2026" />
            <ProfileMetaRow label="Members" value="— of 6" />
            <ProfileMetaRow label="Payment method" value="Visa •••• 4231" last />
          </div>
        ) : null}
      </section>

      {/* 5. Billing History */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setBillingOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-textS">
            🧾 Billing History
          </span>
          <span
            aria-hidden
            className={cn(
              "text-[13px] text-textS transition-transform",
              billingOpen && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>
        {billingOpen ? (
          <div className="mt-2.5">
            {BILLING_HISTORY.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-b border-border py-2 last:border-b-0"
              >
                <span className="w-[80px] flex-none text-[11.5px] text-textS">
                  {r.date}
                </span>
                <span className="flex-1 text-[13px] text-text">{r.desc}</span>
                <span className="rounded-md bg-sage/15 px-1.5 py-0.5 text-[10px] font-semibold text-sage">
                  Paid
                </span>
                <span className="w-[40px] text-right text-[13px] font-semibold text-text">
                  {r.amt}
                </span>
                <BtnSm className="text-[11px]">Receipt</BtnSm>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* 6. MyPal AI banner */}
      <div className="rounded-md border border-teal/30 bg-teal/15 px-3 py-2.5 text-[12.5px] leading-relaxed text-textS">
        <strong className="text-teal">🤖 MyPal AI:</strong> Your profile is 80%
        complete — add a profile photo and emergency contact to finish setup.
        <span className="ml-2 cursor-pointer font-semibold text-teal">
          Complete →
        </span>
      </div>

      <EditProfileModal
        open={editing}
        onClose={() => setEditing(false)}
        profile={profile}
      />
      <AddHobbyModal
        open={addHobby}
        onClose={() => setAddHobby(false)}
        selected={interests}
      />
      {docModal ? (
        <IdentityDocModal
          open
          onClose={() => setDocModal(null)}
          docType={docModal.type}
          existing={docModal.existing}
        />
      ) : null}
    </div>
  );
}

function ProfileMetaRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2",
        !last && "border-b border-border",
      )}
    >
      <span className="w-[110px] flex-none text-[12px] text-textS">
        {label}
      </span>
      <span className="text-[13px] text-text">{value}</span>
    </div>
  );
}
