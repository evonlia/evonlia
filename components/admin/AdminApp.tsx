"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { adminDict } from "@/lib/admin-i18n";
import { ALL_SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { fmtDay, fmtLong, fmtMonth, fmtTime, fmtWeekday } from "@/lib/format";
import type { Booking, Status } from "@/lib/bookings-db";
import {
  isUnauthorized, useAdminBookings, useDeleteBooking, useLogin, useLoginInfo, useLogout, useUpdateBooking,
} from "@/lib/admin-api";
import { useAppDispatch, useAppSelector, useT } from "@/store/hooks";
import { select, setFilter, setLang, setSearch, setView, shiftWeek, type AdminStatusFilter } from "@/store";

/* ---------------- helpers ---------------- */
const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const dowOf = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();
const todayIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: SITE.timezone }).format(new Date());
const serviceName = (id: string, lang: "en" | "ar") => ALL_SERVICES.find((s) => s.id === id)?.title[lang] ?? id;
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("00") ? d.slice(2) : d.startsWith("0") ? "20" + d.slice(1) : d;
};
const STATUSES: Status[] = ["new", "confirmed", "done", "cancelled"];

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = String(value); prev.current = value; return; }
    const o = { v: prev.current };
    const tween = gsap.to(o, { v: value, duration: 0.9, ease: "power2.out", onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
    prev.current = value;
    return () => { tween.kill(); };
  }, [value]);
  return <span ref={ref}>0</span>;
}

/* ---------------- login ---------------- */
function Login() {
  const { lang } = useT();
  const a = adminDict[lang].login;
  const [pw, setPw] = useState("");
  const login = useLogin();
  const info = useLoginInfo();
  const err = login.error as (Error & { message: string }) | null;
  const msg = info.data && !info.data.configured ? a.notConfigured
    : err ? (err.message === "too_many" ? a.many : err.message === "not_configured" ? a.notConfigured : a.invalid) : null;

  return (
    <div className="adm-login">
      <form onSubmit={(e) => { e.preventDefault(); login.mutate(pw); }} className="adm-login__box">
        <Image src="/brand/lockup.png" alt="Evonlia" width={180} height={98} priority />
        <h1>{a.title}</h1>
        <label className="field">
          <span>{a.password}</span>
          <input type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} dir="ltr" aria-invalid={!!err} />
        </label>
        {msg && <p className="err" role="alert">{msg}</p>}
        <button className="btn btn--gold" type="submit" disabled={login.isPending || !pw}>{login.isPending ? a.signing : a.submit}</button>
      </form>
    </div>
  );
}

