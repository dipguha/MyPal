"use client";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useUpdateProfile } from "@/hooks/useProfile";
import { INTEREST_TAGS } from "@/lib/interests";

interface Props {
  open: boolean;
  onClose: () => void;
  selected: string[];
}

export function AddHobbyModal({ open, onClose, selected }: Props) {
  const update = useUpdateProfile();
  const available = INTEREST_TAGS.filter(
    (t) => !selected.includes(`${t.emoji} ${t.tag}`),
  );

  async function add(label: string) {
    try {
      await update.mutateAsync({ interests: [...selected, label] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Interests"
      footer={
        <Button onClick={onClose}>Done</Button>
      }
    >
      <p className="text-[12px] text-textS">
        Tap an interest to add it to your profile.
      </p>
      {available.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-textS">
          You&apos;ve added all available interests!
        </div>
      ) : (
        <div className="flex max-h-[40vh] flex-wrap gap-2 overflow-y-auto">
          {available.map((t) => {
            const label = `${t.emoji} ${t.tag}`;
            return (
              <button
                key={t.tag}
                onClick={() => add(label)}
                className="rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-[12px] text-textS hover:border-warm/60 hover:text-warm"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
