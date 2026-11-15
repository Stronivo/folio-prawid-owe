import { forwardRef, useId, useImperativeHandle, useRef } from 'react';
import { blinkClosure, irisShape, lerp } from '../lib/iris';

/** Ciemne domknięcie migawki ograniczone do powierzchni zdjęcia (przysłona jak w logo). */
export interface IrisShutterHandle {
  fire: (ms?: number, onClosed?: () => void) => Promise<void>;
}

const R = 145;

const IrisShutter = forwardRef<IrisShutterHandle, { className?: string }>(function IrisShutter({ className }, ref) {
  const id = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const hexRef = useRef<SVGPolygonElement>(null);
  const seamsRef = useRef<SVGGElement>(null);
  const busy = useRef(false);

  const draw = (c: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.style.visibility = c <= 0.001 ? 'hidden' : 'visible';
    if (c <= 0.001) return;
    const s = irisShape(0, 0, R, lerp(R * 1.02, 0, c), 32 * c);
    hexRef.current?.setAttribute('points', s.hex);
    const lines = seamsRef.current?.children;
    if (lines)
      s.seams.forEach((l, i) => {
        lines[i].setAttribute('x1', l[0].toFixed(2));
        lines[i].setAttribute('y1', l[1].toFixed(2));
        lines[i].setAttribute('x2', l[2].toFixed(2));
        lines[i].setAttribute('y2', l[3].toFixed(2));
      });
  };

  useImperativeHandle(ref, () => ({
    fire: (ms = 300, onClosed) =>
      new Promise<void>((resolve) => {
        if (busy.current) return resolve();
        busy.current = true;
        let closedSent = false;
        const start = performance.now();
        const tick = (now: number) => {
          const t = (now - start) / ms;
          const c = blinkClosure(t);
          draw(c);
          if (!closedSent && t >= 0.42) {
            closedSent = true;
            onClosed?.();
          }
          if (t < 1) requestAnimationFrame(tick);
          else {
            draw(0);
            busy.current = false;
            resolve();
          }
        };
        requestAnimationFrame(tick);
      }),
  }));

  const initial = irisShape(0, 0, R, R * 1.02, 0);
  return (
    <svg
      ref={svgRef}
      className={`iris-shutter ${className ?? ''}`}
      viewBox="-100 -100 200 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ visibility: 'hidden' }}
    >
      <defs>
        <mask id={`iris-${id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="400" height="400">
          <rect x="-200" y="-200" width="400" height="400" fill="#fff" />
          <polygon ref={hexRef} points={initial.hex} fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#iris-${id})`}>
        <rect x="-200" y="-200" width="400" height="400" fill="#141210" />
        <g ref={seamsRef} stroke="rgba(255,244,225,.14)" strokeWidth="0.7">
          {initial.seams.map((l, i) => (
            <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
          ))}
        </g>
      </g>
    </svg>
  );
});

export default IrisShutter;
