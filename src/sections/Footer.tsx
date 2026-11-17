import { SITE } from '../data';
import { scrollToTarget } from '../lib/motion';
import Logo from '../components/Logo';

export default function Footer() {
  return (
    <footer className="footer" data-nav="dark">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__claim serif" lang="en">Moments worth keeping.</p>
          <button className="footer__up mono" onClick={() => scrollToTarget(0)}>
            Na górę <span aria-hidden="true">↑</span>
          </button>
        </div>
        <div className="footer__logo" data-reveal="footlogo">
          <Logo />
        </div>
        <div className="footer__bottom mono">
          <span>© {new Date().getFullYear()} {SITE.brand} — {SITE.photographer}</span>
          <span>{SITE.location}</span>
          <a className="ulink" href={SITE.instagram.url} target="_blank" rel="noreferrer">Instagram</a>
          <span className="footer__note">Zdjęcia demonstracyjne: Unsplash</span>
        </div>
      </div>
    </footer>
  );
}
