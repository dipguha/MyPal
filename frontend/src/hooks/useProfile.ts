"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface Profile {
  member_id: string;
  full_name: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  avatar_emoji: string | null;
  date_of_birth: string | null;
  email: string;
  phone: string | null;
  home_address: string | null;
  interests: string[];
  theme: "light" | "dark" | "system";
}

export type ProfileUpdate = Partial<{
  display_name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string;
  home_address: string;
  avatar_emoji: string;
  interests: string[];
  theme: "light" | "dark" | "system";
}>;

export function useProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: () => api<Profile>("/me/profile"),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileUpdate) =>
      api<Profile>("/me/profile", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      qc.setQueryData(["my-profile"], data);
    },
  });
}