/* ---------------- detail drawer ---------------- */
function Drawer({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const { lang } = useT();
  const d = adminDict[lang];
  const update = useUpdateBooking();
  const del = useDeleteBooking();
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const wa = waNumber(booking.phone);
  const row = (k: string, v: React.ReactNode) => (<div><dt>{k}</dt><dd>{v}</dd></div>);

  return (
    <>
      <motion.div className="adm-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="adm-drawer" role="dialog" aria-modal="true" aria-label={booking.name}
        initial={{ x: lang === "ar" ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: lang === "ar" ? "-100%" : "100%" }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <header className="adm-drawer__head">
          <div>
            <h2>{booking.name}</h2>
            <span className="adm-ref" dir="ltr">{booking.ref}</span>
          </div>
          <button className="adm-x" onClick={onClose} aria-label={d.drawer.close}>×</button>
        </header>

        <div className="adm-drawer__body">
          <section>
            <h3>{d.drawer.status}</h3>
            <div className="adm-seg" role="radiogroup" aria-label={d.drawer.status}>
              {STATUSES.map((s) => (
                <button key={s} role="radio" aria-checked={booking.status === s} data-s={s} data-on={booking.status === s}
                  onClick={() => update.mutate({ ref: booking.ref, status: s })}>{d.status[s]}</button>
              ))}
            </div>
          </section>

          <section>
            <h3>{d.drawer.contact}</h3>
            <div className="adm-contact">
              <a className="btn btn--ghost btn--sm" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">{d.drawer.whatsapp}</a>
              <a className="btn btn--ghost btn--sm" href={`mailto:${booking.email}`}>{d.drawer.email}</a>
              <a className="btn btn--ghost btn--sm" href={`tel:${booking.phone}`}>{d.drawer.call}</a>
            </div>
            <dl className="adm-dl">
              {row(d.drawer.email, <span dir="ltr">{booking.email}</span>)}
              {row("☎", <span dir="ltr">{booking.phone}</span>)}
              {booking.company && row(d.drawer.company, booking.company)}
            </dl>
          </section>

          <section>
            <dl className="adm-dl">
              {row(d.drawer.topic, serviceName(booking.serviceId, lang))}
              {row(d.drawer.when, `${fmtLong(booking.date, lang)} · ${fmtTime(booking.time, lang)}`)}
              {row(d.drawer.format, d.modes[booking.mode])}
              {row(d.drawer.received, new Date(booking.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { timeZone: SITE.timezone }))}
            </dl>
          </section>

          <section>
            <h3>{d.drawer.message}</h3>
            <p className={booking.message ? "adm-msg" : "adm-msg adm-msg--empty"}>{booking.message ?? d.drawer.noMessage}</p>
          </section>

          <section>
            <h3>{d.drawer.notes}</h3>
            <textarea className="adm-notes" rows={4} value={notes} placeholder={d.drawer.notesHint}
              onChange={(e) => { setNotes(e.target.value); setSaved(false); }} />
            <div className="adm-notes__bar">
              <button className="btn btn--gold btn--sm" disabled={update.isPending || notes === (booking.notes ?? "")}
                onClick={() => update.mutate({ ref: booking.ref, notes }, { onSuccess: () => setSaved(true) })}>{d.drawer.save}</button>
              {saved && <span role="status" className="adm-saved">{d.drawer.saved}</span>}
            </div>
          </section>

          <section className="adm-danger">
            {!confirmDel ? (
              <button className="adm-link-danger" onClick={() => setConfirmDel(true)}>{d.drawer.del}</button>
            ) : (
              <div className="adm-confirm" role="alert">
                <span>{d.drawer.delSure}</span>
                <button className="btn btn--sm adm-btn-danger" onClick={() => del.mutate(booking.ref, { onSuccess: onClose })}>{d.drawer.delYes}</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDel(false)}>{d.drawer.delNo}</button>
              </div>
            )}
          </section>
        </div>
      </motion.aside>
    </>
  );
}

/* ---------------- main ---------------- */
export default function AdminApp() {
  const { lang, dir } = useT();
  const d = adminDict[lang];
  const dispatch = useAppDispatch();
  const { view, filter, search, selected, weekOffset } = useAppSelector((s) => s.admin);
  const q = useAdminBookings();
  const logout = useLogout();
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayIso()), []);

  const all = useMemo(() => q.data ?? [], [q.data]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length, new: 0, confirmed: 0, done: 0, cancelled: 0 };
    all.forEach((b) => { c[b.status]++; });
    return c;
  }, [all]);

  const stats = useMemo(() => {
    const live = all.filter((b) => b.status !== "cancelled");
    return {
      new: counts.new,
      today: live.filter((b) => b.date === today).length,
      week: live.filter((b) => b.date >= today && b.date <= addDays(today || "2000-01-01", 6)).length,
      total: all.length,
    };
  }, [all, counts, today]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = all.filter((b) =>
      (filter === "all" || b.status === filter) &&
      (!term || [b.name, b.email, b.phone, b.ref, b.company ?? ""].some((v) => v.toLowerCase().includes(term))));
    const key = (b: Booking) => `${b.date} ${b.time}`;
    const up = rows.filter((b) => b.date >= today).sort((a, b) => key(a).localeCompare(key(b)));
    const past = rows.filter((b) => b.date < today).sort((a, b) => key(b).localeCompare(key(a)));
    return [...up, ...past];
  }, [all, filter, search, today]);

  const weekDays = useMemo(() => {
    if (!today) return [];
    const start = addDays(today, -dowOf(today) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter((iso) => !SITE.closedDays.includes(dowOf(iso)));
  }, [today, weekOffset]);

  const selectedBooking = all.find((b) => b.ref === selected) ?? null;

  if (q.isError && isUnauthorized(q.error)) return <Login />;

  const filters: AdminStatusFilter[] = ["all", "new", "confirmed", "done", "cancelled"];
  const statCards: { k: keyof typeof stats; hot?: boolean }[] = [{ k: "new", hot: true }, { k: "today" }, { k: "week" }, { k: "total" }];

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="container adm-top__bar">
          <div className="adm-top__brand">
            <Image src="/brand/mark.png" alt="" width={26} height={36} />
            <strong>{d.title}</strong>
          </div>
          <div className="adm-top__actions">
            <a href="/" className="adm-top__link">{d.site}</a>
            <button className="lang" onClick={() => dispatch(setLang(lang === "en" ? "ar" : "en"))}>{lang === "en" ? "العربية" : "English"}</button>
            <button className="btn btn--ghost btn--sm" onClick={() => logout.mutate()}>{d.logout}</button>
          </div>
        </div>
      </header>

      <main className="container adm-main">
        {q.isError && (
          <div className="state" role="alert"><p>{d.loadError}</p><button className="btn btn--ghost btn--sm" onClick={() => q.refetch()}>{d.retry}</button></div>
        )}

        <div className="adm-stats">
          {statCards.map(({ k, hot }) => (
            <div key={k} className="adm-stat" data-hot={hot && stats[k] > 0}>
              <strong><CountUp value={stats[k]} /></strong>
              <span>{d.stats[k]}</span>
            </div>
          ))}
        </div>

        <div className="adm-toolbar">
          <div className="adm-tabs" role="tablist">
            {(["list", "week"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} data-on={view === v} onClick={() => dispatch(setView(v))}>{d.views[v]}</button>
            ))}
          </div>
          {view === "list" && (
            <>
              <div className="adm-filters">
                {filters.map((f) => (
                  <button key={f} data-on={filter === f} data-s={f} onClick={() => dispatch(setFilter(f))}>
                    {f === "all" ? d.all : d.status[f]} <small>{counts[f]}</small>
                  </button>
                ))}
              </div>
              <input className="adm-search" type="search" value={search} onChange={(e) => dispatch(setSearch(e.target.value))} placeholder={d.search} aria-label={d.search} />
            </>
          )}
          {view === "week" && (
            <div className="adm-weeknav">
              <button className="btn btn--ghost btn--sm" onClick={() => dispatch(shiftWeek(dir === "rtl" ? 1 : -1))} aria-label={d.week.prev}>{dir === "rtl" ? "›" : "‹"}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => dispatch(shiftWeek(0))}>{d.week.thisWeek}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => dispatch(shiftWeek(dir === "rtl" ? -1 : 1))} aria-label={d.week.next}>{dir === "rtl" ? "‹" : "›"}</button>
            </div>
          )}
        </div>

        {q.isPending && <p className="state" role="status">…</p>}

        {view === "list" && !q.isPending && (
          filtered.length === 0 ? (
            <p className="state">{all.length === 0 ? d.emptyAll : d.empty}</p>
          ) : (
            <ul className="adm-list">
              <AnimatePresence initial={false}>
                {filtered.map((b) => (
                  <motion.li key={b.ref} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <button className="adm-row" data-past={b.date < today} data-new={b.status === "new"} onClick={() => dispatch(select(b.ref))}>
                      <span className="adm-row__when">
                        <strong>{fmtWeekday(b.date, lang)} {fmtDay(b.date, lang)} {fmtMonth(b.date, lang)}</strong>
                        <small>{fmtTime(b.time, lang)}</small>
                      </span>
                      <span className="adm-row__who">
                        <strong>{b.name}</strong>
                        <small>{serviceName(b.serviceId, lang)}{b.company ? ` · ${b.company}` : ""}</small>
                      </span>
                      <span className="adm-row__mode">{d.modes[b.mode]}</span>
                      <span className="adm-badge" data-s={b.status}>{d.status[b.status]}</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )
        )}

        {view === "week" && !q.isPending && (
          <div className="adm-week">
            {weekDays.map((iso) => {
              const items = all.filter((b) => b.date === iso && b.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div key={iso} className="adm-day" data-today={iso === today}>
                  <header>
                    <small>{fmtWeekday(iso, lang)}</small>
                    <strong>{fmtDay(iso, lang)}</strong>
                    <small>{fmtMonth(iso, lang)}</small>
                  </header>
                  {items.length === 0 && <p className="adm-day__none">{d.week.none}</p>}
                  {items.map((b) => (
                    <button key={b.ref} className="adm-slot" data-s={b.status} onClick={() => dispatch(select(b.ref))}>
                      <small>{fmtTime(b.time, lang)}</small>
                      <strong>{b.name}</strong>
                      <small>{serviceName(b.serviceId, lang)}</small>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedBooking && <Drawer key={selectedBooking.ref} booking={selectedBooking} onClose={() => dispatch(select(null))} />}
      </AnimatePresence>
    </div>
  );
}
