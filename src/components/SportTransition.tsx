import { useRef } from 'react';
import { SPORT, srcSet } from '../data/photos';
import { SITE } from '../config';
import { coverMap, usePinnedProgress } from '../lib/scroll';
import { clamp01, easeIn, easeInOut, easeOut } from '../lib/iris';
import { useMediaQuery, REDUCED_MOTION, MOBILE } from '../lib/hooks';

/**
 * Piłka leci w stronę aparatu, na moment wypełnia kadr i odsłania kolejne zdjęcie:
 * akcja na boisku → spokojny portret.
 */
export default function SportTransition() {
  const reduced = useMediaQuery(REDUCED_MOTION);
  const mobile = useMediaQuery(MOBILE);
  const frameRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLImageElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const capA = useRef<HTMLDivElement>(null);
  const capB = useRef<HTMLDivElement>(null);
  const { action, portrait, ball } = SPORT;

  const ref = usePinnedProgress(
    (vw) => (vw < 760 ? 1.8 : 2.1),
    (p) => {
      const frame = frameRef.current;
      const b = ballRef.current;
      if (!frame || !b) return;
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      const isMobile = w < 760;
      const cm = coverMap(action.width, action.height, w, h, isMobile ? { x: 0.52, y: 0.75 } : action.focus);
      const start = cm.map(ball.x, ball.y);
      const r0 = ball.r * cm.dw;
      const r1 = Math.hypot(w, h) * 0.62;
      // lot piłki: rośnie wykładniczo, jak przy zbliżaniu się do obiektywu
      const t = easeIn(clamp01((p - 0.04) / 0.5));
      const r = r0 * Math.pow(r1 / r0, t);
      const cx = start.x + (w * 0.5 - start.x) * easeInOut(t);
      const cy = start.y + (h * 0.5 - start.y) * easeInOut(t);
      b.style.transform = `translate(${(cx - r).toFixed(1)}px, ${(cy - r).toFixed(1)}px)`;
      b.style.width = b.style.height = `${(2 * r).toFixed(1)}px`;
      b.style.filter = `blur(${(t * t * 10).toFixed(2)}px) brightness(${(1 - t * 0.45).toFixed(3)})`;
      const fadeBall = clamp01((p - 0.6) / 0.14);
      b.style.opacity = (1 - fadeBall).toFixed(3);
      b.style.visibility = fadeBall >= 1 ? 'hidden' : 'visible';
      // portret odsłania się z wnętrza piłki
      const rev = easeOut(clamp01((p - 0.55) / 0.25));
      if (portraitRef.current) {
        portraitRef.current.style.clipPath = `circle(${(rev * 75).toFixed(2)}% at 50% 50%)`;
        portraitRef.current.style.visibility = rev <= 0 ? 'hidden' : 'visible';
      }
      if (capA.current) capA.current.style.opacity = (1 - clamp01((p - 0.12) / 0.15)).toFixed(3);
      if (capB.current) capB.current.style.opacity = clamp01((p - 0.78) / 0.12).toFixed(3);
    },
    !reduced,
    1,
  );

  return (
    <section className={`sport${reduced ? ' sport--static' : ''}`} ref={ref} aria-labelledby="sport-title">
      <div className="sport__stage">
        <div className="sport__frame" ref={frameRef}>
          <img
            className="sport__img"
            src={`/photos/${action.slug}-1300.webp`}
            srcSet={srcSet(action.slug, action.widths)}
            sizes="100vw"
            alt={action.alt}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: mobile ? '52% 75%' : `${action.focus.x * 100}% ${action.focus.y * 100}%` }}
          />
          <img ref={ballRef} className="sport__ball" src={ball.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="sport__portrait" ref={portraitRef}>
            <img
              className="sport__img"
              src={`/photos/${portrait.slug}-1300.webp`}
              srcSet={srcSet(portrait.slug, portrait.widths)}
              sizes="100vw"
              alt={portrait.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: `${portrait.focus.x * 100}% ${portrait.focus.y * 100}%` }}
            />
          </div>
          <div className="sport__cap" ref={capA}>
            <p className="kicker kicker--light">Ruch</p>
            <h2 id="sport-title" className="display sport__title">
              Na boisku
            </h2>
          </div>
          <div className="sport__cap sport__cap--b" ref={capB} aria-hidden={reduced ? undefined : true}>
            <p className="kicker kicker--light">Chwilę później</p>
            <p className="display sport__title">Portret zawodniczki</p>
          </div>
          {SITE.showSampleLabel && <p className="sport__sample">Zdjęcia przykładowe</p>}
        </div>
      </div>
    </section>
  );
}
