"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface LoginMethod {
  provider: "email" | "google" | "phone" | "apple";
  linked: boolean;
  since: string | null;
}

export function useLoginMethods() {
  return useQuery({
    queryKey: ["my-login-methods"],
    queryFn: () => api<LoginMethod[]>("/me/security/login-methods"),
    staleTime: 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      api<void>("/me/security/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: current,
          new_password: next,
        }),
      }),
  });
}
