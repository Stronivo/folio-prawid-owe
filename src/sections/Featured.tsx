import { useEffect, useRef, type CSSProperties } from 'react';
import { FEATURED } from '../data';
import { clamp, invalidateScroll, onScroll, reducedMotion } from '../lib/motion';
import { go } from '../components/Nav';

const F = FEATURED.frames;

export default function Featured() {
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const title = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = outer.current;
    const tr = track.current;
    if (!sec || !tr || reducedMotion) return;
    let dist = 0;
    const measure = () => {
      dist = Math.max(0, tr.scrollWidth - window.innerWidth);
      sec.style.height = `${dist + window.innerHeight}px`;
      invalidateScroll();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    window.addEventListener('resize', measure);
    const frames = Array.from(tr.querySelectorAll<HTMLElement>('[data-hx]'));
    const off = onScroll((_y, vh, vw) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      tr.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (title.current) title.current.style.transform = `translate3d(${(p * dist * 0.18).toFixed(1)}px, 0, 0)`;
      frames.forEach((el) => {
        const box = el.parentElement!.getBoundingClientRect();
        const n = clamp((box.left + box.width / 2 - vw / 2) / vw, -1.2, 1.2);
        el.style.transform = `translate3d(${(-n * box.width * 0.12).toFixed(1)}px, 0, 0) scale(1.3)`;
      });
      if (counter.current) {
        const idx = Math.min(F.length, Math.max(1, Math.round(p * (F.length - 1)) + 1));
        counter.current.textContent = String(idx).padStart(2, '0');
      }
    });
    return () => {
      off();
      ro.disconnect();
      window.removeEventListener('resize', measure);
      sec.style.height = '';
    };
  }, []);

  return (
    <section id="projekt" className={`feat ${reducedMotion ? 'is-static' : ''}`} data-nav="dark" ref={outer}>
      <div className="feat__sticky">
        <div className="feat__track" ref={track}>
          <div className="feat__intro">
            <div className="sec-head">
              <span className="mono">(03)</span>
              <span className="mono">Featured project</span>
            </div>
            <div className="feat__title-wrap">
              <div className="feat__title display" ref={title}>{FEATURED.name}</div>
            </div>
            <p className="feat__sub serif">{FEATURED.subtitle}</p>
            <p className="feat__lead">{FEATURED.intro}</p>
            <dl className="feat__meta">
              {FEATURED.meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="feat__hint mono" aria-hidden="true">
              Przewiń <span className="feat__hint-line" />
            </p>
          </div>

          <Frame i={0} cls="feat__f feat__f--wide" />
          <Frame i={1} cls="feat__f feat__f--tall" />

          <blockquote className="feat__quote">
            <span className="mono">— Notatka z planu</span>
            <p className="serif">„{FEATURED.quote}”</p>
          </blockquote>

          <div className="feat__pair">
            <Frame i={2} cls="feat__f feat__f--sm" />
            <Frame i={3} cls="feat__f feat__f--md" />
          </div>

          <Frame i={4} cls="feat__f feat__f--tall" />

          <div className="feat__end">
            <span className="mono">Koniec serii</span>
            <p className="feat__end-title display">
              Twoja historia<br />
              <em className="serif">może być następna.</em>
            </p>
            <a href="#kontakt" className="btn btn--flash" onClick={(e) => go(e, '#kontakt')}>
              <span className="btn__label">Zaplanuj sesję</span>
              <span className="btn__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5.5l6.5 6.5-6.5 6.5" /></svg>
              </span>
            </a>
          </div>
        </div>

        <div className="feat__bar" aria-hidden="true">
          <span className="mono">{FEATURED.name}</span>
          <span className="feat__progress"><span ref={bar} /></span>
          <span className="mono">
            <span ref={counter}>01</span> / {String(F.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}

function Frame({ i, cls }: { i: number; cls: string }) {
  const f = F[i];
  return (
    <figure className={cls} style={{ '--ar': f.ratio } as CSSProperties}>
      <div className="feat__img pic" style={{ '--tone': f.tone } as CSSProperties}>
        <img
          data-hx
          srcSet={f.widths.map((w) => `/photos/${f.slug}-${w}.webp ${w}w`).join(', ')}
          sizes="(max-width: 760px) 80vw, 50vw"
          src={`/photos/${f.slug}-1080.webp`}
          alt={f.alt}
          loading="lazy"
          decoding="async"
          onLoad={(e) => e.currentTarget.parentElement?.classList.add('is-loaded')}
        />
      </div>
      <figcaption>
        <span className="mono">0{i + 1}</span>
        <strong>{f.caption}</strong>
        {f.note && <span className="feat__note">{f.note}</span>}
      </figcaption>
    </figure>
  );
}
