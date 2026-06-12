"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { BtnSm } from "@/components/ui/BtnSm";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  type PrivacySettings,
  useMemberSettings,
  useUpdateMemberSettings,
} from "@/hooks/useMemberSettings";
import { useChangePassword, useLoginMethods } from "@/hooks/useSecurity";
import { useRevokeSession, useSessions } from "@/hooks/useSessions";
import { cn } from "@/lib/cn";

const PROVIDER_META = {
  email: { icon: "✉️", label: "Email" },
  google: { icon: "🇬", label: "Google" },
  phone: { icon: "📱", label: "Phone (SMS)" },
  apple: { icon: "🍎", label: "Apple" },
} as const;

const PRIVACY_LABELS: { key: keyof PrivacySettings; label: string }[] = [
  { key: "share_health_summary", label: "Share health summary with family" },
  { key: "journal_visible_to_partner", label: "Journal visible to partner" },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-3">
      <LoginMethodsCard />
      <TwoFactorCard />
      <ActiveSessionsCard />
      <PasswordCard />
      <PrivacyCard />
      <YourDataCard />
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-textS">
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0">
      {children}
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <div
      className={cn(
        "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
        on ? "bg-sage" : "bg-border",
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-full bg-white transition-all",
          on ? "ml-auto" : "ml-0",
        )}
      />
    </div>
  );
}

function LoginMethodsCard() {
  const { data: methods = [] } = useLoginMethods();
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <CardTitle>🔐 Login Methods</CardTitle>
      {methods.map((m) => {
        const meta = PROVIDER_META[m.provider];
        return (
          <Row key={m.provider}>
            <span className="w-7 text-center text-[17px]">{meta.icon}</span>
            <div className="flex-1">
              <div className="text-[13px] text-text">{meta.label}</div>
              <div className="text-[11.5px] text-textS">
                {m.linked ? "Linked" : "Not linked"}
              </div>
            </div>
            <BtnSm>{m.linked ? "Manage" : "Link"}</BtnSm>
          </Row>
        );
      })}
    </section>
  );
}

function TwoFactorCard() {
  return (
    <section className="pointer-events-none relative overflow-hidden rounded-2xl border border-border bg-card p-4 opacity-60">
      <span className="absolute right-3 top-2.5 rounded-md bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber">
        ✦ Phase 2
      </span>
      <CardTitle>🛡️ Two-Factor Authentication</CardTitle>
      <div className="flex items-center gap-3 py-1">
        <Switch on={true} />
        <span className="text-[13px] text-text">2FA enabled via SMS</span>
        <span className="rounded-md bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage">
          Active
        </span>
      </div>
    </section>
  );
}

function ActiveSessionsCard() {
  const { data: sessions = [] } = useSessions();
  const revoke = useRevokeSession();

  if (sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-4">
        <CardTitle>📱 Active Sessions</CardTitle>
        <p className="text-[13px] text-textS">No tracked sessions yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <CardTitle>📱 Active Sessions</CardTitle>
      {sessions.map((s) => (
        <Row key={s.id}>
          <div className="flex-1">
            <div className="text-[13px] text-text">
              {(s.browser ?? "Browser")} on {(s.device ?? "Unknown device")}
            </div>
            <div className="text-[11.5px] text-textS">
              {s.approx_location ?? "Location unknown"} ·{" "}
              {new Date(s.last_active_at).toLocaleString("en-GB")}
            </div>
          </div>
          {s.is_current ? (
            <span className="rounded-md bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage">
              Current
            </span>
          ) : (
            <BtnSm
              tone="rose"
              onClick={async () => {
                try {
                  await revoke.mutateAsync(s.id);
                  toast.success("Session revoked");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed");
                }
              }}
            >
              Revoke
            </BtnSm>
          )}
        </Row>
      ))}
    </section>
  );
}

function PasswordCard() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <CardTitle>🔑 Password</CardTitle>
      <BtnSm onClick={() => setOpen(true)}>Change password</BtnSm>
      <ChangePasswordModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("New passwords don't match");
      return;
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      await change.mutateAsync({ current, next });
      toast.success("Password updated");
      setCurrent("");
      setNext("");
      setConfirm("");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("wrong_password")) setError("Current password incorrect");
      else if (msg.includes("weak_password")) setError("Password is too weak");
      else setError(msg);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            loading={change.isPending}
          >
            Update password
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Current password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error ? <FormError>{error}</FormError> : null}
      </form>
    </Modal>
  );
}

function PrivacyCard() {
  const { data: settings } = useMemberSettings();
  const update = useUpdateMemberSettings();
  const privacy: PrivacySettings = settings?.privacy ?? {
    share_health_summary: false,
    journal_visible_to_partner: false,
  };

  const toggle = (key: keyof PrivacySettings) =>
    update.mutate({ privacy: { ...privacy, [key]: !privacy[key] } });

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <CardTitle>🔒 Privacy Settings</CardTitle>
      {PRIVACY_LABELS.map(({ key, label }) => (
        <Row key={key}>
          <span className="flex-1 text-[13px] text-text">{label}</span>
          <button
            type="button"
            onClick={() => toggle(key)}
            aria-pressed={privacy[key]}
            aria-label={label}
          >
            <Switch on={privacy[key]} />
          </button>
        </Row>
      ))}
    </section>
  );
}

function YourDataCard() {
  return (
    <section className="pointer-events-none relative overflow-hidden rounded-2xl border border-border bg-card p-4 opacity-60">
      <span className="absolute right-3 top-2.5 rounded-md bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber">
        ✦ Phase 2
      </span>
      <CardTitle>📦 Your Data</CardTitle>
      <p className="mb-3 text-[12.5px] leading-relaxed text-textS">
        Under GDPR, you have the right to access, export, or delete all your
        data.
      </p>
      <button className="mb-2 w-full rounded-md border border-border bg-card px-3 py-2 text-[12px] text-textS">
        ⬇️ Export all my data (JSON / CSV)
      </button>
      <button className="mb-2 w-full rounded-md border border-border bg-card px-3 py-2 text-[12px] text-textS">
        📋 View connected apps
      </button>
      <button className="w-full rounded-md border border-rose/40 bg-card px-3 py-2 text-[12px] text-rose">
        🗑️ Delete account (30-day grace period)
      </button>
    </section>
  );
}
