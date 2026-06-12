/** Shared password-strength helpers used by sign-up + reset-password screens.
 *
 * Mirrors the same regex checks the backend Zod schema enforces. Returning a
 * 0–4 score keeps the UI render trivial (bar width = score * 25 %).
 */

export function pwdScore(pwd: string): number {
  return [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pwd))
    .length;
}

export const PWD_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export const PWD_BAR_COLOR = [
  "bg-transparent",
  "bg-rose",
  "bg-amber",
  "bg-teal",
  "bg-sage",
];

export const PWD_TEXT_COLOR = [
  "text-transparent",
  "text-rose",
  "text-amber",
  "text-teal",
  "text-sage",
];
