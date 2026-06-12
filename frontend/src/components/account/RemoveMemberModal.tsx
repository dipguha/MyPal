"use client";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  type MemberRow,
  useRemoveMember,
} from "@/hooks/useAccountMembers";

interface Props {
  member: MemberRow | null;
  onClose: () => void;
}

export function RemoveMemberModal({ member, onClose }: Props) {
  const remove = useRemoveMember();
  const isPending = member?.status === "invited" || member?.status === "expired";

  async function handleRemove() {
    if (!member) return;
    try {
      await remove.mutateAsync(member.id);
      toast.success(
        isPending
          ? `Invite for ${member.display_name} cancelled`
          : `${member.display_name} removed`,
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title={isPending ? "Cancel invite?" : `Remove ${member?.display_name}?`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={remove.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            loading={remove.isPending}
            className="!bg-gradient-to-br !from-rose !to-rose !shadow-rose/30"
          >
            {isPending ? "Cancel invite" : `Remove ${member?.display_name}`}
          </Button>
        </>
      }
    >
      {member ? (
        <>
          <div className="rounded-xl border border-border bg-card2 p-3">
            <div className="text-[13px] font-semibold text-text">
              {member.display_name}
            </div>
            <div className="text-[11.5px] text-textS">
              {member.role_label}
              {member.invited_email ? ` · ${member.invited_email}` : ""}
            </div>
          </div>
          {isPending ? (
            <p className="text-[12.5px] leading-relaxed text-textS">
              Cancelling this invite removes the pending row. They can be invited
              again at any time.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-textS">
              <li>
                • Their access to MyPal is revoked immediately on confirmation.
              </li>
              <li>
                • Their private data (journal entries, personal documents, health
                logs) is kept for 30 days before being permanently deleted.
              </li>
              <li>
                • Shared family data (tasks, notes, finances) remains in place.
              </li>
            </ul>
          )}
        </>
      ) : null}
    </Modal>
  );
}
