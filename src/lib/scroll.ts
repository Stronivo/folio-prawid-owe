import { useEffect, useRef } from 'react';

/**
 * Scena przypięta do ekranu: sekcja ma wysokość (1 + runway) × wysokość okna,
 * a callback dostaje postęp 0–1 przy zwykłym przewijaniu (także kciukiem).
 * Przy ograniczonym ruchu `runway` = 0 i postęp jest stały (`staticProgress`).
 */
export function usePinnedProgress(
  runway: (vw: number) => number,
  onProgress: (p: number, vw: number, vh: number) => void,
  enabled: boolean,
  staticProgress = 1,
) {
  const ref = useRef<HTMLElement>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let vh = window.innerHeight;
    let vw = document.documentElement.clientWidth;
    let lastW = vw;
    const update = () => {
      raf = 0;
      if (!enabled) return cb.current(staticProgress, vw, vh);
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      cb.current(p, vw, vh);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const size = () => {
      vw = document.documentElement.clientWidth;
      const h = window.innerHeight;
      // na telefonie pasek adresu zmienia wysokość — nie przeliczaj sceny od nowa
      if (vw === lastW && Math.abs(h - vh) < 140 && el.style.height) {
        schedule();
        return;
      }
      lastW = vw;
      vh = h;
      el.style.height = enabled ? `${Math.round(vh * (1 + runway(vw)))}px` : '';
      el.style.setProperty('--stage-h', `${vh}px`);
      update();
    };
    size();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', size);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', size);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return ref;
}

/** Punkt zdjęcia (0–1) w ramce z object-fit: cover i punktem kadrowania. */
export function coverMap(
  iw: number,
  ih: number,
  w: number,
  h: number,
  focus: { x: number; y: number },
) {
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = (w - dw) * focus.x;
  const oy = (h - dh) * focus.y;
  return { scale, dw, dh, map: (px: number, py: number) => ({ x: ox + px * dw, y: oy + py * dh }) };
}

export const bump = (x: number) => Math.max(0, 1 - Math.abs(x));
