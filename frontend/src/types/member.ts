export type MemberRole = "owner" | "admin" | "adult" | "teenager" | "child";

export interface AccountMember {
  id: string;
  display_name: string;
  avatar_emoji: string | null;
  role: MemberRole | string | null;
}
