"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

/**
 * Sign-out control.
 *
 * Clears every auth-related artefact in the browser before delegating to
 * NextAuth's signOut(), which expires the httpOnly session cookie on the
 * server side and redirects to "/".
 *
 * What we explicitly DO NOT clear:
 *  - localStorage["mypal-theme"]: it's a UX preference, not auth state.
 */
export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    try {
      // Onboarding wizard draft (cross-session) + signup draft (in-flight).
      window.localStorage.removeItem("mypal-onboarding");
      window.sessionStorage.removeItem("mypal-signup-draft");
    } catch {
      /* private-browsing or storage disabled — non-fatal */
    }

    // Expires __Secure-next-auth.session-token (prod) / next-auth.session-token (dev)
    // on the server side, then redirects.
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-rose transition-colors hover:bg-rose/10 disabled:opacity-60"
    >
      <span aria-hidden className="text-[15px]">
        🚪
      </span>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
