import Lenis from 'lenis';
import { useEffect, useRef, type RefObject } from 'react';

/* ───────────── preferencje ───────────── */

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────── jedna pętla przewijania ───────────── */

type Sub = (y: number, vh: number, vw: number) => void;
const subs = new Set<Sub>();
let lenis: Lenis | null = null;
let started = false;
let force = true;

export function initScroll() {
  if (started) return;
  started = true;
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
  }
  let lastY = -1;
  let lastH = -1;
  let lastW = -1;
  const frame = (t: number) => {
    lenis?.raf(t);
    const y = window.scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    if (force || y !== lastY || vh !== lastH || vw !== lastW) {
      force = false;
      lastY = y;
      lastH = vh;
      lastW = vw;
      subs.forEach((fn) => fn(y, vh, vw));
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  window.addEventListener('resize', () => (force = true));
  window.addEventListener('load', () => (force = true));
}

export function invalidateScroll() {
  force = true;
}

export function onScroll(fn: Sub): () => void {
  subs.add(fn);
  force = true;
  return () => {
    subs.delete(fn);
  };
}

export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
}

let locks = 0;
export function lockScroll(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.classList.toggle('is-locked', locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

/* ───────────── pojawianie się elementów ───────────── */

/** Obserwuje wszystkie [data-reveal] (również dodane później) i nadaje im klasę .is-in. */
export function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  const scan = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
      if (reducedMotion) el.classList.add('is-in');
      else io.observe(el);
    });
  };
  scan(document);
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n instanceof HTMLElement) {
          if (n.matches('[data-reveal]')) scan(n.parentElement ?? document);
          else scan(n);
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/* ───────────── paralaksa ───────────── */

/**
 * Przesuwa element względem jego rodzica (który powinien mieć overflow: hidden).
 * `amount` — ułamek wysokości rodzica, o jaki obraz może się przesunąć w każdą stronę.
 */
export function useParallax<T extends HTMLElement>(amount = 0.08, axis: 'y' | 'x' = 'y'): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const scale = 1 + amount * 2.2;
    return onScroll((_y, vh) => {
      const box = el.parentElement;
      if (!box) return;
      const r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const n = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      const d = -n * amount * (axis === 'y' ? r.height : r.width);
      el.style.transform =
        axis === 'y'
          ? `translate3d(0, ${d.toFixed(1)}px, 0) scale(${scale})`
          : `translate3d(${d.toFixed(1)}px, 0, 0) scale(${scale})`;
    });
  }, [amount, axis]);
  return ref;
}
