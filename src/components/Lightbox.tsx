import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categoryLabel, srcSet, type Photo } from '../data/photos';
import { SITE } from '../config';
import { prefersReducedMotion } from '../lib/hooks';

interface Props {
  photos: Photo[];
  index: number;
  onNavigate: (i: number) => void;
  onClose: () => void;
  getTile: (slug: string) => HTMLElement | null;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function fitRect(p: Photo): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mobile = vw < 760;
  const top = mobile ? 60 : 72;
  const bottom = mobile ? 150 : 112;
  const side = mobile ? 12 : 96;
  const maxW = vw - side * 2;
  const maxH = vh - top - bottom;
  const a = p.width / p.height;
  let w = maxW;
  let h = w / a;
  if (h > maxH) {
    h = maxH;
    w = h * a;
  }
  return { x: (vw - w) / 2, y: top + (maxH - h) / 2, w, h };
}

function tileImgRect(el: HTMLElement | null): Rect | null {
  const img = el?.querySelector('img');
  if (!img) return null;
  const r = img.getBoundingClientRect();
  if (r.width < 2 || r.bottom < 0 || r.top > window.innerHeight) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

const EASE = 'cubic-bezier(.2,.75,.15,1)';

export default function Lightbox({ photos, index, onNavigate, onClose, getTile }: Props) {
  const photo = photos[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const firstSlug = useRef(photo.slug);
  const currentSlug = useRef(photo.slug);
  const [rect, setRect] = useState<Rect>(() => fitRect(photo));
  const drag = useRef<{ x: number; y: number; id: number; dx: number } | null>(null);
  const reduced = prefersReducedMotion();

  currentSlug.current = photo.slug;

  useLayoutEffect(() => {
    setRect(fitRect(photo));
  }, [photo]);

  useEffect(() => {
    const onResize = () => setRect(fitRect(photo));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [photo]);

  // blokada przewijania strony (pozycja zostaje zachowana)
  useEffect(() => {
    const html = document.documentElement;
    const y = window.scrollY;
    html.classList.add('is-locked');
    return () => {
      html.classList.remove('is-locked');
      if (Math.abs(window.scrollY - y) > 2) window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      const tile = getTile(currentSlug.current);
      if (tile) {
        tile.focus({ preventScroll: true });
        const r = tile.getBoundingClientRect();
        if (r.bottom < 60 || r.top > window.innerHeight) tile.scrollIntoView({ block: 'center' });
      }
    };
  }, [getTile]);

  // odbitka rozwija się z miejsca w galerii
  useLayoutEffect(() => {
    const img = imgRef.current;
    const from = tileImgRect(getTile(firstSlug.current));
    dialogRef.current?.querySelector<HTMLButtonElement>('.lb__close')?.focus({ preventScroll: true });
    if (!img || reduced) return;
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
    if (!from) {
      img.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE });
      return;
    }
    const to = fitRect(photo);
    const sx = from.w / to.w;
    const sy = from.h / to.h;
    img.animate(
      [
        { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${sx}, ${sy})`, boxShadow: '0 0 0 rgba(0,0,0,0)' },
        { transform: 'none' },
      ],
      { duration: 560, easing: EASE },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const img = imgRef.current;
    const to = tileImgRect(getTile(currentSlug.current));
    if (!img || reduced) return onClose();
    const r = img.getBoundingClientRect();
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
    dialogRef.current?.querySelectorAll('.lb__ui').forEach((el) =>
      (el as HTMLElement).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }),
    );
    const anim = to
      ? img.animate(
          [
            { transform: 'none' },
            { transform: `translate(${to.x - r.left}px, ${to.y - r.top}px) scale(${to.w / r.width}, ${to.h / r.height})` },
          ],
          { duration: 460, easing: EASE, fill: 'forwards' },
        )
      : img.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.97)' }], { duration: 260, fill: 'forwards' });
    anim.onfinish = () => onClose();
  }, [getTile, onClose, reduced]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (closing.current) return;
      const next = (index + dir + photos.length) % photos.length;
      onNavigate(next);
      requestAnimationFrame(() => {
        imgRef.current?.animate(
          [
            { opacity: 0, transform: `translateX(${dir * (reduced ? 0 : 36)}px)` },
            { opacity: 1, transform: 'none' },
          ],
          { duration: reduced ? 1 : 340, easing: EASE },
        );
      });
    },
    [index, photos.length, onNavigate, reduced],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Tab') {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
        if (!items || !items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
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
  }, [go, requestClose]);

  // wstępne ładowanie sąsiadów
  useEffect(() => {
    [1, -1].forEach((d) => {
      const p = photos[(index + d + photos.length) % photos.length];
      const im = new Image();
      im.sizes = `${Math.round(fitRect(p).w)}px`;
      im.srcset = srcSet(p.slug, p.widths);
    });
  }, [index, photos]);

  // gest przesunięcia
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, dx: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    if (Math.abs(d.dx) > 6 && imgRef.current) imgRef.current.style.transform = `translateX(${d.dx * 0.6}px)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y;
    if (imgRef.current) imgRef.current.style.transform = '';
    if (Math.abs(d.dx) > 50 && Math.abs(d.dx) > Math.abs(dy)) go(d.dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(d.dx) * 1.5) requestClose();
  };

  return createPortal(
    <div
      className="lb"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Podgląd zdjęcia: ${photo.title}`}
    >
      <div className="lb__backdrop" ref={backdropRef} onClick={requestClose} />
      <div
        className="lb__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          if (imgRef.current) imgRef.current.style.transform = '';
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        <img
          key={photo.slug}
          ref={imgRef}
          className="lb__img"
          src={`/photos/${photo.slug}-${photo.widths[Math.min(2, photo.widths.length - 1)]}.webp`}
          srcSet={srcSet(photo.slug, photo.widths)}
          sizes={`${Math.round(rect.w)}px`}
          alt={photo.alt}
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, backgroundColor: photo.color }}
          draggable={false}
        />
      </div>

      <div className="lb__bar lb__ui">
        <p className="lb__count" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <button type="button" className="lb__close" onClick={requestClose}>
          Zamknij <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="lb__caption lb__ui">
        <p className="lb__title">{photo.title}</p>
        <p className="lb__meta">
          {categoryLabel(photo.category)}
          {SITE.showSampleLabel && photo.credit && (
            <>
              {' · '}Zdjęcie przykładowe:{' '}
              <a href={photo.credit.url} target="_blank" rel="noreferrer noopener">
                {photo.credit.author} / Unsplash
              </a>
            </>
          )}
        </p>
      </div>

      <button type="button" className="lb__nav lb__nav--prev lb__ui" onClick={() => go(-1)} aria-label="Poprzednie zdjęcie">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4 7 12l8 8" />
        </svg>
      </button>
      <button type="button" className="lb__nav lb__nav--next lb__ui" onClick={() => go(1)} aria-label="Następne zdjęcie">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4l8 8-8 8" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
