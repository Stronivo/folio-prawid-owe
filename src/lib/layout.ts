import type { Photo } from '../data';

/** Pozycja kafla w nieregularnej siatce: kolumny (CSS grid), wiersz, proporcje, przesunięcie w pionie. */
export interface Slot {
  col: string;
  row: number;
  ar: string;
  mt: string;
  big?: boolean;
}

const isWide = (p: Photo) => p.ratio > 1.1;

/** Desktop: siatka 12 kolumn, pary w wierszach z przesunięciem; co trzeci wiersz — kadr panoramiczny. */
export function desktopLayout(items: Photo[]): Slot[] {
  const out: Slot[] = [];
  let i = 0;
  let row = 0;
  const mirror = (a: number, b: number, m: boolean) => (m ? `${14 - b} / ${14 - a}` : `${a} / ${b}`);
  while (i < items.length) {
    const a = items[i];
    const b = items[i + 1];
    const m = row % 2 === 1;
    if ((isWide(a) && row % 3 === 2) || !b) {
      out.push(
        b || isWide(a)
          ? { col: '1 / 13', row: row + 1, ar: '2.1 / 1', mt: '0', big: true }
          : { col: '4 / 10', row: row + 1, ar: '4 / 5', mt: '0' },
      );
      i += 1;
    } else {
      if (isWide(a) && isWide(b)) {
        out.push({ col: mirror(1, 9, m), row: row + 1, ar: '3 / 2', mt: '0' });
        out.push({ col: mirror(9, 13, m), row: row + 1, ar: '4 / 5', mt: '22vh' });
      } else if (isWide(a)) {
        out.push({ col: mirror(1, 9, m), row: row + 1, ar: '3 / 2', mt: '0' });
        out.push({ col: mirror(9, 13, m), row: row + 1, ar: '4 / 5', mt: '18vh' });
      } else if (isWide(b)) {
        out.push({ col: mirror(1, 6, m), row: row + 1, ar: '4 / 5', mt: '0' });
        out.push({ col: mirror(6, 13, m), row: row + 1, ar: '3 / 2', mt: '24vh' });
      } else {
        out.push({ col: mirror(1, 7, m), row: row + 1, ar: '4 / 5', mt: '0' });
        out.push({ col: mirror(8, 13, m), row: row + 1, ar: '3 / 4', mt: '26vh' });
      }
      i += 2;
    }
    row += 1;
  }
  return out;
}

/** Telefon: siatka 6 kolumn — panoramy na całą szerokość, pionowe zdjęcia parami z przesunięciem albo naprzemiennie. */
export function mobileLayout(items: Photo[]): Slot[] {
  const out: Slot[] = [];
  let row = 0;
  let side = 0;
  let i = 0;
  while (i < items.length) {
    const a = items[i];
    const b = items[i + 1];
    if (isWide(a)) {
      out.push({ col: '1 / 7', row: ++row, ar: '4 / 3', mt: '0', big: true });
      i += 1;
    } else if (b && !isWide(b) && row % 2 === 0) {
      row += 1;
      out.push({ col: '1 / 4', row, ar: '3 / 4', mt: '0' });
      out.push({ col: '4 / 7', row, ar: '3 / 4', mt: '14vw' });
      i += 2;
    } else {
      out.push({ col: side % 2 === 0 ? '1 / 6' : '2 / 7', row: ++row, ar: '4 / 5', mt: '0' });
      side += 1;
      i += 1;
    }
  }
  return out;
}
