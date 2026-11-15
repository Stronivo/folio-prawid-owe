import { forwardRef, useImperativeHandle, useRef } from 'react';
import { blinkClosure, clamp01, irisShape, lerp } from '../lib/iris';

/**
 * Oryginalny znak FOLIO (PNG z przezroczystym tłem) + precyzyjnie dopasowana
 * przysłona SVG, która pojawia się wyłącznie na czas mrugnięcia.
 * Współrzędne w układzie przyciętego pliku logo (1410 × 418 px).
 */
const VB_W = 1410;
const VB_H = 418;
const O = { cx: 441, cy: 228.5 };
/** Środek otworu zmierzony w pliku (lekko przesunięty względem pierścienia). */
const HOLE = { cx: 444.4, cy: 229.1, rho: 63 };
const BLADE_R = 122;
const COVER_R = 133;
const SEAM = 12;
const STAR = { cx: 578, cy: 46 };

export interface LogoHandle {
  blink: (ms?: number) => Promise<void>;
  svg: SVGSVGElement | null;
}

const Logo = forwardRef<LogoHandle, { className?: string }>(function Logo({ className }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const coverRef = useRef<SVGCircleElement>(null);
  const irisRef = useRef<SVGGElement>(null);
  const hexRef = useRef<SVGPolygonElement>(null);
  const seamRefs = useRef<(SVGLineElement | null)[]>([]);
  const glintRef = useRef<SVGRectElement>(null);
  const flareRef = useRef<SVGGElement>(null);

  const draw = (closure: number) => {
    const c = clamp01(closure);
    const cx = lerp(HOLE.cx, O.cx, c);
    const cy = lerp(HOLE.cy, O.cy, c);
    const shape = irisShape(cx, cy, BLADE_R, lerp(HOLE.rho, 5, c), 27 * c, -4);
    hexRef.current?.setAttribute('points', shape.hex);
    shape.seams.forEach((s, i) => {
      const l = seamRefs.current[i];
      if (!l) return;
      l.setAttribute('x1', s[0].toFixed(2));
      l.setAttribute('y1', s[1].toFixed(2));
      l.setAttribute('x2', s[2].toFixed(2));
      l.setAttribute('y2', s[3].toFixed(2));
    });
  };

  useImperativeHandle(ref, () => ({
    svg: svgRef.current,
    blink: (ms = 460) =>
      new Promise<void>((resolve) => {
        const cover = coverRef.current;
        const iris = irisRef.current;
        if (!cover || !iris) return resolve();
        draw(0);
        cover.setAttribute('opacity', '1');
        iris.setAttribute('opacity', '1');
        const start = performance.now();
        const glintMs = ms * 0.9;
        const tick = (now: number) => {
          const t = (now - start) / ms;
          draw(blinkClosure(t));
          // refleks gwiazdki zaczyna się w chwili domknięcia
          const g = clamp01((now - start - ms * 0.42) / glintMs);
          if (glintRef.current) {
            glintRef.current.setAttribute('x', String(lerp(470, 660, g)));
            glintRef.current.setAttribute('opacity', g > 0 && g < 1 ? '1' : '0');
          }
          if (flareRef.current) {
            const f = Math.sin(Math.PI * clamp01((g - 0.25) / 0.6));
            flareRef.current.setAttribute('opacity', (f * 0.95).toFixed(3));
            flareRef.current.setAttribute(
              'transform',
              `translate(${STAR.cx} ${STAR.cy}) scale(${(0.4 + f * 0.8).toFixed(3)}) rotate(${(g * 40).toFixed(1)})`,
            );
          }
          if (t < 1 || g < 1) {
            requestAnimationFrame(tick);
          } else {
            // płynny powrót do oryginalnego detalu z pliku
            cover.setAttribute('opacity', '0');
            iris.setAttribute('opacity', '0');
            resolve();
          }
          if (t >= 1) {
            cover.setAttribute('opacity', '0');
            iris.setAttribute('opacity', '0');
          }
        };
        requestAnimationFrame(tick);
      }),
  }));

  const initial = irisShape(HOLE.cx, HOLE.cy, BLADE_R, HOLE.rho, 0, -4);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label="FOLIO"
      focusable="false"
    >
      <defs>
        <mask id="folio-o-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
          <rect width={VB_W} height={VB_H} fill="#fff" />
          <circle ref={coverRef} cx={O.cx} cy={O.cy} r={COVER_R} fill="#000" opacity="0" />
        </mask>
        <mask id="folio-iris-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H}>
          <circle cx={O.cx} cy={O.cy} r={BLADE_R} fill="#fff" />
          <polygon ref={hexRef} points={initial.hex} fill="#000" />
          {initial.seams.map((s, i) => (
            <line
              key={i}
              ref={(el) => {
                seamRefs.current[i] = el;
              }}
              x1={s[0]}
              y1={s[1]}
              x2={s[2]}
              y2={s[3]}
              stroke="#000"
              strokeWidth={SEAM}
            />
          ))}
        </mask>
        <mask id="folio-ink-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VB_W} height={VB_H} style={{ maskType: 'alpha' }}>
          <image href="/folio-logo.png" width={VB_W} height={VB_H} />
        </mask>
        <linearGradient id="folio-glint-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff7e3" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff7e3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff7e3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="folio-flare-grad">
          <stop offset="0" stopColor="#fffaf0" stopOpacity="1" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <image href="/folio-logo.png" width={VB_W} height={VB_H} mask="url(#folio-o-mask)" />

      <g ref={irisRef} opacity="0">
        <circle cx={O.cx} cy={O.cy} r={BLADE_R} fill="var(--ink)" mask="url(#folio-iris-mask)" />
      </g>

      {/* refleks światła przesuwający się po gwiazdce */}
      <g mask="url(#folio-ink-mask)">
        <g clipPath="url(#folio-star-clip)">
          <rect
            ref={glintRef}
            x="470"
            y="-20"
            width="46"
            height="140"
            fill="url(#folio-glint-grad)"
            opacity="0"
            transform={`rotate(24 ${STAR.cx} ${STAR.cy})`}
          />
        </g>
      </g>
      <clipPath id="folio-star-clip">
        <rect x="528" y="0" width="100" height="98" />
      </clipPath>
      <g ref={flareRef} opacity="0" transform={`translate(${STAR.cx} ${STAR.cy})`}>
        <circle r="9" fill="url(#folio-flare-grad)" />
        <path d="M0 -26 L2 -2 L26 0 L2 2 L0 26 L-2 2 L-26 0 L-2 -2 Z" fill="#fffaf0" opacity="0.85" />
      </g>
    </svg>
  );
});

export default Logo;
