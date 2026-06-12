/** Local-timezone date helpers for the To-Dos buckets. */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return iso === todayISO();
}

/** Tomorrow through this upcoming Sunday inclusive. */
export function isThisWeek(iso: string | null): boolean {
  if (!iso) return false;
  const d = startOfDay(parseISODate(iso));
  const today = startOfDay(new Date());
  const dayMs = 86_400_000;
  const dayDiff = Math.round((d.getTime() - today.getTime()) / dayMs);
  if (dayDiff < 1) return false;
  // weekday: 0 = Sunday, 1 = Monday, …, 6 = Saturday
  const todayWeekday = today.getDay();
  // Days until the upcoming Sunday (inclusive). If today is Sunday, range is 0 (empty).
  const daysUntilSunday = todayWeekday === 0 ? 0 : 7 - todayWeekday;
  return dayDiff <= daysUntilSunday;
}

/** Strictly after this Sunday OR no due date. */
export function isLater(iso: string | null): boolean {
  if (!iso) return true;
  return !isToday(iso) && !isThisWeek(iso);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDueDate(iso: string | null): string {
  if (!iso) return "No date";
  if (isToday(iso)) return "Today";
  const d = parseISODate(iso);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;
}

/** UK display format DD/MM/YYYY. Input must be an ISO YYYY-MM-DD string. */
export function formatGB(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Months remaining from today to `iso`. Negative if `iso` is in the past. */
export function monthsUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = parseISODate(iso);
  const today = startOfDay(new Date());
  return (
    (d.getFullYear() - today.getFullYear()) * 12 +
    (d.getMonth() - today.getMonth())
  );
}
