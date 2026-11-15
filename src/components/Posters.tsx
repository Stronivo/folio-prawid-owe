import { useRef } from 'react';
import { POSTERS, srcSet } from '../data/photos';
import { SITE } from '../config';
import { bump, usePinnedProgress } from '../lib/scroll';
import { easeInOut } from '../lib/iris';
import { useMediaQuery, REDUCED_MOTION } from '../lib/hooks';

/** Ustawia filtr w portfolio i przewija do galerii. */
export function openCategory(filter: string) {
  window.dispatchEvent(new CustomEvent('folio:filter', { detail: filter }));
}

/**
 * Trzy fotograficzne pasy „Ludzie / Ruch / Miejsca”. Wąski pas pokazuje detal,
 * aktywny (zależny od przewinięcia) rozszerza się do pełnej kompozycji.
 */
export default function Posters() {
  const reduced = useMediaQuery(REDUCED_MOTION);
  const bands = useRef<(HTMLAnchorElement | null)[]>([]);
  const n = POSTERS.length;

  const ref = usePinnedProgress(
    (vw) => (vw < 760 ? 1.9 : 2.2),
    (p) => {
      bands.current.forEach((el, i) => {
        if (!el) return;
        // płynne „przejęcie” ekranu przez kolejne pasy
        const a = easeInOut(Math.min(1, bump(p * (n - 1) * 1.1 - i * 1.1 + 0.0)));
        el.style.flexGrow = (0.55 + a * 5).toFixed(3);
        el.style.setProperty('--open', a.toFixed(3));
      });
    },
    !reduced,
  );

  return (
    <section className={`posters${reduced ? ' posters--static' : ''}`} ref={ref} aria-label="Kategorie zdjęć">
      <div className="posters__stage">
        {POSTERS.map((p, i) => (
          <a
            key={p.word}
            className="poster"
            href="#portfolio"
            ref={(el) => {
              bands.current[i] = el;
            }}
            onClick={(e) => {
              e.preventDefault();
              openCategory(p.filter);
            }}
            style={{ '--fx': `${p.image.focus.x * 100}%`, '--fy': `${p.image.focus.y * 100}%` } as React.CSSProperties}
          >
            <img
              className="poster__img"
              src={`/photos/${p.image.slug}-${p.image.widths[Math.min(1, p.image.widths.length - 1)]}.webp`}
              srcSet={srcSet(p.image.slug, p.image.widths)}
              sizes="100vw"
              alt={p.image.alt}
              loading="lazy"
              decoding="async"
            />
            <span className="poster__word">{p.word}</span>
            <span className="poster__meta">
              <span>{p.hint}</span>
              <span className="poster__go">Zobacz zdjęcia →</span>
            </span>
          </a>
        ))}
        {SITE.showSampleLabel && <p className="posters__sample">Zdjęcia przykładowe</p>}
      </div>
    </section>
  );
}
