import { useLayoutEffect, useRef } from 'react';
import { HERO_SUBJECT, PHOTOS, srcSet } from '../data/photos';
import { SITE } from '../config';
import { clamp01, easeInOut, easeOut, lerp } from '../lib/iris';
import IrisShutter, { type IrisShutterHandle } from './IrisShutter';
import { playShutter } from '../lib/sound';

const HERO = PHOTOS[0];

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
  const pad = mobile ? 12 : 24;
  const hero = mobile
    ? { x: pad, y: headerH, w: vw - pad * 2, h: Math.max(300, vh - headerH - 292) }
    : { x: pad, y: headerH, w: vw - pad * 2, h: vh - headerH - pad };
  const a = vh * (mobile ? 0.32 : 0.5);
  const c0 = a + vh * (mobile ? 0.08 : 0.12);
  const R = c0 + vh * (mobile ? 0.78 : 0.95);
  return { vw, vh, mobile, hero, a, c0, R };
}

/** Mapuje punkt zdjęcia (0–1) na ramkę z object-fit: cover i danym punktem kadrowania. */
function mapPoint(px: number, py: number, w: number, h: number, focus: { x: number; y: number }) {
  const ia = HERO.width / HERO.height;
  const scale = Math.max(w / HERO.width, h / HERO.height);
  const dw = HERO.width * scale;
  const dh = dw / ia;
  const ox = (w - dw) * focus.x;
  const oy = (h - dh) * focus.y;
  return { x: ox + px * dw, y: oy + py * dh };
}

export default function HeroScene({ scene }: { scene: boolean }) {
  const sceneRef = useRef<HTMLElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const sharpRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cornerA = useRef<HTMLSpanElement>(null);
  const cornerB = useRef<HTMLSpanElement>(null);
  const shutterRef = useRef<IrisShutterHandle>(null);
  const geo = useRef<Geo | null>(null);
  const armed = useRef(true);

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

    let raf = 0;
    const update = () => {
      raf = 0;
      const g = geo.current ?? (geo.current = computeGeo());
      const { hero, mobile } = g;
      const focus = mobile ? HERO.focusMobile ?? HERO.focus : HERO.focus;
      const sharp = sharpRef.current;
      const text = textRef.current;

      if (!scene) {
        flyer.style.transform = `translate(${hero.x}px, ${hero.y}px)`;
        flyer.style.width = `${hero.w}px`;
        flyer.style.height = `${hero.h}px`;
        if (sharp) sharp.style.opacity = '1';
        gallery?.setAttribute('data-scene', 'landed');
        return;
      }

      const s = window.scrollY - sceneEl.offsetTop;
      const pA = clamp01(s / g.a);
      const pC = clamp01((s - g.c0) / (g.R - g.c0));
      const landed = s >= g.R - 0.5;

      // — ostrość —
      if (sharp) sharp.style.opacity = easeOut(pA).toFixed(3);

      // — migawka w chwili złapania ostrości —
      if (pA >= 0.985 && armed.current && pC === 0) {
        armed.current = false;
        fireShutter();
      }
      if (pA < 0.6) {
        armed.current = true;
        flyer.classList.remove('is-captured');
      }

      // — lot odbitki na miejsce w portfolio —
      const tile = gallery?.querySelector<HTMLElement>('.tile--hero .print') ?? null;
      let rect = hero;
      let padPx = 0;
      let fade = 1;
      const e = easeInOut(pC);
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
      gallery?.setAttribute('data-scene', landed || !tile ? 'landed' : 'flying');
      gallery?.style.setProperty('--reveal', clamp01((pC - 0.5) / 0.45).toFixed(3));
      gallery?.style.setProperty('--head', clamp01((pC - 0.35) / 0.5).toFixed(3));

      // — narożniki ostrości —
      const iw = rect.w - 2 * padPx * e;
      const ih = rect.h - 2 * padPx * e;
      const p0 = mapPoint(HERO_SUBJECT.x0, HERO_SUBJECT.y0, hero.w, hero.h, focus);
      const p1 = mapPoint(HERO_SUBJECT.x1, HERO_SUBJECT.y1, hero.w, hero.h, focus);
      const inset = mobile ? 14 : 22;
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

      // — podpis na zdjęciu głównym —
      if (text) {
        // na desktopie podpis leży na zdjęciu — ustępuje, zanim migawka się domknie
        const t = mobile ? 1 - clamp01(pC * 7) : 1 - clamp01((pA - 0.5) / 0.42);
        text.style.opacity = t.toFixed(3);
        text.style.visibility = t <= 0.01 ? 'hidden' : 'visible';
        text.style.transform = `translateY(${(-(1 - t) * 24).toFixed(1)}px)`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      geo.current = computeGeo();
      const g = geo.current;
      sceneEl.style.height = scene ? `${g.vh + g.R}px` : `${g.mobile ? g.hero.y + g.hero.h + 292 : g.vh}px`;
      sceneEl.style.setProperty('--stage-h', `${g.vh}px`);
      if (gallery) gallery.style.marginTop = scene ? `${-g.vh}px` : '0px';
      const text = textRef.current;
      if (text) {
        text.style.setProperty('--hero-x', `${g.hero.x}px`);
        text.style.setProperty('--hero-y', `${g.hero.y}px`);
        text.style.setProperty('--hero-w', `${g.hero.w}px`);
        text.style.setProperty('--hero-h', `${g.hero.h}px`);
      }
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
    onResize();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onWindowResize);
    const ro = gallery ? new ResizeObserver(schedule) : null;
    if (gallery && ro) ro.observe(gallery);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onWindowResize);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const sizes = '(max-width: 760px) 100vw, 100vw';

  return (
    <section className={`scene${scene ? '' : ' scene--static'}`} ref={sceneRef} id="top" aria-label="Zdjęcie główne">
      <div className="scene__stage">
        <div
          className="flyer"
          ref={flyerRef}
          style={
            {
              '--fx': `${HERO.focus.x * 100}%`,
              '--fy': `${HERO.focus.y * 100}%`,
              '--fxm': `${(HERO.focusMobile ?? HERO.focus).x * 100}%`,
              '--fym': `${(HERO.focusMobile ?? HERO.focus).y * 100}%`,
            } as React.CSSProperties
          }
        >
          <div className="flyer__frame">
            <img
              className="flyer__img flyer__img--soft"
              src={`/photos/${HERO.slug}-960.webp`}
              srcSet={srcSet(HERO.slug, HERO.widths)}
              sizes={sizes}
              alt=""
              aria-hidden="true"
              {...{ fetchpriority: "high" }}
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
              {...{ fetchpriority: "high" }}
            />
            <IrisShutter ref={shutterRef} className="flyer__shutter" />
          </div>
          <span className="focus-corner focus-corner--a" ref={cornerA} aria-hidden="true" />
          <span className="focus-corner focus-corner--b" ref={cornerB} aria-hidden="true" />
        </div>

        <div className="hero__text" ref={textRef}>
          <h1 className="display hero__name">
            Leon <br />
            Klimek
          </h1>
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
