"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  type InviteRoleCode,
  useInviteMember,
} from "@/hooks/useAccountMembers";
import { cn } from "@/lib/cn";

const HOUSEHOLD_SLOT_CAP = 6;

const ROLES: { value: InviteRoleCode; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "adult", label: "Adult Member" },
  { value: "teenager", label: "Teenager" },
  { value: "child", label: "Child" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Active + invited member count (excludes removed) — drives slot remaining. */
  activeAndPendingCount: number;
  /** True if the viewer is the Owner. Admin role can only be assigned by Owner. */
  canAssignAdmin: boolean;
}

export function InviteModal({
  open,
  onClose,
  activeAndPendingCount,
  canAssignAdmin,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRoleCode>("adult");
  const [error, setError] = useState<string | null>(null);
  const invite = useInviteMember();
  const slotsLeft = Math.max(0, HOUSEHOLD_SLOT_CAP - activeAndPendingCount);

  async function handleSubmit() {
    setError(null);
    try {
      await invite.mutateAsync({
        full_name: name,
        email: role === "child" ? null : email,
        role_code: role,
      });
      toast.success(role === "child" ? "Child added" : "Invitation sent");
      setName("");
      setEmail("");
      setRole("adult");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("email_in_use")) {
        setError("This email is already a member of your family.");
      } else {
        setError(msg);
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite family member"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={invite.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={invite.isPending}
            disabled={
              !name ||
              (role !== "child" && !email) ||
              slotsLeft <= 0
            }
          >
            {role === "child" ? "Add child" : "Send invite"}
          </Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-textS">
        {role === "child"
          ? "Add a child profile to your household. No email required — children sign in via a household manager."
          : "Send an invitation by email. They'll be asked to create an account or sign in, then join your family."}
      </p>
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Sarah Smith"
      />
      <Input
        label={role === "child" ? "Email (not used for children)" : "Email address"}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={role === "child"}
        placeholder="e.g. sarah@example.com"
      />
      <div>
        <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-textS">
          Role
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const active = role === r.value;
            const disabled = r.value === "admin" && !canAssignAdmin;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => !disabled && setRole(r.value)}
                disabled={disabled}
                title={
                  disabled ? "Only the Owner can promote a member to Admin" : ""
                }
                className={cn(
                  "rounded-md border px-3.5 py-1 text-[12.5px] transition-colors",
                  active
                    ? "border-warm bg-warm/15 font-semibold text-warm"
                    : "border-border text-textS hover:text-warm",
                  disabled && "cursor-not-allowed opacity-40 hover:text-textS",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 text-[11.5px] text-textS">
          {slotsLeft > 0
            ? `${slotsLeft} of ${HOUSEHOLD_SLOT_CAP} slots remaining on your Family Plan`
            : `Family Plan is full (${HOUSEHOLD_SLOT_CAP} of ${HOUSEHOLD_SLOT_CAP} slots used)`}
        </div>
      </div>
      {error ? <FormError>{error}</FormError> : null}
    </Modal>
  );
}
