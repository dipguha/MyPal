import { api } from "@/lib/api";
import type { AccountMember } from "@/types/member";

export const membersApi = {
  list: () => api<AccountMember[]>("/members"),
};
