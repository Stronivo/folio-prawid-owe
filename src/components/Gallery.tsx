import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, PHOTOS, categoryLabel, srcSet, type CategoryId, type Photo } from '../data/photos';
import { SITE } from '../config';
import { computeLayout, layoutOptions } from '../lib/layout';
import Lightbox from './Lightbox';

type Filter = 'all' | CategoryId;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  ...CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
];

export const HERO_SLUG = PHOTOS[0].slug;

export default function Gallery({ scene }: { scene: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [width, setWidth] = useState(0);
  const [vh, setVh] = useState(() => window.innerHeight);
  const [open, setOpen] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ x: 0, w: 0 });
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastBoxes = useRef(new Map<string, { x: number; y: number; w: number; h: number }>());

  const visible = useMemo(
    () => (filter === 'all' ? PHOTOS : PHOTOS.filter((p) => p.category === filter)),
    [filter],
  );

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      setWidth(el.clientWidth);
      setVh(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { boxes, height } = useMemo(
    () => (width ? computeLayout(visible, width, layoutOptions(width, vh)) : { boxes: [], height: 0 }),
    [visible, width, vh],
  );
  const opts = layoutOptions(width || 1200, vh);

  // pozycje kafli: widoczne dostają nowe miejsca, ukryte zostają tam, gdzie były
  const positions = new Map<string, { x: number; y: number; w: number; h: number }>();
  visible.forEach((p, i) => boxes[i] && positions.set(p.slug, boxes[i]));
  useEffect(() => {
    positions.forEach((b, k) => lastBoxes.current.set(k, b));
  });

  // podkreślenie aktywnego filtra
  useLayoutEffect(() => {
    const wrap = filtersRef.current;
    const btn = wrap?.querySelector<HTMLButtonElement>(`[data-filter="${filter}"]`);
    if (!wrap || !btn) return;
    const update = () => setUnderline({ x: btn.offsetLeft, w: btn.offsetWidth });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [filter]);

  const chooseFilter = (f: Filter, el: HTMLButtonElement) => {
    setFilter(f);
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  // przejście z plakatów kategorii: ustaw filtr i wróć do galerii
  useEffect(() => {
    const onFilter = (e: Event) => {
      const f = (e as CustomEvent<string>).detail as Filter;
      if (!FILTERS.some((x) => x.id === f)) return;
      setFilter(f);
      document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('folio:filter', onFilter);
    return () => window.removeEventListener('folio:filter', onFilter);
  }, []);

  // głęboki link #zdjecie-<slug> (np. powrót przyciskiem „wstecz”)
  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#zdjecie-(.+)$/);
      if (!m) {
        setOpen(null);
        return;
      }
      const idx = PHOTOS.findIndex((p) => p.slug === decodeURIComponent(m[1]));
      if (idx >= 0) {
        setFilter('all');
        setOpen(idx);
      }
    };
    fromHash();
    window.addEventListener('popstate', fromHash);
    return () => window.removeEventListener('popstate', fromHash);
  }, []);

  const openPhoto = (i: number) => {
    const p = visible[i];
    history.pushState({ folioPhoto: p.slug }, '', `#zdjecie-${p.slug}`);
    setOpen(i);
  };

  const closePhoto = useCallback(() => {
    if (history.state && history.state.folioPhoto) history.back();
    else {
      history.replaceState(null, '', location.pathname + location.search);
      setOpen(null);
    }
  }, []);

  const navigate = useCallback(
    (i: number) => {
      const p = visible[i];
      history.replaceState({ folioPhoto: p.slug }, '', `#zdjecie-${p.slug}`);
      setOpen(i);
    },
    [visible],
  );

  const getTile = useCallback((slug: string) => tileRefs.current.get(slug) ?? null, []);

  return (
    <section id="portfolio" className={`gallery${scene ? ' gallery--scene' : ''}`} aria-labelledby="portfolio-title">
      <div className="gallery__head">
        <h2 id="portfolio-title" className="display gallery__title">
          Portfolio
        </h2>
        {SITE.showSampleLabel && <p className="sample-label">Zdjęcia przykładowe</p>}
      </div>

      <div className="filters" ref={filtersRef} role="group" aria-label="Kategorie zdjęć">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            data-filter={f.id}
            className={`filters__btn${filter === f.id ? ' is-active' : ''}`}
            aria-pressed={filter === f.id}
            onClick={(e) => chooseFilter(f.id, e.currentTarget)}
          >
            {f.label}
          </button>
        ))}
        <span className="filters__underline" style={{ transform: `translateX(${underline.x}px)`, width: underline.w }} aria-hidden="true" />
      </div>
      <p className="visually-hidden" aria-live="polite">
        {filter === 'all' ? `Wszystkie zdjęcia: ${visible.length}` : `${categoryLabel(filter)}: ${visible.length} zdjęć`}
      </p>

      <div className="grid" ref={gridRef} style={{ height }}>
        {PHOTOS.map((p: Photo) => {
          const idx = visible.indexOf(p);
          const shown = idx >= 0;
          const box = positions.get(p.slug) ?? lastBoxes.current.get(p.slug);
          if (!box) return null;
          const isHero = p.slug === HERO_SLUG && filter === 'all';
          const isSecond = filter === 'all' && idx === 1;
          const imgW = box.w - 2 * opts.pad;
          return (
            <figure
              key={p.slug}
              className={`tile${shown ? '' : ' is-hidden'}${isHero ? ' tile--hero' : ''}${isSecond ? ' tile--second' : ''}`}
              style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h }}
              aria-hidden={!shown}
              data-tile={p.slug}
            >
              <button
                type="button"
                className="print"
                style={{ padding: opts.pad }}
                ref={(el) => {
                  if (el) tileRefs.current.set(p.slug, el);
                  else tileRefs.current.delete(p.slug);
                }}
                tabIndex={shown ? 0 : -1}
                onClick={() => shown && openPhoto(idx)}
                aria-label={`Powiększ zdjęcie: ${p.title}`}
              >
                <img
                  src={`/photos/${p.slug}-${p.widths[1] ?? p.widths[0]}.webp`}
                  srcSet={srcSet(p.slug, p.widths)}
                  sizes={`${Math.max(1, Math.round(imgW))}px`}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  loading={isHero ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ backgroundColor: p.color }}
                  draggable={false}
                />
              </button>
              <figcaption className="caption">
                <span className="caption__title">{p.title}</span>
                <span className="caption__cat">{categoryLabel(p.category)}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {open !== null && visible[open] && (
        <Lightbox photos={visible} index={open} onNavigate={navigate} onClose={closePhoto} getTile={getTile} />
      )}
    </section>
  );
}
