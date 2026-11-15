import { useCallback, useEffect, useRef, useState } from 'react';
import IrisShutter, { type IrisShutterHandle } from './IrisShutter';
import { isSoundOn, onSoundChange, playShutter, setSound } from '../lib/sound';
import { useMediaQuery, MOBILE } from '../lib/hooks';

/**
 * „Złap kadr”: wycinek szerokiego zdjęcia przesuwa się za nieruchomym wizjerem,
 * jak przy prowadzeniu aparatu. Postać nie jest wycinana z tła.
 */
const PANO = { src1x: '/photos/gra-rowerzysta-1800.webp', src2x: '/photos/gra-rowerzysta-3600.webp', w: 3600, h: 2400 };
/** Środek bohatera (głowa i tułów rowerzystki) na panoramie, 0–1. */
const RIDER = { x: 0.615, y: 0.42 };
/** Środek ramki w wizjerze (część szerokości). */
const FRAME_X = 0.64;

type Phase = 'idle' | 'running' | 'result';

interface Shot {
  url: string;
  d: number; // odchylenie od środka ramki (część szerokości kadru), < 0 = za wcześnie
  missed: boolean;
}

function verdict(shot: Shot) {
  if (shot.missed) return { title: 'Rowerzystka już przejechała', note: 'Migawka nie zadziałała na czas. Spróbuj nacisnąć wcześniej.' };
  const a = Math.abs(shot.d);
  const early = shot.d < 0;
  const pct = Math.round(a * 100);
  const side = early ? 'przed środkiem ramki' : 'za środkiem ramki';
  const note = pct === 0 ? 'Bohaterka dokładnie w środku ramki.' : `Bohaterka ${pct}% szerokości kadru ${side}.`;
  if (a <= 0.06) return { title: 'Idealnie w kadrze', note };
  if (a <= 0.16) return { title: early ? 'Odrobinę za wcześnie' : 'Odrobinę za późno', note };
  if (a <= 0.34) return { title: early ? 'Za wcześnie' : 'Za późno', note };
  return { title: early ? 'Zdecydowanie za wcześnie' : 'Zdecydowanie za późno', note };
}

