"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector, useT } from "@/store/hooks";
import { closeMenu, setLang, setTheme, toggleMenu } from "@/store";
import { applyTheme } from "@/lib/theme";

export default function Header() {
  const { t, lang } = useT();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.menuOpen);
  const theme = useAppSelector((s) => s.ui.theme);
  const flipTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    dispatch(setTheme(next));
    applyTheme(next);
  };

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
          <button className="theme-btn" onClick={flipTheme} aria-label={theme === "dark" ? t.theme.toLight : t.theme.toDark} title={theme === "dark" ? t.theme.toLight : t.theme.toDark}>
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7Z" /></svg>
            )}
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
