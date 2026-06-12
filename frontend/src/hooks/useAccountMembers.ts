"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Permission, RoleCode } from "@/lib/access";

export type MemberStatus = "active" | "invited" | "expired" | "removed";

export type InviteRoleCode = "admin" | "adult" | "teenager" | "child";
export type TargetRoleCode = "admin" | "adult" | "teenager" | "child";

export interface MemberRow {
  id: string;
  display_name: string;
  role_code: RoleCode;
  role_label: string;
  avatar_url: string | null;
  avatar_emoji: string | null;
  age: number | null;
  in_hmg: boolean;
  status: MemberStatus;
  is_self: boolean;
  invited_email: string | null;
  invited_at: string | null;
  last_invited_at: string | null;
  removed_at: string | null;
}

export interface InviteBody {
  full_name: string;
  email?: string | null;
  role_code: InviteRoleCode;
}

export interface BatchMemberChange {
  member_id: string;
  role_code?: TargetRoleCode;
  in_hmg?: boolean;
}

export interface PermissionsResponse {
  role_code: RoleCode;
  defaults: Record<string, Permission>;
  overrides: Record<string, Permission>;
  locked: string[];
}

const LIST_KEY = ["account-members"];

export function useAccountMembers(opts: { includeRemoved?: boolean } = {}) {
  const { includeRemoved = false } = opts;
  return useQuery({
    queryKey: [...LIST_KEY, { includeRemoved }],
    queryFn: () =>
      api<MemberRow[]>(
        `/members${includeRemoved ? "?include_removed=true" : ""}`,
      ),
    staleTime: 30_000,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteBody) =>
      api<MemberRow>("/members/invite", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      roleCode,
    }: {
      memberId: string;
      roleCode: TargetRoleCode;
    }) =>
      api<MemberRow>(`/members/${memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role_code: roleCode }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useBatchSaveMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: BatchMemberChange[]) =>
      api<MemberRow[]>("/members/batch", {
        method: "POST",
        body: JSON.stringify({ changes }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useResendInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api<MemberRow>(`/members/${memberId}/resend-invite`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api<void>(`/members/${memberId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useMemberPermissions(memberId: string | null) {
  return useQuery({
    queryKey: ["account-member-permissions", memberId],
    queryFn: () => api<PermissionsResponse>(`/members/${memberId}/permissions`),
    enabled: !!memberId,
    staleTime: 30_000,
  });
}

export function useSetMemberPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      module,
      permission,
    }: {
      memberId: string;
      module: string;
      permission: Permission | null;
    }) =>
      api<PermissionsResponse>(
        `/members/${memberId}/permissions/${encodeURIComponent(module)}`,
        {
          method: "PUT",
          body: JSON.stringify({ permission }),
        },
      ),
    onSuccess: (data, vars) => {
      qc.setQueryData(["account-member-permissions", vars.memberId], data);
    },
  });
}
