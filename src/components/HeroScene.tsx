import { useLayoutEffect, useRef } from 'react';
import { HERO_NAME, HERO_SUBJECT, PHOTOS, srcSet } from '../data/photos';
import { SITE } from '../config';
import { clamp01, easeInOut, easeOut, lerp } from '../lib/iris';
import IrisShutter, { type IrisShutterHandle } from './IrisShutter';
import { playShutter } from '../lib/sound';

const HERO = PHOTOS[0];
/** Najazd przy wejściu: kadr startuje szerzej (ZOOM_FROM) i kończy ciaśniej (ZOOM). */
const ZOOM_FROM = 1.1;
const ZOOM = 1.22;
const ZOOM_FROM_MOBILE = 1.02;
const ZOOM_MOBILE = 1.1;

interface Geo {
  vw: number;
  vh: number;
  mobile: boolean;
  hero: { x: number; y: number; w: number; h: number };
  a: number; // koniec ustawiania ostrości
  c0: number; // początek lotu do galerii
  R: number; // koniec sceny
}

function computeGeo(): Geo {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const mobile = vw < 760;
  const headerH = mobile ? 58 : 72;
  // pełny kadr od krawędzi do krawędzi, pod paskiem nagłówka
  const hero = { x: 0, y: headerH, w: vw, h: vh - headerH };
  const a = vh * (mobile ? 0.34 : 0.5);
  const c0 = a + vh * (mobile ? 0.08 : 0.12);
  const R = c0 + vh * (mobile ? 0.8 : 0.95);
  return { vw, vh, mobile, hero, a, c0, R };
}

/** Mapuje punkt zdjęcia (0–1) na ramkę z object-fit: cover i danym punktem kadrowania. */
function mapPoint(px: number, py: number, w: number, h: number, focus: { x: number; y: number }) {
  const scale = Math.max(w / HERO.width, h / HERO.height);
  const dw = HERO.width * scale;
  const dh = HERO.height * scale;
  return { x: (w - dw) * focus.x + px * dw, y: (h - dh) * focus.y + py * dh };
}

/** Oś czasu wejścia (ms od odsłonięcia zdjęcia). */
const T = { zoom: 1300, focusFrom: 880, focusTo: 1120, nameFrom: 1080, nameTo: 1700, uiFrom: 1400, uiTo: 1950 };

