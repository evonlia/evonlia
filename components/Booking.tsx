"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateBooking, useServices, useSlots } from "@/lib/api";
import { buildIcs, fmtDay, fmtLong, fmtMonth, fmtTime, fmtWeekday, nextDays } from "@/lib/format";
import { SITE } from "@/lib/site";
import { useAppDispatch, useAppSelector, useT } from "@/store/hooks";
import { chooseDate, chooseMode, chooseService, chooseTime, confirm, goToStep, reset, setDetail, type Mode } from "@/store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Errors = Partial<Record<"topic" | "time" | "name" | "email" | "phone" | "form", string>>;

export default function Booking() {
  const { t, lang, dir } = useT();
  const b = useAppSelector((s) => s.booking);
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { data: services } = useServices();
  const slots = useSlots(b.date);
  const create = useCreateBooking();
  const [errors, setErrors] = useState<Errors>({});

  // With a single service there is nothing to choose: preselect it and skip the topic step.
  const single = services?.length === 1;
  useEffect(() => {
    if (single && services && !b.serviceId) {
      dispatch(chooseService(services[0].id));
      if (b.step === 0) dispatch(goToStep(1));
    }
  }, [single, services, b.serviceId, b.step, dispatch]);

  const days = useMemo(() => nextDays(SITE.daysAhead + 7).slice(0, SITE.daysAhead), []);
  const sign = dir === "rtl" ? -1 : 1;
  const serviceName = (id: string | null) => services?.find((s) => s.id === id)?.title[lang] ?? "";

  const go = (step: 0 | 1 | 2) => { setErrors({}); dispatch(goToStep(step)); };

  const next = () => {
    if (b.step === 0) {
      if (!b.serviceId) return setErrors({ topic: t.booking.errors.topic });
      return go(1);
    }
    if (b.step === 1) {
      if (!b.date || !b.time) return setErrors({ time: t.booking.errors.time });
      return go(2);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = b.details;
    const err: Errors = {};
    if (d.name.trim().length < 2) err.name = t.booking.errors.name;
    if (!EMAIL.test(d.email.trim())) err.email = t.booking.errors.email;
    if (d.phone.replace(/\D/g, "").length < 7) err.phone = t.booking.errors.phone;
    setErrors(err);
    if (Object.keys(err).length || !b.serviceId || !b.date || !b.time) return;

    create.mutate(
      {
        serviceId: b.serviceId, date: b.date, time: b.time, mode: b.mode,
        name: d.name.trim(), email: d.email.trim(), phone: d.phone.trim(),
        company: d.company.trim() || undefined, message: d.message.trim() || undefined,
      },
      {
        onSuccess: (r) => dispatch(confirm({ ref: r.ref, serviceId: r.serviceId, date: r.date, time: r.time, mode: r.mode, name: r.name, email: r.email })),
        onError: (e: Error & { code?: string }) => {
          if (e.code === "taken") {
            qc.invalidateQueries({ queryKey: ["slots", b.date] });
            dispatch(chooseTime(null));
            setErrors({ time: t.booking.errors.taken });
            dispatch(goToStep(1));
          } else {
            setErrors({ form: t.booking.errors.generic });
          }
        },
      },
    );
  };

  const downloadIcs = () => {
    const c = b.confirmed;
    if (!c) return;
    const ics = buildIcs({
      ref: c.ref, date: c.date, time: c.time,
      title: `Evonlia — ${serviceName(c.serviceId)}`,
      description: `Reference ${c.ref}. ${SITE.email}`,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `evonlia-${c.ref}.ics` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const field = (key: "name" | "email" | "phone" | "company", label: string, type = "text", auto?: string) => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={b.details[key]}
        autoComplete={auto}
        inputMode={key === "phone" ? "tel" : undefined}
        aria-invalid={!!errors[key as keyof Errors]}
        onChange={(e) => dispatch(setDetail({ key, value: e.target.value }))}
        dir={key === "email" || key === "phone" ? "ltr" : undefined}
      />
      {errors[key as keyof Errors] && <em role="alert">{errors[key as keyof Errors]}</em>}
    </label>
  );

  const modes: Mode[] = SITE.modes;

  return (
    <section id="book" className="section book">
      <div className="container">
        <div className="section__head">
          <h2>{t.booking.title}</h2>
          <p>{t.booking.sub}</p>
        </div>

        <div className="panel">
          {b.step < 3 && (
            <ol className="stepper" aria-label={t.booking.title}>
              {t.booking.steps
                .map((label, i) => ({ label, i }))
                .filter((x) => !(single && x.i === 0))
                .map(({ label, i }, pos) => (
                  <li key={label} data-state={i < b.step ? "done" : i === b.step ? "now" : "todo"} aria-current={i === b.step ? "step" : undefined}>
                    <span>{pos + 1}</span>{label}
                  </li>
                ))}
            </ol>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={b.step}
              initial={{ opacity: 0, x: 28 * sign }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 * sign }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* STEP 0 — topic */}
              {b.step === 0 && (
                <div>
                  <h3 className="panel__q">{t.booking.topic}</h3>
                  <div className="chips" role="radiogroup" aria-label={t.booking.topic}>
                    {services?.map((s) => (
                      <button
                        key={s.id} type="button" role="radio" aria-checked={b.serviceId === s.id}
                        className="chip" data-on={b.serviceId === s.id}
                        onClick={() => { setErrors({}); dispatch(chooseService(s.id)); }}
                      >
                        {s.title[lang]}
                      </button>
                    ))}
                  </div>
                  {errors.topic && <p className="err" role="alert">{errors.topic}</p>}
                </div>
              )}

              {/* STEP 1 — date, time, mode */}
              {b.step === 1 && (
                <div className="when">
                  <h3 className="panel__q">{t.booking.pickDate}</h3>
                  <div className="days" role="radiogroup" aria-label={t.booking.pickDate}>
                    {days.map((d) => (
                      <button
                        key={d.iso} type="button" role="radio" aria-checked={b.date === d.iso}
                        className="day" data-on={b.date === d.iso}
                        onClick={() => { setErrors({}); dispatch(chooseDate(d.iso)); }}
                      >
                        <small>{fmtWeekday(d.iso, lang)}</small>
                        <strong>{fmtDay(d.iso, lang)}</strong>
                        <small>{fmtMonth(d.iso, lang)}</small>
                      </button>
                    ))}
                  </div>

                  {b.date && (
                    <>
                      <h3 className="panel__q">{t.booking.pickTime}</h3>
                      {slots.isPending && <p className="state" role="status">…</p>}
                      {slots.isError && <p className="err" role="alert">{t.booking.slotsError}</p>}
                      {slots.data && slots.data.length === 0 && <p className="state">{t.booking.noSlots}</p>}
                      <div className="times" role="radiogroup" aria-label={t.booking.pickTime}>
                        {slots.data?.map((s) => (
                          <button
                            key={s} type="button" role="radio" aria-checked={b.time === s}
                            className="time" data-on={b.time === s}
                            onClick={() => { setErrors({}); dispatch(chooseTime(s)); }}
                          >
                            {fmtTime(s, lang)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {modes.length > 1 && (
                    <>
                      <h3 className="panel__q">{t.booking.mode}</h3>
                      <div className="chips" role="radiogroup" aria-label={t.booking.mode}>
                        {modes.map((m) => (
                          <button key={m} type="button" role="radio" aria-checked={b.mode === m} className="chip" data-on={b.mode === m} onClick={() => dispatch(chooseMode(m))}>
                            {t.booking.modes[m]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {errors.time && <p className="err" role="alert">{errors.time}</p>}
                </div>
              )}

              {/* STEP 2 — details */}
              {b.step === 2 && (
                <form onSubmit={submit} noValidate>
                  <div className="recap">
                    <strong>{serviceName(b.serviceId)}</strong>
                    <span>{b.date && fmtLong(b.date, lang)} · {b.time && fmtTime(b.time, lang)}</span>
                  </div>
                  <div className="form-grid">
                    {field("name", t.booking.name, "text", "name")}
                    {field("email", t.booking.email, "email", "email")}
                    {field("phone", t.booking.phone, "tel", "tel")}
                    {field("company", t.booking.company, "text", "organization")}
                    <label className="field field--full">
                      <span>{t.booking.message}</span>
                      <textarea rows={4} value={b.details.message} onChange={(e) => dispatch(setDetail({ key: "message", value: e.target.value }))} />
                    </label>
                  </div>
                  {errors.form && <p className="err" role="alert">{errors.form}</p>}
                  <div className="nav">
                    <button type="button" className="btn btn--ghost" onClick={() => go(1)}>{t.booking.back}</button>
                    <button type="submit" className="btn btn--gold" disabled={create.isPending}>
                      {create.isPending ? t.booking.confirming : t.booking.confirm}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3 — confirmation */}
              {b.step === 3 && b.confirmed && (
                <div className="done">
                  <motion.svg
                    width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"
                  >
                    <motion.circle cx="32" cy="32" r="29" stroke="var(--gold)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                    <motion.path d="M20 33l8 8 16-17" stroke="var(--gold-hi)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
                  </motion.svg>
                  <h3>{t.booking.doneTitle}</h3>
                  <p>{t.booking.doneBody}</p>
                  <dl className="recap-list">
                    <div><dt>{t.booking.ref}</dt><dd dir="ltr">{b.confirmed.ref}</dd></div>
                    <div><dt>{t.booking.when}</dt><dd>{fmtLong(b.confirmed.date, lang)} · {fmtTime(b.confirmed.time, lang)}</dd></div>
                    <div><dt>{t.booking.what}</dt><dd>{serviceName(b.confirmed.serviceId)}</dd></div>
                    <div><dt>{t.booking.how}</dt><dd>{t.booking.modes[b.confirmed.mode]}</dd></div>
                  </dl>
                  <div className="nav nav--center">
                    <button className="btn btn--gold" onClick={downloadIcs}>{t.booking.addCal}</button>
                    <button className="btn btn--ghost" onClick={() => dispatch(reset())}>{t.booking.another}</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {b.step < 2 && (
            <div className="nav">
              {b.step === 1 && !single ? <button className="btn btn--ghost" onClick={() => go(0)}>{t.booking.back}</button> : <span />}
              <button className="btn btn--gold" onClick={next}>{t.booking.next}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
