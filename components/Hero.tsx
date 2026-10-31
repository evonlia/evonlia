"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "@/store/hooks";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const { t, lang } = useT();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // 1) Entrance: the mark rises (clip wipes upward), headline lines slide out of masks.
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(".hero__mark-clip", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" }, 0)
          .fromTo(".hero__glow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }, 0.1)
          .fromTo(".hero__line > span", { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.14 }, 0.25)
          .fromTo(".hero__fade", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.9);

        // 2) The one signature moment: light that follows the pointer across the gold mark.
        const light = el.querySelector<HTMLElement>(".hero__mark-light");
        if (light) {
          const qx = gsap.quickTo(light, "--mx", { duration: 0.7, ease: "power3.out" });
          const qy = gsap.quickTo(light, "--my", { duration: 0.7, ease: "power3.out" });
          gsap.set(light, { "--mx": 50, "--my": 20 });
          const move = (e: PointerEvent) => {
            const r = light.getBoundingClientRect();
            qx(((e.clientX - r.left) / r.width) * 100);
            qy(((e.clientY - r.top) / r.height) * 100);
          };
          window.addEventListener("pointermove", move);
          // idle drift so touch devices and first view still catch the light
          gsap.to(light, { "--mx": 70, "--my": 70, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
          return () => window.removeEventListener("pointermove", move);
        }
      }, el);

      // 3) Scroll: mark drifts up slower than the page.
      gsap.to(".hero__mark", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title">
            <span className="hero__line"><span>{t.hero.line1}</span></span>
            <span className="hero__line hero__line--gold"><span>{t.hero.line2}</span></span>
          </h1>
          <p className="hero__sub hero__fade">{t.hero.sub}</p>
          <div className="hero__actions hero__fade">
            <a href="#book" className="btn btn--gold btn--lg">{t.hero.cta}</a>
            <a href="#services" className="btn btn--ghost btn--lg">{t.hero.cta2}</a>
          </div>
          <p className="hero__note hero__fade">{t.hero.note}</p>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="hero__glow" />
          <div className="hero__mark">
            <div className="hero__mark-clip">
              <Image src="/brand/mark.png" alt="" width={515} height={724} priority className="hero__mark-img" />
              <div className="hero__mark-light" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">{lang === "ar" ? "إيفونليا" : "Evonlia"}</span>
    </section>
  );
}
