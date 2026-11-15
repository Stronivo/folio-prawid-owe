/**
 * Geometria przysłony sześciolistkowej odwzorowana z pierwszego „O” w logo.
 * Otwór to sześciokąt o apotemie `rho`; każdy bok przedłużony do okręgu R
 * tworzy szczelinę między listkami (układ „wiatraczka” jak w znaku FOLIO).
 */
export interface IrisShape {
  hex: string;
  seams: [number, number, number, number][];
}

const DEG = Math.PI / 180;
/** Kierunek normalnej pierwszego boku otworu zmierzony w logo (stopnie, oś y w dół). */
export const IRIS_BASE_ANGLE = 37.5;

export function irisShape(cx: number, cy: number, R: number, rho: number, rotation = 0, seamOffset = 0): IrisShape {
  const pts: string[] = [];
  const seams: [number, number, number, number][] = [];
  const vr = rho / Math.cos(30 * DEG);
  const t0 = Math.max(rho * Math.tan(30 * DEG) - 4, 0);
  const tEnd = Math.sqrt(Math.max(R * R - rho * rho, 0)) + R * 0.1;
  for (let k = 0; k < 6; k++) {
    const a = (IRIS_BASE_ANGLE + rotation + 60 * k) * DEG;
    const va = a + 30 * DEG;
    pts.push(`${(cx + vr * Math.cos(va)).toFixed(2)},${(cy + vr * Math.sin(va)).toFixed(2)}`);
    // szczelina = przedłużenie boku k poza wierzchołek, w stronę malejącego kąta
    // (dopasowane pikselowo do znaku FOLIO)
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const fx = cx + (rho + seamOffset) * nx;
    const fy = cy + (rho + seamOffset) * ny;
    seams.push([fx + dx * t0, fy + dy * t0, fx + dx * tEnd, fy + dy * tEnd]);
  }
  return { hex: pts.join(' '), seams };
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Jedno „mrugnięcie” przysłony: 0 → otwarta, 0.45 → domknięta, 1 → otwarta.
 * Zwraca stopień domknięcia 0..1 (szybkie zamknięcie, krótki postój, otwarcie).
 */
export function blinkClosure(t: number): number {
  if (t <= 0 || t >= 1) return 0;
  if (t < 0.4) return easeIn(t / 0.4) * 0.6 + (t / 0.4) * 0.4;
  if (t < 0.52) return 1;
  return 1 - easeOut((t - 0.52) / 0.48);
}
