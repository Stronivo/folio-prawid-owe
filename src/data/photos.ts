/**
 * Kolekcja zdjęć FOLIO — jedno miejsce do edycji.
 *
 * Jak dodać własne zdjęcie:
 * 1. Wrzuć pliki do public/photos jako `<slug>-<szerokość>.webp`, np. `spacer-960.webp`
 *    (zalecane szerokości: 480, 960, 1600, 2400 — mniejsze niż oryginał).
 * 2. Dodaj wpis poniżej: slug, szerokości, wymiary oryginału, kategoria, podpis i opis alternatywny.
 * 3. `focus` to punkt kadrowania (0–1 od lewej i od góry) — tam, gdzie jest twarz lub gest.
 *    `focusMobile` (opcjonalnie) — osobny punkt dla wąskich ekranów.
 * Kolejność na liście = kolejność w galerii. Pierwsze zdjęcie jest zdjęciem głównym strony.
 */

export type CategoryId = 'portrety' | 'znajomi' | 'sport' | 'miasto' | 'natura' | 'zwierzaki';

export const CATEGORIES: { id: CategoryId; label: string; description: string }[] = [
  { id: 'portrety', label: 'Portrety', description: 'Pojedyncze osoby, naturalne światło, sesje w plenerze.' },
  { id: 'znajomi', label: 'Znajomi i pary', description: 'Wspólny spacer, zdjęcia przyjaciół, swobodne ujęcia we dwoje.' },
  { id: 'sport', label: 'Sport', description: 'Piłka na boisku, deskorolka, rower i ruch.' },
  { id: 'miasto', label: 'Miasto', description: 'Ulice, architektura, wieczorne światło i codzienne sceny.' },
  { id: 'natura', label: 'Natura', description: 'Krajobrazy, rośliny, las i detale w plenerze.' },
  { id: 'zwierzaki', label: 'Zwierzaki', description: 'Psy, koty i portrety zwierząt.' },
];

export interface Photo {
  slug: string;
  /** Szerokości plików dostępnych w public/photos. */
  widths: number[];
  width: number;
  height: number;
  category: CategoryId;
  /** Krótki podpis odbitki. */
  title: string;
  /** Opis alternatywny dla czytników ekranu. */
  alt: string;
  focus: { x: number; y: number };
  focusMobile?: { x: number; y: number };
  /** Średni kolor zdjęcia — tło przed załadowaniem. */
  color: string;
  /** Autor zdjęcia przykładowego. Usuń przy własnych zdjęciach. */
  credit?: { author: string; url: string };
}

const W4 = [480, 960, 1600, 2400];

