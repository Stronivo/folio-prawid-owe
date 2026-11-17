import { useEffect } from 'react';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Contact from './sections/Contact';
import Featured from './sections/Featured';
import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Manifest from './sections/Manifest';
import Portfolio from './sections/Portfolio';
import Process from './sections/Process';
import { initReveal, initScroll } from './lib/motion';

export default function App() {
  useEffect(() => {
    initScroll();
    initReveal();
    // start animacji wejścia, gdy zdjęcie główne jest gotowe (najpóźniej po 1,4 s)
    const root = document.documentElement;
    const go = () => root.classList.add('is-ready');
    const img = document.querySelector<HTMLImageElement>('.hero__pic img');
    const t = window.setTimeout(go, 1400);
    if (img?.complete) go();
    else img?.addEventListener('load', go, { once: true });
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <a href="#prace" className="skip">Przejdź do portfolio</a>
      <Nav />
      <main>
        <Hero />
        <Manifest />
        <Portfolio />
        <Featured />
        <Process />
        <Contact />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
