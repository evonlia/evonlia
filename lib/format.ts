import type { Lang } from "./i18n";
import { SITE } from "./site";

export function nextDays(n: number, closed: number[] = SITE.closedDays) {
  // build dates in Alexandria time
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const out: { iso: string; dow: number }[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const iso = fmt.format(d);
    const [y, m, dd] = iso.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
    if (!closed.includes(dow)) out.push({ iso, dow });
  }
  return out;
}

const loc = (l: Lang) => (l === "ar" ? "ar-EG" : "en-GB");
const utc = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };

export const fmtWeekday = (iso: string, l: Lang) => new Intl.DateTimeFormat(loc(l), { weekday: "short", timeZone: "UTC" }).format(utc(iso));
export const fmtDay = (iso: string, l: Lang) => new Intl.DateTimeFormat(loc(l), { day: "numeric", timeZone: "UTC" }).format(utc(iso));
export const fmtMonth = (iso: string, l: Lang) => new Intl.DateTimeFormat(loc(l), { month: "short", timeZone: "UTC" }).format(utc(iso));
export const fmtLong = (iso: string, l: Lang) => new Intl.DateTimeFormat(loc(l), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(iso));
export const fmtTime = (hhmm: string, l: Lang) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat(loc(l), { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
};

/** .ics file so the customer can drop the meeting into any calendar. Times are floating Cairo local time. */
export function buildIcs(opts: { ref: string; date: string; time: string; title: string; description: string }) {
  const d = opts.date.replace(/-/g, "");
  const [h, m] = opts.time.split(":");
  const start = `${d}T${h}${m}00`;
  const end = `${d}T${String(Number(h) + 0).padStart(2, "0")}${String(Number(m) + 30).padStart(2, "0")}00`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Evonlia//Booking//EN", "BEGIN:VEVENT",
    `UID:${opts.ref}@evonlia`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;TZID=${SITE.timezone}:${start}`, `DTEND;TZID=${SITE.timezone}:${end}`,
    `SUMMARY:${opts.title}`, `DESCRIPTION:${opts.description.replace(/\n/g, "\\n")}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
