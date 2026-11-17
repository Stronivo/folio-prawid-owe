import { useEffect, useRef } from 'react';
import { HERO, SITE } from '../data';
import { clamp, onScroll, reducedMotion } from '../lib/motion';
import Logo from '../components/Logo';
import Pic from '../components/Pic';
import { go } from '../components/Nav';

export default function Hero() {
  const media = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    return onScroll((y, vh) => {
      const p = clamp(y / vh, 0, 1.2);
      if (p > 1.15) return;
      if (media.current) media.current.style.transform = `translate3d(0, ${(p * vh * 0.32).toFixed(1)}px, 0)`;
      if (content.current) {
        content.current.style.transform = `translate3d(0, ${(p * vh * 0.12).toFixed(1)}px, 0)`;
        content.current.style.opacity = String(clamp(1 - p * 1.25));
      }
    });
  }, []);

  return (
    <section id="top" className="hero" data-nav="dark" aria-label="FOLIO — Leon Klimek, fotografia">
      <div className="hero__media" ref={media}>
        <div className="hero__reveal">
          <Pic img={HERO} sizes="100vw" eager aspect={null} className="hero__pic" />
        </div>
        <div className="hero__shade" />
      </div>
      <div className="hero__flash" aria-hidden="true" />

      <div className="hero__finder" aria-hidden="true">
        <i /><i /><i /><i />
        <span className="hero__finder-meta mono">
          <b className="rec" /> {SITE.photographer} — Portfolio
        </span>
        <span className="hero__finder-meta hero__finder-meta--r mono">{SITE.location}</span>
      </div>

      <div className="hero__content wrap" ref={content}>
        <div className="hero__row">
          <p className="hero__claim serif" lang="en">
            <span className="line"><span>Moments</span></span>
            <span className="line"><span>worth keeping.</span></span>
          </p>
          <div className="hero__aside">
            <p className="hero__desc">Fotografia, która zatrzymuje więcej niż chwilę.</p>
            <a href="#prace" className="btn btn--light" onClick={(e) => go(e, '#prace')}>
              <span className="btn__label">Odkryj nasze prace</span>
              <span className="btn__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" /></svg>
              </span>
            </a>
          </div>
        </div>
        <h1 className="hero__brand">
          <Logo className="hero__logo" title="FOLIO" />
        </h1>
      </div>
    </section>
  );
}
