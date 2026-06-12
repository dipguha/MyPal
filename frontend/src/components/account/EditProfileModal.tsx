"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { type Profile, useUpdateProfile } from "@/hooks/useProfile";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: Profile;
}

export function EditProfileModal({ open, onClose, profile }: Props) {
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    date_of_birth: profile.date_of_birth ?? "",
    phone: profile.phone ?? "",
    home_address: profile.home_address ?? "",
    avatar_emoji: profile.avatar_emoji ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        display_name: profile.display_name ?? "",
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        phone: profile.phone ?? "",
        home_address: profile.home_address ?? "",
        avatar_emoji: profile.avatar_emoji ?? "",
      });
      setError(null);
    }
  }, [open, profile]);

  async function handleSave() {
    setError(null);
    try {
      await update.mutateAsync({
        display_name: form.display_name,
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        date_of_birth: form.date_of_birth || null,
        phone: form.phone || undefined,
        home_address: form.home_address || undefined,
        avatar_emoji: form.avatar_emoji || undefined,
      });
      toast.success("Profile saved");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={update.isPending}>
            Save
          </Button>
        </>
      }
    >
      <Input
        label="Display name"
        value={form.display_name}
        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
      />
      <Input
        label="Avatar emoji"
        value={form.avatar_emoji}
        placeholder="😀"
        onChange={(e) => setForm({ ...form, avatar_emoji: e.target.value })}
      />
      <Input
        label="First name"
        value={form.first_name}
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />
      <Input
        label="Last name"
        value={form.last_name}
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />
      <Input
        label="Date of birth"
        type="date"
        value={form.date_of_birth}
        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
      />
      <Input
        label="Phone number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <Input
        label="Home address"
        value={form.home_address}
        onChange={(e) => setForm({ ...form, home_address: e.target.value })}
      />
      {error ? <FormError>{error}</FormError> : null}
    </Modal>
  );
}
