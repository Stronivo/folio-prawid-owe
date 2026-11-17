import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { categoryLabel, src, srcSet, type Photo } from '../data';
import { lockScroll, reducedMotion } from '../lib/motion';

interface Props {
  photos: Photo[];
  start: number;
  from: DOMRect | null;
  onClose: () => void;
}

type Box = { left: number; top: number; width: number; height: number };

function fit(ratio: number): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 760;
  const padX = mobile ? 0 : Math.max(96, vw * 0.08);
  const top = mobile ? 72 : 84;
  const bottom = mobile ? 132 : 104;
  const maxW = vw - padX * 2;
  const maxH = vh - top - bottom;
  let width = maxW;
  let height = width / ratio;
  if (height > maxH) {
    height = maxH;
    width = height * ratio;
  }
  return { left: (vw - width) / 2, top: top + (maxH - height) / 2, width, height };
}

export default function Lightbox({ photos, start, from, onClose }: Props) {
  const [index, setIndex] = useState(start);
  const [dir, setDir] = useState(0);
  const [box, setBox] = useState<Box>(() =>
    from && !reducedMotion
      ? { left: from.left, top: from.top, width: from.width, height: from.height }
      : fit(photos[start].ratio),
  );
  const [state, setState] = useState<'enter' | 'open' | 'closing'>('enter');
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(document.activeElement);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const photo = photos[index];

  // FLIP: z kafla do pełnego kadru
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setBox(fit(photos[start].ratio));
        setState('open');
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [photos, start]);

  useEffect(() => {
    lockScroll(true);
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      lockScroll(false);
      (opener.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onResize = () => setBox(fit(photos[index].ratio));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [photos, index]);

  const close = useCallback(() => {
    setState('closing');
    window.setTimeout(onClose, reducedMotion ? 0 : 380);
  }, [onClose]);

  const step = useCallback(
    (d: number) => {
      const n = (index + d + photos.length) % photos.length;
      setDir(d);
      setIndex(n);
      setBox(fit(photos[n].ratio));
    },
    [photos, index],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = Array.from(document.querySelectorAll<HTMLElement>('.lb button'));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, step]);

  // wczytaj sąsiednie zdjęcia z wyprzedzeniem
  useEffect(() => {
    [1, -1].forEach((d) => {
      const p = photos[(index + d + photos.length) % photos.length];
      const im = new Image();
      im.src = src(p, 1600);
    });
  }, [index, photos]);

  const style: CSSProperties = {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    ['--tone' as string]: photo.tone,
  };

  return (
    <div
      className={`lb is-${state}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} — ${categoryLabel(photo.category)}`}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
      }}
    >
      <div className="lb__bg" onClick={close} />

      <div className="lb__top">
        <span className="mono lb__count">
          <b>{String(index + 1).padStart(2, '0')}</b> / {String(photos.length).padStart(2, '0')}
        </span>
        <button ref={closeBtn} className="lb__close mono" onClick={close} data-cursor="Zamknij">
          Zamknij
          <span aria-hidden="true" className="lb__x" />
        </button>
      </div>

      <div className={`lb__frame ${state === 'open' ? 'is-settled' : ''}`} style={style}>
        <img
          key={photo.slug}
          className={`lb__img ${dir > 0 ? 'from-r' : dir < 0 ? 'from-l' : ''}`}
          srcSet={srcSet(photo)}
          sizes="90vw"
          src={src(photo, 1600)}
          alt={photo.alt}
          draggable={false}
        />
        <span className="corners is-on" aria-hidden="true"><i /><i /><i /><i /></span>
      </div>

      <div className="lb__bottom">
        <div className="lb__cap" key={photo.slug}>
          <span className="mono">{categoryLabel(photo.category)}</span>
          <strong>{photo.title}</strong>
        </div>
        <div className="lb__nav">
          <button onClick={() => step(-1)} aria-label="Poprzednie zdjęcie" data-cursor="Wstecz">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 5.5 4.5 12l6.5 6.5" /></svg>
          </button>
          <button onClick={() => step(1)} aria-label="Następne zdjęcie" data-cursor="Dalej">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 5.5l6.5 6.5-6.5 6.5" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
