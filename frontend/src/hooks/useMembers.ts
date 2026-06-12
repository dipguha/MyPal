"use client";

import { useQuery } from "@tanstack/react-query";

import { membersApi } from "@/lib/api/members";

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: membersApi.list,
    staleTime: 1000 * 60 * 10,
  });
}