export const PHOTOS: Photo[] = [
  {
    slug: 'pole-o-zachodzie', widths: W4, width: 2600, height: 1733, category: 'portrety',
    title: 'Polne kwiaty o zachodzie',
    alt: 'Dziewczyna w okularach przeciwsłonecznych trzyma bukiet rumianków na łące, za nią nisko zachodzące słońce.',
    focus: { x: 0.53, y: 0.4 }, focusMobile: { x: 0.52, y: 0.38 }, color: '#c7bbac',
    credit: { author: 'Alexander Shustov', url: 'https://unsplash.com/photos/AHBiSKaENwc' },
  },
  {
    slug: 'spojrzenie', widths: W4, width: 2600, height: 3900, category: 'portrety',
    title: 'Spojrzenie z bliska',
    alt: 'Portret młodej kobiety z kręconymi włosami w miękkim bocznym świetle.',
    focus: { x: 0.5, y: 0.4 }, color: '#574e47',
    credit: { author: 'Roksolana Zasiadko', url: 'https://unsplash.com/photos/LyeduBb2Auk' },
  },
  {
    slug: 'przejscie', widths: W4, width: 2600, height: 2187, category: 'miasto',
    title: 'Przejście w południe',
    alt: 'Mężczyzna w garniturze przechodzi przez pustą jezdnię, widziany z góry.',
    focus: { x: 0.62, y: 0.5 }, color: '#91968e',
    credit: { author: 'Alejandro Escamilla', url: 'https://unsplash.com/photos/du_OrQAA4r0' },
  },
  {
    slug: 'lawka-nad-zatoka', widths: W4, width: 2600, height: 1722, category: 'znajomi',
    title: 'Ławka nad zatoką',
    alt: 'Para siedzi na drewnianej ławce i patrzy na zatokę w ciepłym, przymglonym świetle.',
    focus: { x: 0.55, y: 0.5 }, color: '#b9a178',
    credit: { author: 'Charlie Foster', url: 'https://unsplash.com/photos/A88emaZe7d8' },
  },
  {
    slug: 'skok-pod-slonce', widths: W4, width: 2600, height: 1733, category: 'sport',
    title: 'Skok pod słońce',
    alt: 'Skater w wyskoku na krawędzi betonowej niecki, sylwetka na tle zachodzącego słońca.',
    focus: { x: 0.47, y: 0.45 }, color: '#706a63',
    credit: { author: 'Matteo Paganelli', url: 'https://unsplash.com/photos/FhHGPO3aMsU' },
  },
  {
    slug: 'tulipany', widths: W4, width: 2600, height: 1509, category: 'natura',
    title: 'Tulipany pod lasem',
    alt: 'Pomarańczowe tulipany podświetlone słońcem na skraju lasu.',
    focus: { x: 0.5, y: 0.6 }, color: '#796b47',
    credit: { author: 'Ales Krivec', url: 'https://unsplash.com/photos/hLxqYJspAkE' },
  },
  {
    slug: 'z-aparatem', widths: [480, 960, 1386], width: 1386, height: 1733, category: 'portrety',
    title: 'Druga strona aparatu',
    alt: 'Dziewczyna w czerwonej czapce robi zdjęcie starym aparatem na tle ciemnej zieleni.',
    focus: { x: 0.5, y: 0.35 }, color: '#334347',
    credit: { author: 'Benjamin Combs', url: 'https://unsplash.com/photos/hiAdjnXZxl8' },
  },
  {
    slug: 'popoludniowa-przejazdzka', widths: W4, width: 2600, height: 1733, category: 'sport',
    title: 'Popołudniowa przejażdżka',
    alt: 'Uśmiechnięta dziewczyna jedzie białym rowerem po asfalcie, w tle góry i niskie słońce.',
    focus: { x: 0.6, y: 0.45 }, color: '#8a7f79',
    credit: { author: 'Abigail Keenan', url: 'https://unsplash.com/photos/8jqna7aA-vs' },
  },
  {
    slug: 'zolta-sciana', widths: W4, width: 2600, height: 1733, category: 'miasto',
    title: 'Żółta ściana',
    alt: 'Mała postać idzie wzdłuż ogromnej, jaskrawożółtej ściany.',
    focus: { x: 0.85, y: 0.7 }, color: '#f7c403',
    credit: { author: 'Rodion Kutsaev', url: 'https://unsplash.com/photos/IJ25m7fXqtk' },
  },
  {
    slug: 'husky', widths: W4, width: 2600, height: 1462, category: 'zwierzaki',
    title: 'Husky o zmierzchu',
    alt: 'Pies husky w szelkach patrzy w bok na ciemnym tle.',
    focus: { x: 0.65, y: 0.4 }, color: '#312f2f',
    credit: { author: 'Alexander Dimitrov', url: 'https://unsplash.com/photos/KGy1GFeKBu4' },
  },
  {
    slug: 'metro', widths: [480, 960, 1386], width: 1386, height: 1733, category: 'miasto',
    title: 'Peron, chwilę przed',
    alt: 'Kobieta w białym swetrze stoi na peronie, za nią rozmyty, przejeżdżający pociąg.',
    focus: { x: 0.5, y: 0.4 }, color: '#b9b9b8',
    credit: { author: 'Eutah Mizushima', url: 'https://unsplash.com/photos/2TlAsvhqiL0' },
  },
  {
    slug: 'dolina', widths: W4, width: 2600, height: 1733, category: 'natura',
    title: 'Dolina po deszczu',
    alt: 'Granitowe ściany doliny nad rzeką, na pierwszym planie wysokie sosny.',
    focus: { x: 0.5, y: 0.5 }, color: '#615a4a',
    credit: { author: 'Christian Joudrey', url: 'https://unsplash.com/photos/mWRR1xj95hg' },
  },
  {
    slug: 'przytulas', widths: [480, 960, 1386], width: 1386, height: 1733, category: 'znajomi',
    title: 'Przytulas na bruku',
    alt: 'Mama przykuca na brukowanej ulicy i mocno przytula małą córkę.',
    focus: { x: 0.5, y: 0.45 }, color: '#9c9491',
    credit: { author: 'London Scout', url: 'https://unsplash.com/photos/4-gFGb12hFA' },
  },
  {
    slug: 'surfer', widths: W4, width: 2600, height: 1727, category: 'sport',
    title: 'Ostatnia fala',
    alt: 'Surfer z deską pod pachą idzie brzegiem morza pod zachodzące słońce.',
    focus: { x: 0.45, y: 0.6 }, color: '#623f30',
    credit: { author: 'Rafael Leão', url: 'https://unsplash.com/photos/PW0-vZD0wis' },
  },
  {
    slug: 'szalik', widths: W4, width: 2600, height: 1733, category: 'portrety',
    title: 'Wiatr od morza',
    alt: 'Kobieta w szaliku i okularach stoi tyłem nad morzem o zmierzchu.',
    focus: { x: 0.5, y: 0.4 }, color: '#a59e88',
    credit: { author: 'Matthew Wiebe', url: 'https://unsplash.com/photos/tBtuxtLvAZs' },
  },
  {
    slug: 'grzyb', widths: W4, width: 2600, height: 1733, category: 'natura',
    title: 'Mały grzyb, duże światło',
    alt: 'Smukły grzyb w mchu, podświetlony ciepłym światłem, tło rozmyte.',
    focus: { x: 0.4, y: 0.5 }, color: '#938b56',
    credit: { author: 'Manuel Barroso Parejo', url: 'https://unsplash.com/photos/M9F8VR0jEPM' },
  },
  {
    slug: 'mops-w-kocu', widths: [480, 960, 1387], width: 1387, height: 1734, category: 'zwierzaki',
    title: 'Mops w kocu',
    alt: 'Mops owinięty kraciastym kocem siedzi na leśnej ścieżce.',
    focus: { x: 0.5, y: 0.4 }, color: '#838070',
    credit: { author: 'Matthew Wiebe', url: 'https://unsplash.com/photos/U5rMrSI7Pn4' },
  },
  {
    slug: 'ulica-pod-slonce', widths: [480, 960, 1200], width: 1200, height: 715, category: 'miasto',
    title: 'Ulica pod słońce',
    alt: 'Wąska ulica z torami tramwajowymi, na jej końcu nisko zachodzi słońce.',
    focus: { x: 0.5, y: 0.5 }, color: '#6a4020',
    credit: { author: 'Loudge', url: 'https://unsplash.com/photos/VfIYjO8P_24' },
  },
  {
    slug: 'wieczor', widths: [480, 960, 1536], width: 1536, height: 2304, category: 'portrety',
    title: 'Wieczór nad miastem',
    alt: 'Dziewczyna widziana od tyłu patrzy na rozmyte światła miasta o zmierzchu.',
    focus: { x: 0.5, y: 0.45 }, color: '#7a747b',
    credit: { author: 'Christopher Sardegna', url: 'https://unsplash.com/photos/CMOa3H1SXG0' },
  },
  {
    slug: 'skok-nad-woda', widths: W4, width: 2600, height: 1733, category: 'znajomi',
    title: 'Skok nad wodą',
    alt: 'Grupa przyjaciół o zachodzie słońca, jeden z nich skacze wysoko; sylwetki odbijają się w wodzie.',
    focus: { x: 0.5, y: 0.4 }, color: '#8f8886',
    credit: { author: 'Brooklyn Morgan', url: 'https://unsplash.com/photos/vlSyS1VLCoQ' },
  },
  {
    slug: 'sosnowy-las', widths: [480, 960, 1386], width: 1386, height: 1733, category: 'natura',
    title: 'Sosnowy las',
    alt: 'Proste pnie sosen nad gęstym zielonym runem w miękkim świetle.',
    focus: { x: 0.5, y: 0.5 }, color: '#75785a',
    credit: { author: 'Jon Ottosson', url: 'https://unsplash.com/photos/JU2MgHOHDsw' },
  },
  {
    slug: 'labrador', widths: W4, width: 2600, height: 1556, category: 'zwierzaki',
    title: 'Czarny labrador',
    alt: 'Czarny szczeniak labradora patrzy w obiektyw z drewnianej podłogi.',
    focus: { x: 0.5, y: 0.5 }, color: '#5c4f44',
    credit: { author: 'André Spieker', url: 'https://unsplash.com/photos/8wTPqxlnKM4' },
  },
  {
    slug: 'buldog', widths: W4, width: 2600, height: 1733, category: 'zwierzaki',
    title: 'Buldog na spacerze',
    alt: 'Biało-pręgowany buldog angielski stoi na kostce brukowej i patrzy w bok.',
    focus: { x: 0.55, y: 0.45 }, color: '#575351',
    credit: { author: 'Yamon Figurs', url: 'https://unsplash.com/photos/2zlxFmByClI' },
  },
];

/** Zdjęcie w sekcji „O mnie” (detal aparatu, dopóki Leon nie doda własnego portretu). */
export const ABOUT_PHOTO = {
  slug: 'aparat', widths: W4, width: 2400, height: 1600,
  alt: 'Stary aparat fotograficzny w ciepłym świetle.', color: '#514d43',
  credit: { author: 'Nicola Perantoni', url: 'https://unsplash.com/photos/irUQaBK3ydI' },
};

/** Ramka bohatera na zdjęciu głównym (0–1) — tu zsuwają się narożniki ostrości. */
export const HERO_SUBJECT = { x0: 0.36, y0: 0.13, x1: 0.66, y1: 0.6 };

export function srcSet(slug: string, widths: number[]): string {
  return widths.map((w) => `/photos/${slug}-${w}.webp ${w}w`).join(', ');
}

export function src(slug: string, widths: number[], target = 960): string {
  const w = widths.find((x) => x >= target) ?? widths[widths.length - 1];
  return `/photos/${slug}-${w}.webp`;
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
