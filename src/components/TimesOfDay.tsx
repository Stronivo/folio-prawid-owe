import { useRef, useState } from 'react';
import { TIMES } from '../data/photos';
import { SITE } from '../config';
import { usePinnedProgress } from '../lib/scroll';
import { clamp01, easeInOut } from '../lib/iris';
import { useMediaQuery, REDUCED_MOTION } from '../lib/hooks';

const srcs = (slug: string) => TIMES.widths.map((w) => `/photos/${slug}-${w}.webp ${w}w`).join(', ');

/** Miękka granica światła przesuwająca się w poprzek kadru (b: −0.2 → 1.2). */
function boundary(b: number) {
  const pos = b * 100;
  return `linear-gradient(100deg, #000 ${(pos - 14).toFixed(2)}%, transparent ${(pos + 14).toFixed(2)}%)`;
}

export default function TimesOfDay() {
  const reduced = useMediaQuery(REDUCED_MOTION);
  const dusk = useRef<HTMLImageElement>(null);
  const night = useRef<HTMLImageElement>(null);
  const lamps = useRef<(HTMLImageElement | null)[]>([]);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const L = TIMES.layers;

  const ref = usePinnedProgress(
    (vw) => (vw < 760 ? 2.2 : 2.6),
    (p) => {
      const b1 = -0.2 + 1.4 * easeInOut(clamp01((p - 0.06) / 0.36));
      const b2 = -0.2 + 1.4 * easeInOut(clamp01((p - 0.46) / 0.32));
      const set = (el: HTMLImageElement | null, b: number) => {
        if (!el) return;
        const m = b <= -0.19 ? 'linear-gradient(#0000,#0000)' : b >= 1.19 ? 'none' : boundary(b);
        el.style.webkitMaskImage = m;
        el.style.maskImage = m;
        el.style.visibility = b <= -0.19 ? 'hidden' : 'visible';
      };
      set(dusk.current, b1);
      set(night.current, b2);
      // latarnie zapalają się kolejno, rozświetlając fragment ulicy
      lamps.current.forEach((el, i) => {
        if (el) el.style.opacity = easeInOut(clamp01((p - 0.78 - i * 0.08) / 0.08)).toFixed(3);
      });
      const ph = p < 0.3 ? 0 : p < 0.64 ? 1 : 2;
      if (ph !== phaseRef.current) {
        phaseRef.current = ph;
        setPhase(ph);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    },
    !reduced,
    0.5,
  );

  const labels = [L.day.label, L.dusk.label, L.night.label];
  const fx = `${TIMES.focus.x * 100}%`;

  return (
    <section className={`times${reduced ? ' times--static' : ''}`} ref={ref} aria-labelledby="times-title">
      <div className="times__stage">
        <div
          className="times__frame"
          style={
            {
              '--fx': fx,
              '--fy': `${TIMES.focus.y * 100}%`,
              '--fxm': `${TIMES.focusMobile.x * 100}%`,
              '--fym': `${TIMES.focusMobile.y * 100}%`,
            } as React.CSSProperties
          }
        >
          <img className="times__img" src={`/photos/${L.day.slug}-1200.webp`} srcSet={srcs(L.day.slug)} sizes="100vw" alt={TIMES.alt} loading="lazy" decoding="async" />
          <img ref={dusk} className="times__img times__img--layer" src={`/photos/${L.dusk.slug}-1200.webp`} srcSet={srcs(L.dusk.slug)} sizes="100vw" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <img ref={night} className="times__img times__img--layer" src={`/photos/${L.night.slug}-1200.webp`} srcSet={srcs(L.night.slug)} sizes="100vw" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          {TIMES.lamps.map((slug, i) => (
            <img
              key={slug}
              ref={(el) => {
                lamps.current[i] = el;
              }}
              className="times__img times__img--lamp"
              src={`/photos/${slug}-1200.webp`}
              srcSet={srcs(slug)}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          ))}
          <div className="times__shade" aria-hidden="true" />

          <div className="times__head">
            <p className="kicker kicker--light">Miejsca</p>
            <h2 id="times-title" className="display times__title">
              Jedno miejsce,
              <br />
              trzy pory dnia
            </h2>
          </div>

          <div className="times__foot">
            <ol className="times__labels" aria-label="Pora dnia">
              {labels.map((l, i) => (
                <li key={l} className={i === phase ? 'is-active' : ''} aria-current={i === phase ? 'step' : undefined}>
                  {l}
                </li>
              ))}
            </ol>
            <span className="times__bar" aria-hidden="true">
              <span ref={barRef} />
            </span>
            <p className="times__note">
              {TIMES.place ? `${TIMES.place}. ` : ''}
              {SITE.showSampleLabel && TIMES.generated
                ? 'Kadr przykładowy — trzy warianty światła przygotowane z jednego zdjęcia. Docelowo: trzy ujęcia jednego miejsca w Żorach z tej samej pozycji.'
                : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
