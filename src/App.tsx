import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Logo, { type LogoHandle } from './components/Logo';
import HeroScene from './components/HeroScene';
import Gallery from './components/Gallery';
import Game from './components/Game';
import About from './components/About';
import Contact from './components/Contact';
import { SITE } from './config';
import { prefersReducedMotion, useMediaQuery, REDUCED_MOTION } from './lib/hooks';

const INTRO_KEY = 'folio-intro-seen';

function shouldPlayIntro() {
  try {
    if (prefersReducedMotion()) return false;
    if (sessionStorage.getItem(INTRO_KEY)) return false;
    if (location.hash) return false;
    if (window.scrollY > 10) return false;
    return true;
  } catch {
    return false;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const reduced = useMediaQuery(REDUCED_MOTION);
  const [intro] = useState(shouldPlayIntro);
  const [introDone, setIntroDone] = useState(!intro);
  const logoRef = useRef<LogoHandle>(null);
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  // link z kotwicą (#kontakt, #o-mnie…) otwarty z zewnątrz: przewiń po złożeniu układu
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id || id.startsWith('zdjecie-')) return;
    const t = setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(id));
      el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    if (!intro) return;
    const html = document.documentElement;
    const link = logoLinkRef.current;
    const plate = plateRef.current;
    if (!link || !plate) return;
    html.classList.add('is-intro');
    const anims: Animation[] = [];
    let cancelled = false;
    link.style.transform = '';

    // logo zaczyna w środku ekranu — to ten sam element, który ląduje w nagłówku
    const r = link.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const bigW = vw < 760 ? vw * 0.8 : Math.min(vw * 0.62, 880);
    const s = bigW / r.width;
    const tx = (vw - bigW) / 2 - r.left;
    const ty = (vh - r.height * s) / 2 - r.top;
    const from = `translate(${tx}px, ${ty}px) scale(${s})`;
    link.style.transformOrigin = '0 0';
    link.style.transform = from;

    const end = () => {
      if (cancelled) return;
      cancelled = true;
      link.style.transform = '';
      anims.forEach((a) => a.cancel());
      link.style.transformOrigin = '';
      html.classList.remove('is-intro');
      try {
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        /* */
      }
      setIntroDone(true);
    };

    const skip = () => end();
    const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    const t0 = setTimeout(() => skipEvents.forEach((ev) => window.addEventListener(ev, skip, { once: true, passive: true })), 250);

    (async () => {
      await wait(180);
      if (cancelled) return;
      logoRef.current?.blink(420);
      await wait(560);
      if (cancelled) return;
      const flight = link.animate([{ transform: from }, { transform: 'translate(0px, 0px) scale(1)' }], {
        duration: 860,
        easing: 'cubic-bezier(.62,0,.18,1)',
        fill: 'forwards',
      });
      anims.push(flight);
      anims.push(
        plate.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], {
          duration: 820,
          delay: 40,
          easing: 'cubic-bezier(.6,0,.22,1)',
          fill: 'forwards',
        }),
      );
      document.querySelectorAll<HTMLElement>('.site-nav a').forEach((a, i) =>
        anims.push(a.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], {
          duration: 360,
          delay: 560 + i * 60,
          easing: 'ease-out',
          fill: 'backwards',
        })),
      );
      flight.onfinish = end;
    })();

    return () => {
      clearTimeout(t0);
      skipEvents.forEach((ev) => window.removeEventListener(ev, skip));
      if (!cancelled) {
        // (tryb deweloperski React: efekt uruchamiany dwukrotnie)
        cancelled = true;
        anims.forEach((a) => a.cancel());
        link.style.transform = '';
        html.classList.remove('is-intro');
      }
    };
  }, [intro]);

  return (
    <>
      <a className="skip-link" href="#portfolio">
        Przejdź do zdjęć
      </a>
      <header className="site-header">
        <a href="#top" className="site-header__logo" ref={logoLinkRef} aria-label={`FOLIO — ${SITE.photographer}, początek strony`}>
          <Logo ref={logoRef} />
        </a>
        <nav className="site-nav" aria-label="Główna nawigacja">
          <a href="#portfolio">Portfolio</a>
          <a href="#o-mnie">O mnie</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </header>

      <main>
        <HeroScene scene={!reduced} />
        <Gallery scene={!reduced} />
        <Game />
        <About />
        <Contact />
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} {SITE.photographer}</p>
        {SITE.showSampleLabel && (
          <p className="site-footer__credits">
            Zdjęcia przykładowe: autorzy z Unsplash (licencja Unsplash) — nazwiska w podglądzie każdego zdjęcia.
          </p>
        )}
        <a href="#top">Do góry ↑</a>
      </footer>

      {!introDone && <div className="intro-plate" ref={plateRef} aria-hidden="true" />}
    </>
  );
}
