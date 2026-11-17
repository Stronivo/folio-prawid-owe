import { Fragment, useEffect, useRef } from 'react';
import { MANIFEST_IMG, SITE } from '../data';
import { clamp, onScroll, reducedMotion } from '../lib/motion';
import Pic from '../components/Pic';

const TITLE: { w: string; em?: boolean; br?: boolean }[] = [
  { w: 'Nie' }, { w: 'robimy' }, { w: 'tylko' }, { w: 'zdjęć.', br: true },
  { w: 'Tworzymy' }, { w: 'wspomnienia.', em: true },
];

const VALUES = [
  { k: 'Światło', v: 'Naturalne, miękkie, prawdziwe. Pracuję z tym, co daje miejsce i pora dnia — i dokładam tylko tyle, ile trzeba.' },
  { k: 'Emocja', v: 'Nie ustawiam ludzi jak rekwizytów. Daję czas, rozmawiam, czekam. Prawdziwy uśmiech zawsze wygrywa z pozą.' },
  { k: 'Moment', v: 'Ułamek sekundy, który za rok będzie najcenniejszy. Mój zawód to być wtedy gotowym.' },
];

export default function Manifest() {
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = title.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>('.mw'));
    if (reducedMotion) {
      words.forEach((w) => (w.style.opacity = '1'));
      return;
    }
    return onScroll((_y, vh) => {
      const r = el.getBoundingClientRect();
      // 0 gdy nagłówek wchodzi od dołu, 1 gdy dochodzi do ~35% wysokości ekranu
      const p = clamp((vh * 0.92 - r.top) / (vh * 0.62 + r.height * 0.4));
      const n = words.length;
      words.forEach((w, i) => {
        const t = clamp(p * (n + 1.2) - i);
        w.style.opacity = (0.12 + t * 0.88).toFixed(3);
        w.style.transform = `translate3d(0, ${((1 - t) * 0.12).toFixed(3)}em, 0)`;
      });
    });
  }, []);

  return (
    <section id="manifest" className="manifest" data-nav="light">
      <div className="wrap">
        <div className="sec-head" data-reveal="fade">
          <span className="mono">(01)</span>
          <span className="mono">Manifest</span>
          <span className="sec-head__rule" />
          <span className="mono">{SITE.brand} — {SITE.photographer}</span>
        </div>

        <h2 className="manifest__title" ref={title}>
          {TITLE.map((t, i) => (
            <Fragment key={i}>
              <span className={`mw${t.em ? ' serif em' : ''}`}>{t.w}</span>
              {t.br ? <br /> : ' '}
            </Fragment>
          ))}
        </h2>

        <div className="manifest__body">
          <figure className="manifest__fig" data-reveal="clip">
            <Pic img={MANIFEST_IMG} sizes="(max-width: 760px) 80vw, 34vw" aspect="4 / 5" parallax={0.07} />
            <figcaption className="mono">Fig. 01 — Dłonie, bukiet, obrączka</figcaption>
          </figure>

          <div className="manifest__text">
            <p className="manifest__lead" data-reveal="up">
              Najpiękniejsze zdjęcia rzadko są pozowane. Dzieją się między jednym oddechem a drugim — w spojrzeniu,
              które trwa ułamek sekundy, w świetle, które za chwilę zniknie.
            </p>
            <p className="manifest__p" data-reveal="up" style={{ '--d': '0.1s' } as React.CSSProperties}>
              Szukam ich cierpliwie. Dbam o swobodną atmosferę przed obiektywem — wtedy zdjęcia przestają być tylko
              zdjęciami. Stają się wspomnieniami, do których chce się wracać za rok, za dziesięć lat, za całe życie.
            </p>

            <ul className="values">
              {VALUES.map((v, i) => (
                <li key={v.k} data-reveal="up" style={{ '--d': `${0.08 * i}s` } as React.CSSProperties}>
                  <span className="mono values__n">0{i + 1}</span>
                  <h3 className="values__k">{v.k}</h3>
                  <p className="values__v">{v.v}</p>
                </li>
              ))}
            </ul>

            <p className="manifest__sign serif" data-reveal="fade">— {SITE.photographer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
