"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  type IdentityDocType,
  type IdentityDocument,
  type IdentityDocumentInput,
  useCreateIdentityDocument,
  useUpdateIdentityDocument,
} from "@/hooks/useIdentityDocuments";

const TYPE_META: Record<
  IdentityDocType,
  {
    label: string;
    subtitle: string;
    fields: Array<keyof IdentityDocumentInput>;
    hasExpiry: boolean;
  }
> = {
  passport: {
    label: "Passport",
    subtitle: "Travel and identity document.",
    fields: ["country", "number"],
    hasExpiry: true,
  },
  driving_licence: {
    label: "Driving Licence",
    subtitle: "Driving permit issued by a national authority.",
    fields: ["country", "number", "categories"],
    hasExpiry: true,
  },
  national_insurance: {
    label: "National Insurance",
    subtitle: "UK NI number — used for tax and benefits.",
    fields: ["number"],
    hasExpiry: false,
  },
  brp: {
    label: "BRP",
    subtitle: "UK Biometric Residence Permit.",
    fields: ["number"],
    hasExpiry: true,
  },
  ghic: {
    label: "GHIC",
    subtitle: "Global Health Insurance Card — EU healthcare access.",
    fields: ["number"],
    hasExpiry: true,
  },
  oci_card: {
    label: "OCI Card",
    subtitle: "Overseas Citizen of India card — does not expire.",
    fields: ["number"],
    hasExpiry: false,
  },
  other: {
    label: "Other",
    subtitle: "Anything else — give it a name.",
    fields: ["doc_label", "number"],
    hasExpiry: true,
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  docType: IdentityDocType;
  existing?: IdentityDocument | null;
}

export function IdentityDocModal({ open, onClose, docType, existing }: Props) {
  const meta = TYPE_META[docType];
  const isEdit = !!existing;
  const create = useCreateIdentityDocument();
  const update = useUpdateIdentityDocument();

  const [form, setForm] = useState<IdentityDocumentInput>({
    doc_type: docType,
    doc_label: existing?.doc_label ?? "",
    country: existing?.country ?? "",
    number: existing?.number ?? "",
    expiry_date: existing?.expiry_date ?? "",
    categories: existing?.categories ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm({
        doc_type: docType,
        doc_label: existing?.doc_label ?? "",
        country: existing?.country ?? "",
        number: existing?.number ?? "",
        expiry_date: existing?.expiry_date ?? "",
        categories: existing?.categories ?? "",
      });
      setError(null);
    }
  }, [open, docType, existing]);

  const set = <K extends keyof IdentityDocumentInput>(
    key: K,
    value: IdentityDocumentInput[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSave() {
    setError(null);
    const body: IdentityDocumentInput = {
      doc_type: docType,
      doc_label: form.doc_label || null,
      country: form.country || null,
      number: form.number || null,
      expiry_date: form.expiry_date || null,
      categories: form.categories || null,
    };
    try {
      if (isEdit && existing) {
        await update.mutateAsync({ id: existing.id, body });
        toast.success(`${meta.label} updated`);
      } else {
        const res = await create.mutateAsync(body);
        toast.success(`${meta.label} added`);
        if (res.meta.oci_reminder) {
          toast(
            "You have an OCI card on file — remember to get it re-endorsed with your new passport before you travel.",
            { duration: 7000 },
          );
        }
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("409") || msg.includes("already_exists")) {
        setError(`You already have a ${meta.label} on file.`);
      } else {
        setError(msg);
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${meta.label}` : meta.label}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={pending}>
            {isEdit ? "Save" : "Add document"}
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-textS">{meta.subtitle}</p>
      <div className="flex flex-col gap-3">
        {meta.fields.includes("doc_label") ? (
          <Input
            label="Document name"
            value={form.doc_label ?? ""}
            onChange={(e) => set("doc_label", e.target.value)}
            placeholder="e.g. Membership card"
          />
        ) : null}
        {meta.fields.includes("country") ? (
          <Input
            label="Country of issue"
            value={form.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
            placeholder="United Kingdom"
          />
        ) : null}
        {meta.fields.includes("number") ? (
          <Input
            label={docType === "national_insurance" ? "NI number" : "Number"}
            value={form.number ?? ""}
            onChange={(e) => set("number", e.target.value)}
            placeholder="—"
          />
        ) : null}
        {meta.fields.includes("categories") ? (
          <Input
            label="Licence categories"
            value={form.categories ?? ""}
            onChange={(e) => set("categories", e.target.value)}
            placeholder="B, BE"
          />
        ) : null}
        {meta.hasExpiry ? (
          <Input
            label={docType === "other" ? "Expiry date (optional)" : "Expiry date"}
            type="date"
            value={form.expiry_date ?? ""}
            onChange={(e) => set("expiry_date", e.target.value)}
          />
        ) : null}
        {error ? <FormError>{error}</FormError> : null}
        <p className="text-[12px] text-textM">
          Document file upload arrives in a future update.
        </p>
      </div>
    </Modal>
  );
}

export { TYPE_META as DOC_TYPE_META };
