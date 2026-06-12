"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { InviteModal } from "@/components/account/InviteModal";
import { RemoveMemberModal } from "@/components/account/RemoveMemberModal";
import { BtnSm } from "@/components/ui/BtnSm";
import {
  type BatchMemberChange,
  type MemberRow,
  type TargetRoleCode,
  useAccountMembers,
  useBatchSaveMembers,
  useResendInvite,
  useRemoveMember,
} from "@/hooks/useAccountMembers";
import { type RoleCode } from "@/lib/access";
import { cn } from "@/lib/cn";

/** Short labels for the inline role dropdown — mirrors prototype ROLE_SHORT_AC. */
const ROLE_DROPDOWN: { value: TargetRoleCode; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "adult", label: "Adult" },
  { value: "teenager", label: "Teen" },
  { value: "child", label: "Child" },
];

/**
 * Tailwind colour classes per role for the avatar gradient. Mirrors the
 * prototype's per-member `color` token (T.warm / T.rose / T.teal / T.violet
 * / T.sky / T.sage) without leaking hex literals into this file. The
 * production frontend uses theme tokens; the prototype uses inline T.xxx.
 */
const ROLE_AVATAR: Record<RoleCode, { from: string; to: string }> = {
  owner: { from: "from-warm", to: "to-rose" },
  admin: { from: "from-rose", to: "to-warm" },
  adult: { from: "from-teal", to: "to-sage" },
  teenager: { from: "from-violet", to: "to-sky" },
  child: { from: "from-sky", to: "to-teal" },
};