export default function HeroScene({ scene }: { scene: boolean }) {
  const sceneRef = useRef<HTMLElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const sharpRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const cutoutRef = useRef<HTMLImageElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const cornerA = useRef<HTMLSpanElement>(null);
  const cornerB = useRef<HTMLSpanElement>(null);
  const shutterRef = useRef<IrisShutterHandle>(null);
  const geo = useRef<Geo | null>(null);
  const armed = useRef(true);
  /** postęp wejścia: 0–1 dla najazdu, ostrości, nazwiska i podpisu */
  const entry = useRef({ zoom: 0, sharp: 0, name: 0, ui: 0, started: false });

  const fireShutter = () => {
    playShutter();
    flyerRef.current?.classList.add('is-captured');
    shutterRef.current?.fire(300);
  };

  useLayoutEffect(() => {
    const sceneEl = sceneRef.current;
    const flyer = flyerRef.current;
    if (!sceneEl || !flyer) return;
    const gallery = document.getElementById('portfolio');
    const en = entry.current;

    if (!scene || window.scrollY > 40) {
      Object.assign(en, { zoom: 1, sharp: 1, name: 1, ui: 1, started: true });
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const g = geo.current ?? (geo.current = computeGeo());
      const { hero, mobile } = g;
      const focus = mobile ? HERO.focusMobile ?? HERO.focus : HERO.focus;

      const s = scene ? window.scrollY - sceneEl.offsetTop : 0;
      const pA = scene ? clamp01(s / g.a) : 0;
      const pC = scene ? clamp01((s - g.c0) / (g.R - g.c0)) : 0;
      const landed = scene && s >= g.R - 0.5;
      const e = easeInOut(pC);

      // — ostrość: najazd kończy się złapaniem ostrości; przy przewijaniu obiektyw
      //   na moment „szuka”, a potem ostrość wskakuje na miejsce —
      const hunt = pA < 0.84 ? 0.6 * easeOut(pA / 0.84) : 0;
      if (sharpRef.current) sharpRef.current.style.opacity = (en.sharp * (1 - hunt)).toFixed(3);

      // — najazd (ta sama pozycja bohatera także podczas lotu) —
      const zoom = lerp(mobile ? ZOOM_FROM_MOBILE : ZOOM_FROM, mobile ? ZOOM_MOBILE : ZOOM, easeOut(en.zoom)) * (1 - e) + 1 * e;
      const zoomEl = zoomRef.current;
      const origin = mapPoint((HERO_SUBJECT.x0 + HERO_SUBJECT.x1) / 2, (HERO_SUBJECT.y0 + HERO_SUBJECT.y1) / 2, hero.w, hero.h, focus);
      if (zoomEl) zoomEl.style.transform = `scale(${zoom.toFixed(4)})`;

      // — migawka w chwili złapania ostrości —
      if (scene && pA >= 0.985 && armed.current && pC === 0) {
        armed.current = false;
        fireShutter();
      }
      if (pA < 0.6) {
        armed.current = true;
        flyer.classList.remove('is-captured');
      }

      // — lot odbitki na miejsce w portfolio —
      const tile = scene ? gallery?.querySelector<HTMLElement>('.tile--hero .print') ?? null : null;
      let rect = hero;
      let padPx = 0;
      let fade = 1;
      if (tile) {
        const r = tile.getBoundingClientRect();
        padPx = parseFloat(getComputedStyle(tile).paddingLeft) || 0;
        // miejsce, w którym kafel stanie w chwili lądowania (galeria wciąż podjeżdża)
        const landTop = r.top - Math.max(0, g.R - s);
        rect = {
          x: lerp(hero.x, r.left, e),
          y: lerp(hero.y, landTop, e),
          w: lerp(hero.w, r.width, e),
          h: lerp(hero.h, r.height, e),
        };
      } else if (pC > 0) {
        fade = 1 - e;
        rect = { x: hero.x, y: lerp(hero.y, hero.y - g.vh * 0.4, e), w: hero.w, h: hero.h };
      }
      flyer.style.transform = `translate(${rect.x.toFixed(2)}px, ${rect.y.toFixed(2)}px)`;
      flyer.style.width = `${rect.w.toFixed(2)}px`;
      flyer.style.height = `${rect.h.toFixed(2)}px`;
      flyer.style.padding = `${(padPx * e).toFixed(2)}px`;
      flyer.style.setProperty('--pp', e.toFixed(3));
      flyer.style.opacity = String(fade);
      flyer.style.visibility = landed && tile ? 'hidden' : 'visible';
      if (scene) {
        gallery?.setAttribute('data-scene', landed || !tile ? 'landed' : 'flying');
        gallery?.style.setProperty('--reveal', clamp01((pC - 0.5) / 0.45).toFixed(3));
        gallery?.style.setProperty('--head', clamp01((pC - 0.35) / 0.5).toFixed(3));
      } else gallery?.setAttribute('data-scene', 'landed');

      // — nazwisko za sylwetką: odsłania się zza horyzontu, ustępuje przy ostrzeniu —
      const nameOut = 1 - clamp01((pA - 0.3) / 0.4);
      const nameIn = easeOut(en.name);
      const name = nameRef.current;
      if (name) {
        name.style.clipPath = `inset(${((1 - nameIn) * 100).toFixed(1)}% -5% -2% -5%)`;
        name.style.transform = `translateY(${((1 - nameIn) * 18).toFixed(1)}%)`;
        name.style.opacity = nameOut.toFixed(3);
        name.style.visibility = nameOut <= 0.01 ? 'hidden' : 'visible';
      }
      if (cutoutRef.current) cutoutRef.current.style.visibility = nameOut <= 0.01 || pC > 0 ? 'hidden' : 'visible';

      // — podpis i przycisk —
      const ui = uiRef.current;
      if (ui) {
        const t = easeOut(en.ui) * (1 - clamp01(pA / 0.3));
        ui.style.opacity = t.toFixed(3);
        ui.style.visibility = t <= 0.01 ? 'hidden' : 'visible';
        ui.style.transform = `translateY(${((1 - easeOut(en.ui)) * 14 - clamp01(pA / 0.3) * 10).toFixed(1)}px)`;
      }

      // — narożniki ostrości (z uwzględnieniem najazdu) —
      const iw = rect.w - 2 * padPx * e;
      const ih = rect.h - 2 * padPx * e;
      const z = (p: { x: number; y: number }) => ({ x: origin.x + (p.x - origin.x) * zoom, y: origin.y + (p.y - origin.y) * zoom });
      const p0 = z(mapPoint(HERO_SUBJECT.x0, HERO_SUBJECT.y0, hero.w, hero.h, focus));
      const p1 = z(mapPoint(HERO_SUBJECT.x1, HERO_SUBJECT.y1, hero.w, hero.h, focus));
      const inset = mobile ? 16 : 26;
      const eA = easeInOut(pA);
      const size = mobile ? 24 : 34;
      // narożnik „⌝” (prawy górny) i „L” (lewy dolny) — jak w logo
      const ax = lerp(hero.w - inset, p1.x, eA) - size;
      const ay = lerp(inset, Math.max(inset, p0.y), eA);
      const bx = lerp(inset, p0.x, eA);
      const by = lerp(hero.h - inset, Math.min(hero.h - inset, p1.y), eA) - size;
      const cornerOpacity = clamp01(pA * 8) * (1 - clamp01(pC * 5));
      const sx = iw / hero.w;
      const sy = ih / hero.h;
      if (cornerA.current && cornerB.current) {
        cornerA.current.style.transform = `translate(${(ax * sx).toFixed(1)}px, ${(ay * sy).toFixed(1)}px)`;
        cornerB.current.style.transform = `translate(${(bx * sx).toFixed(1)}px, ${(by * sy).toFixed(1)}px)`;
        cornerA.current.style.opacity = cornerB.current.style.opacity = cornerOpacity.toFixed(3);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    /** Rozmiar i położenie nazwiska: litery stoją na linii `baseline` zdjęcia. */
    const layoutName = () => {
      const g = geo.current!;
      const name = nameRef.current;
      const zoomEl = zoomRef.current;
      if (!name || !zoomEl) return;
      const focus = g.mobile ? HERO.focusMobile ?? HERO.focus : HERO.focus;
      name.style.fontSize = '100px';
      const lines = Array.from(name.querySelectorAll<HTMLElement>('.hero__line'));
      const widest = g.mobile ? Math.max(...lines.map((l) => l.offsetWidth)) : name.offsetWidth;
      // po najeździe nazwisko ma zająć ok. 92% szerokości kadru
      const target = (g.hero.w * (g.mobile ? 0.9 : 0.92)) / (g.mobile ? ZOOM_MOBILE : ZOOM);
      const fs = Math.min(100 * (target / Math.max(1, widest)), g.mobile ? 200 : 420);
      name.style.fontSize = `${fs.toFixed(1)}px`;
      name.style.left = `${((g.hero.w - name.offsetWidth) / 2).toFixed(1)}px`;
      const base = mapPoint(0.5, g.mobile ? HERO_NAME.baselineMobile : HERO_NAME.baseline, g.hero.w, g.hero.h, focus);
      name.style.bottom = `${(g.hero.h - base.y).toFixed(1)}px`;
      const origin = mapPoint((HERO_SUBJECT.x0 + HERO_SUBJECT.x1) / 2, (HERO_SUBJECT.y0 + HERO_SUBJECT.y1) / 2, g.hero.w, g.hero.h, focus);
      zoomEl.style.transformOrigin = `${origin.x.toFixed(1)}px ${origin.y.toFixed(1)}px`;
    };

    const onResize = () => {
      geo.current = computeGeo();
      const g = geo.current;
      sceneEl.style.height = scene ? `${g.vh + g.R}px` : `${g.vh}px`;
      sceneEl.style.setProperty('--stage-h', `${g.vh}px`);
      if (gallery) gallery.style.marginTop = scene ? `${-g.vh}px` : '0px';
      const ui = uiRef.current;
      if (ui) ui.style.setProperty('--hero-bottom', `${g.vh}px`);
      layoutName();
      update();
    };
    let lastW = document.documentElement.clientWidth;
    const onWindowResize = () => {
      // na telefonie ignoruj zmiany wysokości od paska adresu
      const w = document.documentElement.clientWidth;
      const g = geo.current;
      if (g && g.mobile && w === lastW && Math.abs(window.innerHeight - g.vh) < 140) return;
      lastW = w;
      onResize();
    };

    // — wejście: najazd → ostrość → nazwisko → podpis —
    let entryRaf = 0;
    const startEntry = () => {
      if (en.started) return;
      en.started = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = now - t0;
        en.zoom = clamp01(t / T.zoom);
        en.sharp = clamp01((t - T.focusFrom) / (T.focusTo - T.focusFrom));
        en.name = clamp01((t - T.nameFrom) / (T.nameTo - T.nameFrom));
        en.ui = clamp01((t - T.uiFrom) / (T.uiTo - T.uiFrom));
        update();
        if (t < T.uiTo) entryRaf = requestAnimationFrame(step);
      };
      entryRaf = requestAnimationFrame(step);
    };
    const onReveal = () => startEntry();
    if (import.meta.env.DEV) {
      // pomoc przy testach w ukrytej karcie (bez animacji klatek)
      (window as unknown as { __folioEntry: (v: number) => void }).__folioEntry = (v: number) => {
        Object.assign(en, { zoom: v, sharp: v, name: v, ui: v, started: true });
        update();
      };
    }
    window.addEventListener('folio:reveal', onReveal);
    if (document.fonts) document.fonts.ready.then(() => onResize());

    onResize();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onWindowResize);
    const ro = gallery ? new ResizeObserver(schedule) : null;
    if (gallery && ro) ro.observe(gallery);
    return () => {
      window.removeEventListener('folio:reveal', onReveal);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onWindowResize);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (entryRaf) cancelAnimationFrame(entryRaf);
      en.started = en.zoom >= 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const sizes = '100vw';
  const vars = {
    '--fx': `${HERO.focus.x * 100}%`,
    '--fy': `${HERO.focus.y * 100}%`,
    '--fxm': `${(HERO.focusMobile ?? HERO.focus).x * 100}%`,
    '--fym': `${(HERO.focusMobile ?? HERO.focus).y * 100}%`,
  } as React.CSSProperties;

  return (
    <section className={`scene${scene ? '' : ' scene--static'}`} ref={sceneRef} id="top" aria-label="Zdjęcie główne">
      <div className="scene__stage">
        <div className="flyer" ref={flyerRef} style={vars}>
          <div className="flyer__frame">
            <div className="flyer__zoom" ref={zoomRef}>
              <img
                className="flyer__img flyer__img--soft"
                src={`/photos/${HERO.slug}-960.webp`}
                srcSet={srcSet(HERO.slug, HERO.widths)}
                sizes={sizes}
                alt=""
                aria-hidden="true"
                {...{ fetchpriority: 'high' }}
                decoding="async"
                style={{ backgroundColor: HERO.color }}
              />
              <img
                ref={sharpRef}
                className="flyer__img flyer__img--sharp"
                src={`/photos/${HERO.slug}-1600.webp`}
                srcSet={srcSet(HERO.slug, HERO.widths)}
                sizes={sizes}
                alt={HERO.alt}
                {...{ fetchpriority: 'high' }}
              />
              <h1 className="hero__name" ref={nameRef} aria-label={SITE.photographer}>
                <span className="hero__line">LEON</span>
                <span className="hero__space"> </span>
                <span className="hero__line hero__line--last">KLIMEK</span>
              </h1>
              {HERO_NAME.cutout && (
                <img
                  ref={cutoutRef}
                  className="flyer__img flyer__img--cutout"
                  src={`/photos/${HERO_NAME.cutout.slug}-${HERO_NAME.cutout.widths[0]}.webp`}
                  srcSet={HERO_NAME.cutout.widths.map((w) => `/photos/${HERO_NAME.cutout!.slug}-${w}.webp ${w}w`).join(', ')}
                  sizes={sizes}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                />
              )}
            </div>
            <IrisShutter ref={shutterRef} className="flyer__shutter" />
          </div>
          <span className="focus-corner focus-corner--a" ref={cornerA} aria-hidden="true" />
          <span className="focus-corner focus-corner--b" ref={cornerB} aria-hidden="true" />
        </div>

        <div className="hero__ui" ref={uiRef}>
          <p className="hero__tagline">{SITE.tagline}</p>
          <a className="hero__cta" href="#portfolio">
            Zobacz zdjęcia
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v15M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
