import { useEffect, useRef } from 'react';
import { finePointer, reducedMotion } from '../lib/motion';

/** Kursor-wizjer: kropka, która nad zdjęciem zmienia się w ramkę z narożnikami. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer || reducedMotion) return;
    const el = ref.current!;
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, cx = -100, cy = -100;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add('is-visible');
      const t = (e.target as Element | null)?.closest?.('[data-cursor], a, button, input, textarea, label');
      const text = t?.getAttribute('data-cursor');
      el.classList.toggle('is-view', !!text);
      el.classList.toggle('is-link', !!t && !text);
      if (text && label.current && label.current.textContent !== text) label.current.textContent = text;
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const leave = () => el.classList.remove('is-visible');
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  if (!finePointer) return null;
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span className="cursor__dot" />
      <span className="cursor__frame"><i /><i /><i /><i /></span>
      <span className="cursor__label mono" ref={label} />
    </div>
  );
}
