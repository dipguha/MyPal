"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { RoleCode } from "@/lib/access";

export interface HMGMember {
  member_id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  role_code: RoleCode;
  added_at: string;
  is_owner: boolean;
}

const KEY = ["account-hmg"];

export function useHMG() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<HMGMember[]>("/hmg"),
    staleTime: 30_000,
  });
}

export function useAddHMGMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api<HMGMember>("/hmg/members", {
        method: "POST",
        body: JSON.stringify({ member_id: memberId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveHMGMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api<void>(`/hmg/members/${memberId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
