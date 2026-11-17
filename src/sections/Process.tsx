import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PROCESS } from '../data';
import { clamp, onScroll } from '../lib/motion';
import Lines from '../components/Lines';
import Pic from '../components/Pic';

export default function Process() {
  const [active, setActive] = useState(0);
  const steps = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cur = 0;
    return onScroll((_y, vh) => {
      const list = steps.current;
      if (!list) return;
      const r = list.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > li'));
      const line = vh * (window.innerWidth < 760 ? 0.72 : 0.58);
      let next = 0;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < line) next = i;
      });
      if (next !== cur) {
        cur = next;
        setActive(next);
      }
      if (fill.current) {
        const p = clamp((line - r.top) / r.height);
        fill.current.style.transform = `scaleY(${p.toFixed(4)})`;
      }
    });
  }, []);

  return (
    <section id="proces" className="process" data-nav="light">
      <div className="wrap">
        <div className="sec-head" data-reveal="fade">
          <span className="mono">(04)</span>
          <span className="mono">Proces</span>
          <span className="sec-head__rule" />
          <span className="mono">4 kroki</span>
        </div>
        <div className="process__head">
          <Lines className="process__title display" lines={['Od pomysłu', <em className="serif" key="e">do odbitki.</em>]} />
          <p className="process__intro" data-reveal="up">
            Każda sesja przechodzi przez te same cztery etapy. Dzięki temu wiesz, czego się spodziewać — a ja mogę
            skupić się na tym, co najważniejsze: na Tobie.
          </p>
        </div>
      </div>

      <div className="wrap process__grid" style={{ '--active': active } as CSSProperties}>
        <div className="process__stage-wrap">
          <div className="process__stage">
            {PROCESS.map((s, i) => (
              <div key={s.n} className={`process__shot ${i <= active ? 'is-on' : ''} ${i === active ? 'is-current' : ''}`}>
                <Pic img={s.img} aspect={null} sizes="(max-width: 760px) 92vw, 44vw" />
              </div>
            ))}
            <span className="corners is-on" aria-hidden="true"><i /><i /><i /><i /></span>
            <div className="process__counter display" aria-hidden="true">
              <span className="process__digits">
                {PROCESS.map((s) => (
                  <span key={s.n}>{s.n}</span>
                ))}
              </span>
            </div>
            <span className="process__label mono" aria-hidden="true">
              {PROCESS[active].title}
            </span>
          </div>
        </div>

        <ol className="process__steps" ref={steps}>
          <span className="process__rail" aria-hidden="true"><span ref={fill} /></span>
          {PROCESS.map((s, i) => (
            <li key={s.n} className={`step ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}>
              <span className="step__n mono">{s.n}</span>
              <h3 className="step__title display">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
