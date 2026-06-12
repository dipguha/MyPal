export interface Member {
  id: string;
  name: string;
  avatar: string;
}

export const MEMBERS: Member[] = [
  { id: "james", name: "James", avatar: "👨" },
  { id: "sarah", name: "Sarah", avatar: "👩" },
  { id: "maya", name: "Maya", avatar: "👧" },
  { id: "lily", name: "Lily", avatar: "👧" },
];

export const PRIMARY_MEMBER = MEMBERS[0];
