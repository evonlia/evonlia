"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "@/store/hooks";

gsap.registerPlugin(ScrollTrigger);

export default function Process() {
  const { t } = useT();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // The gold line draws itself as you scroll; each step lights up when the line reaches it.
        gsap.fromTo(".proc__fill", { scaleY: 0 }, {
          scaleY: 1, ease: "none", transformOrigin: "top",
          scrollTrigger: { trigger: ".proc__list", start: "top 65%", end: "bottom 65%", scrub: 0.4 },
        });
        gsap.utils.toArray<HTMLElement>(".proc__step").forEach((el) => {
          ScrollTrigger.create({
            trigger: el, start: "top 65%",
            onEnter: () => el.classList.add("is-lit"),
            onLeaveBack: () => el.classList.remove("is-lit"),
          });
        });
      }, root);
      return () => ctx.revert();
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.current?.querySelectorAll(".proc__step").forEach((el) => el.classList.add("is-lit"));
      gsap.set(".proc__fill", { scaleY: 1 });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="process" className="section section--alt">
      <div className="container proc">
        <div className="section__head proc__head">
          <h2>{t.process.title}</h2>
        </div>
        <ol className="proc__list">
          <span className="proc__track" aria-hidden="true"><span className="proc__fill" /></span>
          {t.process.steps.map((s, i) => (
            <li key={s.t} className="proc__step">
              <span className="proc__num" aria-hidden="true">{i + 1}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
