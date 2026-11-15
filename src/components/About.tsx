import { useEffect, useRef, useState } from 'react';
import { FILMSTRIP } from '../data/photos';
import { SITE } from '../config';

/**
 * „O mnie”: pasek klatek z jednej akcji. Gdy sekcja wchodzi w ekran, wokół
 * najlepszej klatki rysuje się odręczny owal — jak przy wyborze zdjęcia do publikacji.
 */
export default function About() {
  const stripRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="about" id="o-mnie" aria-labelledby="about-title">
      <div className={`contact-sheet${drawn ? ' is-drawn' : ''}`} ref={stripRef} role="img" aria-label={`${FILMSTRIP.alt} Zaznaczona klatka ${FILMSTRIP.best + 1}.`}>
        <div className="filmstrip">
          {FILMSTRIP.frames.map((src, i) => (
            <figure key={src} className={`filmstrip__frame${i === FILMSTRIP.best ? ' is-best' : ''}`}>
              <img src={src} alt="" loading="lazy" decoding="async" width={600} height={400} />
              {i === FILMSTRIP.best && (
                <svg className="grease-oval" viewBox="0 0 200 140" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    pathLength={1}
                    d="M104 9 C 52 6, 12 26, 9 66 C 6 108, 54 133, 106 131 C 160 129, 194 104, 192 66 C 190 26, 150 6, 96 11 C 70 13, 52 18, 40 25"
                  />
                </svg>
              )}
            </figure>
          ))}
        </div>
      </div>

      <div className="about__text">
        <p className="kicker">O mnie</p>
        <h2 id="about-title" className="display about__title">
          Cześć, jestem Leon.
        </h2>
      </div>
      <div className="about__body-wrap">
        <p className="about__body">
          Robię zdjęcia w&nbsp;{SITE.area}. Lubię kadry, na których ktoś jest zajęty chwilą i&nbsp;zapomina o&nbsp;aparacie
          — skok na deskorolce, mecz na osiedlowym boisku, spacer o&nbsp;zachodzie.
        </p>
        <p className="about__body">
          Jeśli masz ochotę wyjść na zdjęcia albo masz własny pomysł na kadr, napisz do mnie.
        </p>
        <a className="text-link" href="#kontakt">
          Napisz do Leona
        </a>
      </div>
    </section>
  );
}
