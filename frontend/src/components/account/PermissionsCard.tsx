"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type MemberRow,
  useAccountMembers,
  useMemberPermissions,
  useSetMemberPermission,
} from "@/hooks/useAccountMembers";
import {
  FINANCE_MODULES,
  LOCKED_MODULES,
  MODULE_AREAS,
  MODULES,
  type ModuleArea,
  type ModuleMeta,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS,
  type Permission,
  ROLE_LABELS,
  type RoleCode,
} from "@/lib/access";
import { cn } from "@/lib/cn";

/** Permissions a member can be set to via the inline dropdown.
 *  `manage` is reserved for Owner/Admin via role and isn't assignable here. */
type AssignablePermission = "none" | "view" | "edit";
const ASSIGNABLE: AssignablePermission[] = ["none", "view", "edit"];

const PERMISSION_TEXT: Record<Permission, string> = {
  manage: "text-warm",
  edit: "text-sage",
  view: "text-sky",
  none: "text-textS",
};

const PERMISSION_BG: Record<Permission, string> = {
  manage: "bg-warm/15",
  edit: "bg-sage/15",
  view: "bg-sky/15",
  none: "bg-card2",
};

type PendingMap = Record<string, AssignablePermission>;

const pkey = (memberId: string, moduleKey: string) =>
  `${memberId}__${moduleKey}`;

