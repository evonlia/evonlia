"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useServices } from "@/lib/api";
import { useAppDispatch, useT } from "@/store/hooks";
import { chooseService, goToStep } from "@/store";

export default function Services() {
  const { t, lang } = useT();
  const dispatch = useAppDispatch();
  const { data, isPending, isError, refetch } = useServices();
  const [open, setOpen] = useState<string | null>("web");

  const book = (id: string) => {
    dispatch(chooseService(id));
    dispatch(goToStep(1));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section__head">
          <h2>{t.services.title}</h2>
          <p>{t.services.sub}</p>
        </div>

        {isPending && <p className="state" role="status">{t.services.loading}</p>}
        {isError && (
          <div className="state" role="alert">
            <p>{t.services.error}</p>
            <button className="btn btn--ghost btn--sm" onClick={() => refetch()}>{t.services.retry}</button>
          </div>
        )}

        <ul className="svc">
          {data?.map((s) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id} className="svc__item" data-open={isOpen}>
                <button
                  className="svc__head"
                  aria-expanded={isOpen}
                  aria-controls={`svc-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                >
                  <span className="svc__title">{s.title[lang]}</span>
                  <span className="svc__icon" aria-hidden="true">
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`svc-${s.id}`}
                      className="svc__body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <div className="svc__content">
                        <p className="svc__short">{s.short[lang]}</p>
                        <div>
                          <h3 className="svc__sub">{t.services.includes}</h3>
                          <ul className="svc__list">
                            {s.includes[lang].map((x) => <li key={x}>{x}</li>)}
                          </ul>
                          <button className="btn btn--gold btn--sm" onClick={() => book(s.id)}>{t.services.book}</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