export default function Game() {
  const mobile = useMediaQuery(MOBILE);
  const sectionRef = useRef<HTMLElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shutterBtn = useRef<HTMLButtonElement>(null);
  const startBtn = useRef<HTMLButtonElement>(null);
  const retryBtn = useRef<HTMLButtonElement>(null);
  const irisRef = useRef<IrisShutterHandle>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [loaded, setLoaded] = useState(false);
  const [near, setNear] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [sound, setSoundState] = useState(isSoundOn());
  const run = useRef<{ start: number; dur: number; seed: number; raf: number } | null>(null);
  const cam = useRef({ L: 0, T: 0 });

  // kadr: jaka część szerokości panoramy mieści się w wizjerze
  const crop = mobile ? 0.62 : 0.6;
  const vfAspect = mobile ? 3 / 2 : 2;
  const cropH = (crop * (PANO.w / PANO.h)) / vfAspect; // część wysokości panoramy
  const startL = 1 - crop;
  const endL = 0;

  useEffect(() => onSoundChange(setSoundState), []);

  // ładuj panoramę dopiero w pobliżu sekcji
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: '700px 0px' },
    );
    io.observe(el);
    // przewijanie odsłania wizjer
    const reveal = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-revealed');
          reveal.disconnect();
        }
      },
      { rootMargin: '0px 0px -28% 0px' },
    );
    if (vfRef.current) reveal.observe(vfRef.current);
    return () => {
      io.disconnect();
      reveal.disconnect();
    };
  }, []);

  const place = useCallback(
    (L: number, T: number) => {
      cam.current = { L, T };
      const vf = vfRef.current;
      const img = imgRef.current;
      if (!vf || !img) return;
      const w = vf.clientWidth / crop;
      const h = w * (PANO.h / PANO.w);
      img.style.width = `${w}px`;
      img.style.height = `${h}px`;
      img.style.transform = `translate3d(${(-L * w).toFixed(2)}px, ${(-T * h).toFixed(2)}px, 0)`;
    },
    [crop],
  );

  const restT = Math.min(Math.max(0.12, 0), 1 - cropH);

  useEffect(() => {
    const reset = () => {
      if (phase !== 'running') place(startL, restT);
    };
    reset();
    const ro = new ResizeObserver(reset);
    if (vfRef.current) ro.observe(vfRef.current);
    return () => ro.disconnect();
  }, [phase, place, startL, restT, loaded]);

  const finish = useCallback(
    (missed: boolean) => {
      const r = run.current;
      if (r) cancelAnimationFrame(r.raf);
      run.current = null;
      const { L, T } = cam.current;
      const img = imgRef.current;
      let url = '';
      if (img && img.naturalWidth) {
        // zatrzymaj dokładnie widoczny obraz
        const c = document.createElement('canvas');
        const outW = 1200;
        c.width = outW;
        c.height = Math.round(outW / vfAspect);
        const ctx = c.getContext('2d');
        if (ctx) {
          const nw = img.naturalWidth;
          const nh = img.naturalHeight;
          ctx.drawImage(img, L * nw, T * nh, crop * nw, cropH * nh, 0, 0, c.width, c.height);
          url = c.toDataURL('image/jpeg', 0.86);
        }
      }
      const pos = (RIDER.x - L) / crop; // pozycja bohaterki w kadrze 0–1
      setShot({ url, d: pos - FRAME_X, missed });
      setPhase('result');
      requestAnimationFrame(() => retryBtn.current?.focus({ preventScroll: true }));
    },
    [crop, cropH, vfAspect],
  );

  const tick = useCallback(
    (now: number) => {
      const r = run.current;
      if (!r) return;
      const t = (now - r.start) / r.dur;
      if (t >= 1) {
        place(endL, restT);
        finish(true);
        return;
      }
      // prowadzenie aparatu: płynny start, stałe tempo, lekkie drganie dłoni
      const a = 0.15;
      const f = (t < a ? (t * t) / (2 * a) : t - a / 2) / (1 - a / 2);
      const L = startL + (endL - startL) * f;
      const bob = Math.sin(now / 160 + r.seed) * 0.0035 + Math.sin(now / 410 + r.seed * 2) * 0.004;
      place(L, Math.min(Math.max(restT + bob, 0), 1 - cropH));
      r.raf = requestAnimationFrame(tick);
    },
    [finish, place, restT, cropH, startL],
  );

  const start = () => {
    if (!loaded) return;
    setShot(null);
    setPhase('running');
    const dur = 2300 + Math.random() * 700;
    run.current = { start: performance.now(), dur, seed: Math.random() * 10, raf: 0 };
    run.current.raf = requestAnimationFrame(tick);
    requestAnimationFrame(() => shutterBtn.current?.focus({ preventScroll: true }));
  };

  const press = useCallback(() => {
    if (!run.current) return;
    playShutter();
    shutterBtn.current?.classList.remove('is-pressed');
    void shutterBtn.current?.offsetWidth;
    shutterBtn.current?.classList.add('is-pressed');
    finish(false);
    irisRef.current?.fire(240);
  }, [finish]);

  // spacja działa jako spust tylko w trakcie próby
  useEffect(() => {
    if (phase !== 'running') return;
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') e.preventDefault();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [phase, press]);

  useEffect(() => () => {
    if (run.current) cancelAnimationFrame(run.current.raf);
  }, []);

  const v = shot ? verdict(shot) : null;
  const good = shot && !shot.missed && Math.abs(shot.d) <= 0.06;

  return (
    <section className="game" id="zlap-kadr" ref={sectionRef} aria-labelledby="game-title">
      <div className="game__head">
        <p className="kicker">Przerywnik</p>
        <h2 id="game-title" className="display game__title">
          Złap kadr
        </h2>
        <p className="game__lead">Naciśnij migawkę, gdy rowerzystka znajdzie się w ramce.</p>
      </div>

      <div className="game__body">
        <div className={`viewfinder viewfinder--${phase}`} ref={vfRef} style={{ aspectRatio: String(vfAspect) }}>
          {near && (
            <img
              ref={imgRef}
              className="viewfinder__img"
              src={mobile ? PANO.src1x : PANO.src2x}
              alt="Rowerzystka jadąca drogą wśród wzgórz — widok przez wizjer"
              decoding="async"
              onLoad={() => setLoaded(true)}
              draggable={false}
            />
          )}
          <div className="viewfinder__frame" aria-hidden="true">
            <span className="vf-corner vf-corner--a" />
            <span className="vf-corner vf-corner--b" />
            <span className="vf-center" />
          </div>
          <IrisShutter ref={irisRef} className="viewfinder__iris" />
          {phase === 'idle' && (
            <div className="viewfinder__overlay">
              <button ref={startBtn} type="button" className="btn btn--light" onClick={start} disabled={!loaded}>
                {loaded ? 'Rozpocznij próbę' : 'Ładowanie kadru…'}
              </button>
            </div>
          )}
          {phase === 'result' && shot && (
            <div className="result" role="status">
              {shot.url && (
                <figure className={`result__print${good ? ' is-good' : ''}`}>
                  <img src={shot.url} alt="Twoja odbitka: zatrzymany kadr z wizjera" />
                </figure>
              )}
            </div>
          )}
        </div>

        <div className="game__controls">
          <div className="game__verdict" aria-live="polite">
            {phase === 'running' && <p className="game__hint">Teraz… patrz na ramkę.</p>}
            {phase === 'idle' && <p className="game__hint">Spust na ekranie albo spacja. Gra jest dobrowolna — możesz po prostu przewinąć dalej.</p>}
            {v && phase === 'result' && (
              <>
                <p className="game__result">{v.title}</p>
                <p className="game__note">{v.note}</p>
              </>
            )}
          </div>
          <div className="game__buttons">
            {phase === 'result' && (
              <button ref={retryBtn} type="button" className="btn" onClick={start}>
                Spróbuj ponownie
              </button>
            )}
            <button
              ref={shutterBtn}
              type="button"
              className="shutter-btn"
              aria-label="Spust migawki"
              disabled={phase !== 'running'}
              onPointerDown={(e) => {
                if (e.button === 0) {
                  e.preventDefault();
                  press();
                }
              }}
              onClick={(e) => {
                if (e.detail === 0) press();
              }}
              onAnimationEnd={(e) => e.currentTarget.classList.remove('is-pressed')}
            >
              <span className="shutter-btn__cap" />
            </button>
          </div>
          <button type="button" className="sound-toggle" aria-pressed={sound} onClick={() => setSound(!sound)}>
            Dźwięk migawki: {sound ? 'włączony' : 'wyłączony'}
          </button>
        </div>
      </div>
    </section>
  );
}
