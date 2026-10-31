"use client";

import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import { useT } from "@/store/hooks";

export default function Projects() {
  const { t, lang } = useT();
  const items = PROJECTS.filter((p) => p.enabled !== false);
  if (!items.length) return null;

  return (
    <section id="work" className="section work-section" aria-labelledby="work-title">
      <div className="container">
        <div className="section__head">
          <h2 id="work-title">{t.work.title}</h2>
        </div>

        <ul className="work">
          {items.map((p) => {
            const inner = (
              <>
                <div className="work__media">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt[lang]}
                    width={p.image.width}
                    height={p.image.height}
                    sizes="(max-width: 700px) 100vw, 560px"
                  />
                </div>
                <div className="work__row">
                  <div>
                    <h3 className="work__name">{p.name}</h3>
                    {p.type && <p className="work__type">{p.type[lang]}</p>}
                  </div>
                  {p.href && <span className="work__go">{t.work.visit}<i aria-hidden="true" /></span>}
                </div>
              </>
            );
            return (
              <li key={p.id}>
                {p.href ? (
                  <a className="work__card" href={p.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  <div className="work__card">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
