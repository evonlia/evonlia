"use client";

import Image from "next/image";
import { useT } from "@/store/hooks";
import { SITE } from "@/lib/site";

export default function Footer() {
  const { t, lang } = useT();
  return (
    <footer id="contact" className="footer">
      <div className="container footer__grid">
        <div>
          <Image src="/brand/lockup.png" alt="Evonlia" width={220} height={120} className="footer__logo" />
        </div>
        <div className="footer__contact">
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.phoneDisplay}</a>
          <span>{SITE.city[lang]}</span>
        </div>
      </div>
      <div className="container footer__legal">
        <span>© {new Date().getFullYear()} {lang === "ar" ? "إيفونليا" : "Evonlia"}. {t.footer.rights}</span>
        <span>{t.footer.tag}</span>
      </div>
    </footer>
  );
}