export function PermissionsCard() {
  const { data: members = [], isLoading: membersLoading } = useAccountMembers({
    includeRemoved: false,
  });
  const viewer = members.find((m) => m.is_self);
  const activeMembers = useMemo(
    () => members.filter((m) => m.status !== "removed"),
    [members],
  );

  const [targetId, setTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMap>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const savedMsgTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default selection: the viewer's own chip, once loaded.
  useEffect(() => {
    if (targetId === null && viewer) setTargetId(viewer.id);
  }, [targetId, viewer]);

  const target = activeMembers.find((m) => m.id === targetId) ?? null;

  const { data: permissions, isLoading: permsLoading } = useMemberPermissions(
    targetId,
  );
  const setPerm = useSetMemberPermission();

  // Clear pending changes for a member when the target switches.
  useEffect(() => {
    setPending((prev) => {
      const next: PendingMap = {};
      for (const k of Object.keys(prev)) {
        if (!k.startsWith(`${targetId}__`)) next[k] = prev[k];
      }
      return next;
    });
  }, [targetId]);

  useEffect(
    () => () => {
      if (savedMsgTimeoutRef.current) clearTimeout(savedMsgTimeoutRef.current);
    },
    [],
  );

  const targetRole = (target?.role_code ?? "adult") as RoleCode;
  const everyoneIsManage = targetRole === "owner" || targetRole === "admin";

  const defaults = (permissions?.defaults ?? {}) as Record<string, Permission>;
  const savedOverrides = (permissions?.overrides ?? {}) as Record<
    string,
    Permission
  >;

  function defaultFor(moduleKey: string): Permission {
    return defaults[moduleKey] ?? "none";
  }

  function savedLevelFor(moduleKey: string): Permission {
    return savedOverrides[moduleKey] ?? defaultFor(moduleKey);
  }

  function effectiveLevel(moduleKey: string): Permission {
    if (!target) return "none";
    if (everyoneIsManage) return "manage";
    const staged = pending[pkey(target.id, moduleKey)];
    if (staged !== undefined) return staged;
    return savedLevelFor(moduleKey);
  }

  function isCustom(moduleKey: string): boolean {
    if (everyoneIsManage) return false;
    const saved = savedOverrides[moduleKey];
    if (saved === undefined) return false;
    return saved !== defaultFor(moduleKey);
  }

  function setLevel(moduleKey: string, lvl: AssignablePermission) {
    if (!target) return;
    setPending((prev) => {
      const next = { ...prev };
      const key = pkey(target.id, moduleKey);
      // If the requested level equals the saved level, clear the pending entry.
      if (lvl === savedLevelFor(moduleKey)) {
        delete next[key];
      } else {
        next[key] = lvl;
      }
      return next;
    });
  }

  function resetMod(moduleKey: string) {
    if (!target) return;
    setPending((prev) => {
      const next = { ...prev };
      const key = pkey(target.id, moduleKey);
      const def = defaultFor(moduleKey) as AssignablePermission;
      // If saved override exists, stage a reset (= set to default).
      if (savedOverrides[moduleKey] !== undefined) {
        // "reset" stages a write of the default, which the backend will
        // interpret as "delete the override" if the default equals the
        // role default (we send permission=null in saveChanges below).
        next[key] = def;
      } else {
        delete next[key];
      }
      return next;
    });
  }

  function discardChanges() {
    setPending({});
  }

  async function saveChanges() {
    if (!target) return;
    const entries = Object.entries(pending).filter(([k]) =>
      k.startsWith(`${target.id}__`),
    );
    if (entries.length === 0) return;
    const prefix = `${target.id}__`;
    try {
      await Promise.all(
        entries.map(([k, level]) => {
          const module = k.slice(prefix.length);
          // If the staged level equals the role default, send null to
          // clear the override; otherwise send the level.
          const permission: Permission | null =
            level === defaultFor(module) ? null : (level as Permission);
          return setPerm.mutateAsync({
            memberId: target.id,
            module,
            permission,
          });
        }),
      );
      setPending({});
      if (savedMsgTimeoutRef.current) clearTimeout(savedMsgTimeoutRef.current);
      setSavedMsg(true);
      savedMsgTimeoutRef.current = setTimeout(() => setSavedMsg(false), 2000);
    } catch (err) {
      // Errors surface inline via the mutation state; keep pending so the
      // user can retry. Re-throw to bubble to React Query's error handlers.
      throw err;
    }
  }

  const groupsByArea = useMemo<Record<ModuleArea, ModuleMeta[]>>(() => {
    const acc = {
      "life-admin": [] as ModuleMeta[],
      finance: [] as ModuleMeta[],
      health: [] as ModuleMeta[],
      recipes: [] as ModuleMeta[],
      travel: [] as ModuleMeta[],
    };
    for (const m of MODULES) acc[m.area].push(m);
    return acc;
  }, []);

  if (membersLoading) return <p className="text-textS">Loading members…</p>;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      {/* ── Header ── */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-textS">
          Permissions
        </span>
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className={cn(
            "text-[11px] font-medium",
            helpOpen ? "text-warm" : "text-textS hover:text-warm",
          )}
        >
          {helpOpen ? "Hide levels" : "What do these mean?"}
        </button>
      </div>

      {/* ── Help panel ── */}
      {helpOpen ? (
        <div className="mb-3.5 rounded-xl border border-border bg-warm/5 p-3.5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-warm">
            Permission levels
          </div>
          {(["manage", "edit", "view", "none"] as Permission[]).map((lvl) => (
            <div
              key={lvl}
              className="flex gap-2.5 py-1.5 text-[12px] leading-snug text-text"
            >
              <span
                className={cn(
                  "h-fit min-w-[62px] rounded-md px-2 py-0.5 text-center text-[11px] font-bold",
                  PERMISSION_BG[lvl],
                  PERMISSION_TEXT[lvl],
                )}
              >
                {PERMISSION_LABELS[lvl]}
              </span>
              <span className="flex-1">{PERMISSION_DESCRIPTIONS[lvl]}</span>
            </div>
          ))}
          <div className="mt-1.5 border-t border-border pt-2 text-[11px] leading-snug text-textS">
            The dropdowns below only let you change between <b>None</b>,{" "}
            <b>View</b>, and <b>Edit</b>. <b>Manage</b> is set by role.
          </div>
        </div>
      ) : null}

      {/* ── Member chip strip ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {activeMembers.map((m) => (
          <MemberChip
            key={m.id}
            member={m}
            selected={m.id === targetId}
            onClick={() => setTargetId(m.id)}
          />
        ))}
      </div>

      {/* ── Body for selected member ── */}
      {target === null ? (
        <p className="text-textS">Select a member to view their permissions.</p>
      ) : permsLoading ? (
        <p className="text-textS">Loading permissions…</p>
      ) : everyoneIsManage ? (
        <div className="rounded-xl border border-warm/30 bg-warm/10 p-3 text-[12.5px] leading-snug text-text">
          <b className="text-warm">
            {target.display_name} is{" "}
            {targetRole === "owner" ? "the Owner" : "an Admin"}.
          </b>{" "}
          Every module is <b>Manage</b> by definition — this view is read-only.
          Use the role-change action to adjust.
        </div>
      ) : (
        <>
          {MODULE_AREAS.map((area) => {
            // Children-Finance is hidden entirely; replaced by the sky banner below.
            if (area.key === "finance" && targetRole === "child") return null;
            const mods = groupsByArea[area.key];
            if (mods.length === 0) return null;
            const isOpen = !!openGroups[area.key];
            const customCount = mods.filter((m) => isCustom(m.key)).length;
            return (
              <div
                key={area.key}
                className="mb-2 overflow-hidden rounded-xl border border-border"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((p) => ({ ...p, [area.key]: !p[area.key] }))
                  }
                  className="flex w-full items-center gap-2.5 bg-card px-3.5 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "inline-block w-2.5 text-[10px] text-textS transition-transform",
                      isOpen && "rotate-90",
                    )}
                  >
                    ▶
                  </span>
                  <span className="flex-1 text-[12.5px] font-bold tracking-wide text-text">
                    {area.label}
                  </span>
                  <span className="text-[10.5px] font-medium text-textM">
                    {mods.length} module{mods.length > 1 ? "s" : ""}
                  </span>
                  {customCount > 0 ? (
                    <span className="rounded-md bg-warm/15 px-2 py-0.5 text-[10px] font-bold text-warm">
                      {customCount} custom
                    </span>
                  ) : null}
                </button>
                {isOpen ? (
                  <div className="border-t border-border bg-card">
                    {mods.map((mod, i) => {
                      const level = effectiveLevel(mod.key);
                      const locked = LOCKED_MODULES.has(mod.key);
                      const custom = isCustom(mod.key);
                      return (
                        <div
                          key={mod.key}
                          className={cn(
                            "flex min-h-[42px] items-center gap-2.5 px-3.5 py-2",
                            i > 0 && "border-t border-border",
                          )}
                          title={
                            locked
                              ? "Locked by role"
                              : `Default for ${ROLE_LABELS[targetRole]}: ${PERMISSION_LABELS[defaultFor(mod.key)]}`
                          }
                        >
                          <span
                            className={cn(
                              "w-5.5 flex-none text-center text-[15px]",
                              locked && "opacity-60",
                            )}
                          >
                            {mod.icon}
                          </span>
                          <span className="flex-1 truncate text-[13px] font-medium text-text">
                            {mod.label}
                            {locked ? (
                              <span className="ml-1.5 text-[10.5px] text-textM">
                                🔒
                              </span>
                            ) : null}
                          </span>
                          {custom ? (
                            <span className="flex flex-none items-center gap-1 rounded-md bg-warm/15 px-1.5 py-0.5 text-[9.5px] font-bold text-warm">
                              <span className="inline-block h-1 w-1 rounded-full bg-warm" />
                              Custom
                            </span>
                          ) : null}
                          {custom && !locked ? (
                            <button
                              type="button"
                              onClick={() => resetMod(mod.key)}
                              className="flex-none px-1.5 py-0.5 text-[11px] text-textS hover:text-warm"
                            >
                              Reset
                            </button>
                          ) : null}
                          {locked ? (
                            <span
                              className={cn(
                                "min-w-[74px] flex-none rounded-md px-2.5 py-1 text-center text-[11.5px] font-bold",
                                PERMISSION_BG[level],
                                PERMISSION_TEXT[level],
                              )}
                            >
                              {PERMISSION_LABELS[level]}
                            </span>
                          ) : (
                            <select
                              value={level}
                              onChange={(e) =>
                                setLevel(
                                  mod.key,
                                  e.target.value as AssignablePermission,
                                )
                              }
                              className={cn(
                                "min-w-[90px] flex-none cursor-pointer rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-bold outline-none",
                                PERMISSION_TEXT[level],
                              )}
                              disabled={
                                // Disable finance assignments for Children entirely.
                                targetRole === "child" &&
                                FINANCE_MODULES.has(mod.key)
                              }
                            >
                              {ASSIGNABLE.map((lv) => (
                                <option key={lv} value={lv}>
                                  {PERMISSION_LABELS[lv]}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {targetRole === "child" ? (
            <div className="mt-2 rounded-xl border border-sky/30 bg-sky/10 p-3 text-[12.5px] leading-snug text-text">
              <b className="text-sky">Finance is hidden for Children.</b> It
              cannot be enabled from this screen.
            </div>
          ) : null}
        </>
      )}

      {/* ── Permanent Save / Discard bar ── */}
      <div className="mt-3.5 flex items-center justify-end gap-2 border-t border-border pt-3">
        {savedMsg ? (
          <span className="mr-auto text-[12px] font-semibold text-sage">
            ✓ Permissions saved
          </span>
        ) : null}
        <button
          type="button"
          onClick={discardChanges}
          disabled={setPerm.isPending}
          className="rounded-md border border-border bg-card2 px-3.5 py-1.5 text-[12px] font-semibold text-text transition-colors hover:border-warm hover:text-warm disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={setPerm.isPending || everyoneIsManage}
          className="rounded-md border border-warm bg-warm/15 px-3.5 py-1.5 text-[12px] font-semibold text-warm transition-colors hover:bg-warm hover:text-white disabled:opacity-50"
        >
          {setPerm.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </section>
  );
}

function MemberChip({
  member,
  selected,
  onClick,
}: {
  member: MemberRow;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold transition-colors",
        selected
          ? "border-warm bg-warm/15 text-warm"
          : "border-border bg-surface text-text hover:border-warm/40",
      )}
    >
      <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-card2 text-[12px]">
        {member.avatar_emoji ?? member.display_name.slice(0, 1).toUpperCase()}
      </span>
      <span>
        {member.display_name}
        {member.is_self ? " (You)" : ""}
      </span>
      <span className="font-medium text-textS">
        · {ROLE_LABELS[member.role_code as RoleCode]}
      </span>
    </button>
  );
}
