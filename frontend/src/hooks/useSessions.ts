"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface ActiveSession {
  id: string;
  device: string | null;
  browser: string | null;
  approx_location: string | null;
  last_active_at: string;
  is_current: boolean;
}

const KEY = ["my-sessions"];

export function useSessions() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<ActiveSession[]>("/me/sessions"),
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/me/sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
