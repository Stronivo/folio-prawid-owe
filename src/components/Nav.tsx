import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SITE } from '../data';
import { lockScroll, onScroll, scrollToTarget } from '../lib/motion';
import Logo from './Logo';

const LINKS = [
  { href: '#prace', label: 'Prace' },
  { href: '#manifest', label: 'Manifest' },
  { href: '#projekt', label: 'Projekt' },
  { href: '#proces', label: 'Proces' },
  { href: '#kontakt', label: 'Kontakt' },
];

export function go(e: React.MouseEvent, href: string) {
  e.preventDefault();
  scrollToTarget(href, href === '#prace' ? -20 : 0);
}

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastY = 0;
    let hidden = false;
    let light = false;
    let scrolled = false;
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'));
    let list = sections();
    const refresh = () => (list = sections());
    window.addEventListener('resize', refresh);
    const off = onScroll((y) => {
      const nav = ref.current;
      if (!nav) return;
      if (list.length === 0) list = sections();
      const dy = y - lastY;
      const nextHidden = y > 160 && dy > 2 ? true : dy < -2 || y < 160 ? false : hidden;
      lastY = y;
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        nav.classList.toggle('is-hidden', hidden);
      }
      let tone = 'dark';
      for (const s of list) {
        const r = s.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) {
          tone = s.dataset.nav ?? 'dark';
          break;
        }
      }
      const nextLight = tone === 'light';
      if (nextLight !== light) {
        light = nextLight;
        nav.classList.toggle('is-on-light', light);
      }
      const nextScrolled = y > 40;
      if (nextScrolled !== scrolled) {
        scrolled = nextScrolled;
        nav.classList.toggle('is-scrolled', scrolled);
      }
    });
    return () => {
      off();
      window.removeEventListener('resize', refresh);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const nav = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    go(e, href);
  };

  return (
    <>
      <header ref={ref} className={`nav ${open ? 'is-open' : ''}`}>
        <a href="#top" className="nav__logo" onClick={(e) => nav(e, '#top')} aria-label="FOLIO — na górę strony">
          <Logo />
        </a>
        <p className="nav__who mono">
          {SITE.photographer} <span>—</span> {SITE.role}
        </p>
        <nav className="nav__links" aria-label="Główna nawigacja">
          {LINKS.slice(0, 4).map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => nav(e, l.href)} className="ulink">
              {l.label}
            </a>
          ))}
          <a href="#kontakt" className="nav__cta" onClick={(e) => nav(e, '#kontakt')}>
            <span className="dot" aria-hidden="true" /> Kontakt
          </a>
        </nav>
        <button
          className="nav__burger"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="mono">{open ? 'Zamknij' : 'Menu'}</span>
          <span className="nav__burger-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav className="menu__links" aria-label="Menu">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => nav(e, l.href)}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="mono">0{i + 1}</span>
              <span className="menu__label">{l.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu__foot mono">
          <a href={`mailto:${SITE.email}`} tabIndex={open ? 0 : -1}>
            {SITE.email}
          </a>
          <span>{SITE.location}</span>
        </div>
      </div>
    </>
  );
}
