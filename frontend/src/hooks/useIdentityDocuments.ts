"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type IdentityDocType =
  | "passport"
  | "driving_licence"
  | "national_insurance"
  | "brp"
  | "ghic"
  | "oci_card"
  | "other";

export interface IdentityDocument {
  id: string;
  doc_type: IdentityDocType;
  doc_label: string | null;
  country: string | null;
  number: string | null;
  expiry_date: string | null;
  categories: string | null;
  file_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdentityDocumentInput {
  doc_type: IdentityDocType;
  doc_label?: string | null;
  country?: string | null;
  number?: string | null;
  expiry_date?: string | null;
  categories?: string | null;
}

interface Envelope {
  document: IdentityDocument;
  meta: { oci_reminder: boolean };
}

const KEY = ["my-identity-documents"];

export function useIdentityDocuments() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<IdentityDocument[]>("/me/identity-documents"),
    staleTime: 60_000,
  });
}

export function useCreateIdentityDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IdentityDocumentInput) =>
      api<Envelope>("/me/identity-documents", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useUpdateIdentityDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: IdentityDocumentInput }) =>
      api<Envelope>(`/me/identity-documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeleteIdentityDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/me/identity-documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
