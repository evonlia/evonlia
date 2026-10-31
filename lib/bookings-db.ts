import fs from "node:fs";
import path from "node:path";
import { SITE } from "./site";

export type Status = "new" | "confirmed" | "done" | "cancelled";

export type Booking = {
  ref: string;
  status: Status;
  notes?: string;
  serviceId: string;
  date: string; // YYYY-MM-DD (Alexandria)
  time: string; // HH:mm
  mode: "video" | "phone" | "visit";
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "bookings.json");
const g = globalThis as unknown as { __bookings?: Booking[] };

function load(): Booking[] {
  if (g.__bookings) return g.__bookings;
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Booking[];
    g.__bookings = raw.map((b) => ({ ...b, status: b.status ?? "new" })); // older records had no status
  } catch {
    g.__bookings = [];
  }
  return g.__bookings!;
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(g.__bookings, null, 2));
  } catch {
    /* read-only hosts (e.g. serverless): in-memory only. Use BOOKING_WEBHOOK_URL or a database. */
  }
}

export function takenTimes(date: string): string[] {
  // cancelled bookings free their slot again
  return load().filter((b) => b.date === date && b.status !== "cancelled").map((b) => b.time);
}

export function addBooking(b: Booking) {
  load().push(b);
  persist();
}

/** Current date/time in the company's timezone. */
export function nowInSiteTz() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE.timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Every start time of a day: a meeting must fit before closing, so with 90 minutes and 20:00 closing the last start is 18:30. */
export function allSlots(): string[] {
  const out: string[] = [];
  for (let m = SITE.hours.start * 60; m + SITE.callMinutes <= SITE.hours.end * 60; m += SITE.slotStep) out.push(toTime(m));
  return out;
}

export function isOpenDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return !SITE.closedDays.includes(dow);
}

export function freeSlots(date: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isOpenDay(date)) return [];
  const now = nowInSiteTz();
  if (date < now.date) return [];
  const dur = SITE.callMinutes;
  const booked = takenTimes(date).map(toMinutes); // each booking blocks [start, start + dur)
  return allSlots().filter((t) => {
    const start = toMinutes(t);
    if (booked.some((b) => start < b + dur && b < start + dur)) return false; // overlaps another meeting
    if (date === now.date) return start > now.minutes + 60; // at least one hour notice
    return true;
  });
}

/* ---------- admin operations ---------- */
export function listAll(): Booking[] {
  return [...load()];
}

export function updateBooking(ref: string, patch: { status?: Status; notes?: string }): Booking | null {
  const b = load().find((x) => x.ref === ref);
  if (!b) return null;
  if (patch.status) b.status = patch.status;
  if (patch.notes !== undefined) b.notes = patch.notes;
  persist();
  return b;
}

export function removeBooking(ref: string): boolean {
  const all = load();
  const i = all.findIndex((x) => x.ref === ref);
  if (i < 0) return false;
  all.splice(i, 1);
  persist();
  return true;
}