function formatDDMonYYYY(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

export default function Page() {
  const {
    data: members = [],
    isLoading,
    error,
  } = useAccountMembers({ includeRemoved: true });

  const viewer = members.find((m) => m.is_self);
  const viewerRole = viewer?.role_code;
  const isOwner = viewerRole === "owner";

  // Staged diffs (member_id → new role / new hmg). Cleared on save / discard.
  const [stagedRoles, setStagedRoles] = useState<Record<string, TargetRoleCode>>({});
  const [stagedHmg, setStagedHmg] = useState<Record<string, boolean>>({});
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null);

  const batchSave = useBatchSaveMembers();
  const resend = useResendInvite();
  const cancelInvite = useRemoveMember();

  const activeAndPending = useMemo(
    () => members.filter((m) => m.status !== "removed"),
    [members],
  );
  const removedMembers = useMemo(
    () => members.filter((m) => m.status === "removed"),
    [members],
  );
  const pendingInvites = useMemo(
    () =>
      members.filter(
        (m) => m.status === "invited" || m.status === "expired",
      ),
    [members],
  );
  const activeRoster = useMemo(
    () => members.filter((m) => m.status === "active"),
    [members],
  );
  const allRosterRows = useMemo(
    () => [...activeRoster, ...removedMembers],
    [activeRoster, removedMembers],
  );

  function effectiveRole(m: MemberRow): RoleCode {
    return (stagedRoles[m.id] as RoleCode) ?? m.role_code;
  }
  function effectiveHmg(m: MemberRow): boolean {
    if (m.id in stagedHmg) return stagedHmg[m.id];
    return m.in_hmg;
  }
  function isDirty(m: MemberRow): boolean {
    return (
      m.id in stagedRoles ||
      (m.id in stagedHmg && stagedHmg[m.id] !== m.in_hmg)
    );
  }
  const hasFMChanges = members.some(isDirty);

  function changeRole(m: MemberRow, newRole: TargetRoleCode) {
    setStagedRoles((prev) =>
      m.role_code === newRole
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== m.id))
        : { ...prev, [m.id]: newRole },
    );
    // HMG auto-clear when role moves off Adult/Admin (Owner/Admin are
    // never in stagedHmg directly — their HMG is derived from role).
    if (newRole !== "adult" && newRole !== "admin") {
      setStagedHmg((prev) => ({ ...prev, [m.id]: false }));
    }
  }

  function toggleHmg(m: MemberRow, checked: boolean) {
    setStagedHmg((prev) =>
      checked === m.in_hmg
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== m.id))
        : { ...prev, [m.id]: checked },
    );
  }

  function discardChanges() {
    setStagedRoles({});
    setStagedHmg({});
  }

  async function saveChanges() {
    const memberIds = new Set<string>([
      ...Object.keys(stagedRoles),
      ...Object.keys(stagedHmg),
    ]);
    const changes: BatchMemberChange[] = [];
    for (const id of memberIds) {
      const change: BatchMemberChange = { member_id: id };
      if (id in stagedRoles) change.role_code = stagedRoles[id];
      if (id in stagedHmg) change.in_hmg = stagedHmg[id];
      changes.push(change);
    }
    if (changes.length === 0) return;
    try {
      await batchSave.mutateAsync(changes);
      setStagedRoles({});
      setStagedHmg({});
      toast.success("Changes saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  function canRemove(m: MemberRow): boolean {
    if (m.is_self) return false;
    if (viewerRole === "owner") return true;
    if (viewerRole === "admin") return m.role_code !== "owner";
    return false;
  }

  async function handleResend(m: MemberRow) {
    try {
      await resend.mutateAsync(m.id);
      toast.success(`Invite to ${m.display_name} resent`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleCancelInvite(m: MemberRow) {
    try {
      await cancelInvite.mutateAsync(m.id);
      toast.success(`Invite for ${m.display_name} cancelled`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  if (isLoading) return <p className="text-textS">Loading members…</p>;
  if (error) {
    return (
      <p className="text-rose">
        Couldn&apos;t load household members. Are you an Owner or Admin?
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-textS">
          Family Members · {activeRoster.length}
          {removedMembers.length > 0 ? (
            <span className="ml-2 text-[11px] font-medium normal-case tracking-normal text-textS">
              ({removedMembers.length} removed)
            </span>
          ) : null}
        </div>

        {allRosterRows.map((m) => (
          <MemberRowView
            key={m.id}
            member={m}
            effectiveRole={effectiveRole(m)}
            effectiveHmg={effectiveHmg(m)}
            isDirty={isDirty(m)}
            canRemove={canRemove(m)}
            onChangeRole={(r) => changeRole(m, r)}
            onToggleHmg={(c) => toggleHmg(m, c)}
            onRemove={() => setRemoveTarget(m)}
          />
        ))}

        {pendingInvites.length > 0 ? (
          <div className="mt-3.5 border-t border-border pt-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-textS">
              Pending Invites
            </div>
            {pendingInvites.map((inv) => (
              <PendingInviteRow
                key={inv.id}
                invite={inv}
                onResend={() => handleResend(inv)}
                onCancel={() => handleCancelInvite(inv)}
                resendBusy={resend.isPending}
                cancelBusy={cancelInvite.isPending}
              />
            ))}
          </div>
        ) : null}

        {hasFMChanges ? (
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
            <BtnSm onClick={discardChanges} disabled={batchSave.isPending}>
              Discard
            </BtnSm>
            <BtnSm
              tone="warm"
              onClick={saveChanges}
              disabled={batchSave.isPending}
            >
              {batchSave.isPending ? "Saving…" : "Save changes"}
            </BtnSm>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-2",
            hasFMChanges ? "mt-2" : "mt-3",
          )}
        >
          <BtnSm
            tone="warm"
            fullWidth
            onClick={() => setInviting(true)}
            disabled={activeAndPending.length >= 6}
          >
            + Invite family member
          </BtnSm>
          <BtnSm fullWidth>📧 Refer a friend — get 1 month free</BtnSm>
        </div>
      </section>

      <InviteModal
        open={inviting}
        onClose={() => setInviting(false)}
        activeAndPendingCount={activeAndPending.length}
        canAssignAdmin={isOwner}
      />
      <RemoveMemberModal
        member={removeTarget}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}

interface MemberRowViewProps {
  member: MemberRow;
  effectiveRole: RoleCode;
  effectiveHmg: boolean;
  isDirty: boolean;
  canRemove: boolean;
  onChangeRole: (r: TargetRoleCode) => void;
  onToggleHmg: (checked: boolean) => void;
  onRemove: () => void;
}

function MemberRowView({
  member,
  effectiveRole,
  effectiveHmg,
  isDirty,
  canRemove,
  onChangeRole,
  onToggleHmg,
  onRemove,
}: MemberRowViewProps) {
  const isRemoved = member.status === "removed";
  // HMG checkbox state: Owner/Admin are always in HMG (and uneditable); Adult
  // is editable; Teen/Child/Owner/Admin/Removed are disabled. Owner can't be
  // shown with edit controls anyway.
  const hmgChecked =
    effectiveRole === "owner" || effectiveRole === "admin"
      ? true
      : effectiveRole === "adult"
        ? effectiveHmg
        : false;
  const hmgEditable =
    !isRemoved && effectiveRole === "adult" && !member.is_self;
  const hmgDisabled = !hmgEditable;
  const avatar = ROLE_AVATAR[effectiveRole];

  return (
    <div
      className={cn(
        "-mx-3 flex items-center gap-2.5 border-l-[3px] px-3 py-2.5 transition-colors",
        "border-b border-b-border last:border-b-transparent",
        isRemoved
          ? "border-l-border opacity-50"
          : isDirty
            ? "border-l-warm bg-warm/15"
            : "border-l-transparent",
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-surface bg-gradient-to-br text-white",
          avatar.from,
          avatar.to,
        )}
        style={{ fontSize: 14 }}
      >
        {member.avatar_emoji || member.display_name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text">
          {member.display_name}
          {member.is_self ? (
            <span className="ml-1.5 text-[10px] font-semibold text-warm">
              (You)
            </span>
          ) : null}
        </div>
        <div className="text-[11.5px] text-textS">
          {(effectiveRole === "adult" ||
            effectiveRole === "teenager" ||
            effectiveRole === "child") &&
          member.age !== null
            ? `${member.age} yrs`
            : ""}
        </div>
      </div>

      {isRemoved ? (
        <span className="whitespace-nowrap rounded-md bg-rose/20 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-rose">
          Removed
        </span>
      ) : (
        <>
          <label
            className={cn(
              "mr-2 flex items-center gap-1 whitespace-nowrap text-[11px]",
              hmgDisabled ? "text-textS" : "text-warm",
              hmgEditable ? "cursor-pointer" : "cursor-default",
            )}
          >
            <input
              type="checkbox"
              checked={hmgChecked}
              disabled={hmgDisabled}
              onChange={(e) => onToggleHmg(e.target.checked)}
              className="accent-warm"
            />
            HMG
          </label>
          {member.is_self ? (
            <span className="whitespace-nowrap text-[12px] text-textS">
              {ROLE_DROPDOWN.find((r) => r.value === effectiveRole)?.label ??
                member.role_label}
            </span>
          ) : (
            <select
              value={effectiveRole}
              onChange={(e) => onChangeRole(e.target.value as TargetRoleCode)}
              className="cursor-pointer rounded-md border border-border bg-card2 px-2 py-0.5 text-[12px] text-text outline-none"
            >
              {ROLE_DROPDOWN.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              title="Remove from household"
              aria-label={`Remove ${member.display_name}`}
              className="ml-2 rounded-md p-0.5 text-[14px] leading-none text-rose opacity-70 transition-opacity hover:opacity-100"
            >
              🗑️
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

interface PendingInviteRowProps {
  invite: MemberRow;
  onResend: () => void;
  onCancel: () => void;
  resendBusy: boolean;
  cancelBusy: boolean;
}

function PendingInviteRow({
  invite,
  onResend,
  onCancel,
  resendBusy,
  cancelBusy,
}: PendingInviteRowProps) {
  const isExpired = invite.status === "expired";
  return (
    <div className="flex items-start gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-dashed border-border bg-card2 text-[14px]">
        ✉️
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-text">
          {invite.display_name}
        </div>
        <div className="text-[11.5px] text-textS">
          {invite.invited_email ?? "—"} · {invite.role_label}
        </div>
        <div className="mt-px text-[11px] text-textS">
          Sent {formatDDMonYYYY(invite.last_invited_at ?? invite.invited_at)}
        </div>
      </div>
      <div className="flex flex-none flex-col items-end gap-1.5">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
            isExpired ? "bg-amber/15 text-amber" : "bg-teal/15 text-teal",
          )}
        >
          {isExpired ? "Expired" : "Pending"}
        </span>
        <div className="flex gap-1.5">
          <BtnSm onClick={onResend} disabled={resendBusy}>
            Resend
          </BtnSm>
          <BtnSm tone="rose" onClick={onCancel} disabled={cancelBusy}>
            Cancel
          </BtnSm>
        </div>
      </div>
    </div>
  );
}
