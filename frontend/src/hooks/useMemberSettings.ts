"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface PrivacySettings {
  share_health_summary: boolean;
  journal_visible_to_partner: boolean;
}

export interface MemberSettings {
  theme: "light" | "dark" | "system";
  interests: string[];
  privacy: PrivacySettings;
}

export type MemberSettingsPatch = Partial<MemberSettings>;

const KEY = ["my-settings"];

export function useMemberSettings() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<MemberSettings>("/me/settings"),
    staleTime: 60_000,
  });
}

export function useUpdateMemberSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MemberSettingsPatch) =>
      api<MemberSettings>("/me/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
    },
  });
}
