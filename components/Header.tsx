"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector, useT } from "@/store/hooks";
import { closeMenu, setLang, toggleMenu } from "@/store";

export default function Header() {
  const { t, lang } = useT();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.menuOpen);

  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#work", label: t.nav.work },
    { href: "#process", label: t.nav.process },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="header">
      <div className="container header__bar">
        <a href="#top" className="header__logo" aria-label="Evonlia">
          <Image
            src={lang === "ar" ? "/brand/wordmark-ar.png" : "/brand/wordmark.png"}
            alt="Evonlia"
            width={lang === "ar" ? 120 : 150}
            height={lang === "ar" ? 31 : 22}
            priority
          />
        </a>

        <nav className="header__nav" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="header__actions">
          <button className="lang" onClick={() => dispatch(setLang(lang === "en" ? "ar" : "en"))} lang={lang === "en" ? "ar" : "en"}>
            {t.lang}
          </button>
          <a href="#book" className="btn btn--gold btn--sm header__cta">{t.nav.book}</a>
          <button
            className="burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => dispatch(toggleMenu())}
          >
            <span data-open={open} />
            <span data-open={open} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="container mobile-menu__inner">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => dispatch(closeMenu())}>{l.label}</a>
              ))}
              <a href="#book" className="btn btn--gold" onClick={() => dispatch(closeMenu())}>{t.nav.book}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
