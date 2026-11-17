import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { CATEGORIES, PHOTOS, categoryLabel, type CategoryId, type Photo } from '../data';
import { desktopLayout, mobileLayout } from '../lib/layout';
import { invalidateScroll, reducedMotion, scrollToTarget } from '../lib/motion';
import Pic from '../components/Pic';
import Lightbox from '../components/Lightbox';

type Filter = 'all' | CategoryId;

export default function Portfolio() {
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState<Filter>('all');
  const [phase, setPhase] = useState<'idle' | 'out'>('idle');
  const [open, setOpen] = useState<{ index: number; rect: DOMRect | null } | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<{ x: number; w: number }>({ x: 0, w: 0 });

  const items = useMemo(
    () => (shown === 'all' ? PHOTOS : PHOTOS.filter((p) => p.category === shown)),
    [shown],
  );
  const desk = useMemo(() => desktopLayout(items), [items]);
  const mob = useMemo(() => mobileLayout(items), [items]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PHOTOS.length };
    PHOTOS.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  // podkreślenie aktywnej zakładki
  useEffect(() => {
    const place = () => {
      const el = tabs.current?.querySelector<HTMLElement>(`[data-f="${filter}"]`);
      if (el) setInk({ x: el.offsetLeft, w: el.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [filter]);

  const choose = (f: Filter, el: HTMLElement) => {
    if (f === filter) return;
    setFilter(f);
    el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (reducedMotion) {
      setShown(f);
      return;
    }
    setPhase('out');
    window.setTimeout(() => {
      setShown(f);
      setPhase('idle');
      invalidateScroll();
      const grid = document.getElementById('prace-grid');
      if (grid && grid.getBoundingClientRect().top < 0) scrollToTarget(grid, -140);
    }, 420);
  };

  return (
    <section id="prace" className="work" data-nav="dark">
      <div className="wrap">
        <div className="sec-head" data-reveal="fade">
          <span className="mono">(02)</span>
          <span className="mono">Portfolio</span>
          <span className="sec-head__rule" />
          <span className="mono">{PHOTOS.length} kadrów · 5 kategorii</span>
        </div>

        <div className="work__head">
          <h2 className="work__title display" data-reveal="lines">
            <span className="line"><span>Wybrane</span></span>
            <span className="line"><span><em className="serif">prace</em><sup className="mono">({String(counts[filter]).padStart(2, '0')})</sup></span></span>
          </h2>
          <p className="work__intro" data-reveal="up">
            Portrety, wydarzenia, codzienność, sesje autorskie i produkt. Różne historie — jedno spojrzenie na światło.
          </p>
        </div>

        <div className="tabs" ref={tabs} role="tablist" aria-label="Kategorie zdjęć" data-reveal="fade">
          {[{ id: 'all' as Filter, label: 'Wszystkie' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={filter === c.id}
              data-f={c.id}
              className={`tab ${filter === c.id ? 'is-active' : ''}`}
              onClick={(e) => choose(c.id, e.currentTarget)}
            >
              {c.label}
              <sup className="mono">{counts[c.id]}</sup>
            </button>
          ))}
          <span className="tabs__ink" style={{ transform: `translateX(${ink.x}px)`, width: ink.w }} aria-hidden="true" />
        </div>
      </div>

      <div id="prace-grid" className={`grid wrap ${phase === 'out' ? 'is-out' : ''}`} key={shown}>
        {items.map((p, i) => (
          <Tile
            key={p.slug}
            photo={p}
            index={PHOTOS.indexOf(p)}
            style={{
              '--c-d': desk[i].col, '--r-d': desk[i].row, '--ar-d': desk[i].ar, '--mt-d': desk[i].mt,
              '--c-m': mob[i].col, '--r-m': mob[i].row, '--ar-m': mob[i].ar, '--mt-m': mob[i].mt,
              '--d': `${(i % 2) * 0.12}s`,
            } as CSSProperties}
            big={!!desk[i].big}
            onOpen={(rect) => setOpen({ index: i, rect })}
          />
        ))}
      </div>

      {open && (
        <Lightbox
          photos={items}
          start={open.index}
          from={open.rect}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function Tile({
  photo, index, style, big, onOpen,
}: { photo: Photo; index: number; style: CSSProperties; big: boolean; onOpen: (r: DOMRect | null) => void }) {
  return (
    <figure className={`tile ${big ? 'tile--big' : ''}`} style={style} data-reveal="tile">
      <button
        className="tile__btn"
        data-cursor="Zobacz"
        aria-label={`Otwórz zdjęcie: ${photo.title} — ${categoryLabel(photo.category)}`}
        onClick={(e) => onOpen(e.currentTarget.querySelector('img')?.getBoundingClientRect() ?? null)}
      >
        <Pic
          img={photo}
          aspect={null}
          className="tile__pic"
          parallax={big ? 0.06 : 0.035}
          sizes={big ? '100vw' : '(max-width: 760px) 90vw, 46vw'}
        />
        <span className="corners" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
      <figcaption className="tile__cap">
        <span className="mono tile__n">{String(index + 1).padStart(2, '0')}</span>
        <span className="tile__title">{photo.title}</span>
        <span className="mono tile__cat">{categoryLabel(photo.category)}</span>
      </figcaption>
    </figure>
  );
}
