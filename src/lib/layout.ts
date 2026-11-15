import type { Photo } from '../data/photos';

export interface TileBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutOptions {
  gap: number;
  rowGap: number;
  pad: number;
  pattern: number[];
  maxImgH: number;
}

export function layoutOptions(width: number, vh: number): LayoutOptions {
  if (width < 600) return { gap: 10, rowGap: 46, pad: 5, pattern: [1, 2], maxImgH: vh * 0.72 };
  if (width < 1000) return { gap: 18, rowGap: 52, pad: 8, pattern: [2, 2, 1], maxImgH: vh * 0.7 };
  return { gap: 24, rowGap: 58, pad: 10, pattern: [2, 2, 1], maxImgH: Math.min(vh * 0.74, 760) };
}

/**
 * Rytm magazynu: rzędy po 2, 3 i 1 zdjęciu, dopasowane do proporcji.
 * Rzędy wielozdjęciowe są wyjustowane do pełnej szerokości; pojedyncze
 * duże kadry stoją na przemian po prawej i lewej, zostawiając oddech.
 */
export function computeLayout(photos: Photo[], W: number, o: LayoutOptions) {
  const boxes: TileBox[] = [];
  let y = 0;
  let i = 0;
  let r = 0;
  let singles = 0;
  while (i < photos.length) {
    const n = Math.min(o.pattern[r % o.pattern.length], photos.length - i);
    const row = photos.slice(i, i + n);
    const aspects = row.map((p) => p.width / p.height);
    if (n === 1) {
      const a = aspects[0];
      const narrow = W < 600;
      let imgW = narrow ? W - 2 * o.pad : a >= 1 ? W * 0.66 : W * 0.42;
      let imgH = imgW / a;
      const cap = narrow ? o.maxImgH : o.maxImgH * 1.05;
      if (imgH > cap) {
        imgH = cap;
        imgW = imgH * a;
      }
      const w = imgW + 2 * o.pad;
      const h = imgH + 2 * o.pad;
      const x = narrow ? 0 : singles % 2 === 0 ? W - w : 0;
      singles++;
      boxes.push({ x, y, w, h });
      y += h + o.rowGap;
    } else {
      const sum = aspects.reduce((s, a) => s + a, 0);
      let imgH = (W - (n - 1) * o.gap - n * 2 * o.pad) / sum;
      let offset = 0;
      if (imgH > o.maxImgH) {
        imgH = o.maxImgH;
        const used = imgH * sum + (n - 1) * o.gap + n * 2 * o.pad;
        offset = r % 2 === 0 ? 0 : W - used;
      }
      let x = offset;
      aspects.forEach((a) => {
        const w = imgH * a + 2 * o.pad;
        boxes.push({ x, y, w, h: imgH + 2 * o.pad });
        x += w + o.gap;
      });
      y += imgH + 2 * o.pad + o.rowGap;
    }
    i += n;
    r++;
  }
  return { boxes, height: Math.max(0, y - o.rowGap + 40) };
}
