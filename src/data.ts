/**
 * FOLIO — Leon Klimek. Wszystkie treści strony w jednym miejscu.
 *
 * Zdjęcia: public/photos/<slug>-<szerokość>.webp
 * Zdjęcia demonstracyjne pochodzą z Unsplash (licencja Unsplash) — podmień je na własne.
 */

const FORMSPREE_ENDPOINT = '';

export const SITE = {
  brand: 'FOLIO',
  photographer: 'Leon Klimek',
  role: 'Fotograf',
  location: 'Żory · Śląsk',
  /** ▼ Uzupełnij prawdziwymi danymi przed publikacją. */
  email: 'kontakt@folio-studio.pl',
  instagram: { handle: '@folio.leonklimek', url: 'https://instagram.com/' },
  formspree:
    FORMSPREE_ENDPOINT || ((import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined) ?? ''),
};

export type CategoryId = 'portret' | 'eventy' | 'lifestyle' | 'kreatywne' | 'produkt';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'portret', label: 'Portret' },
  { id: 'eventy', label: 'Eventy' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'kreatywne', label: 'Sesje kreatywne' },
  { id: 'produkt', label: 'Produkt' },
];

export interface Img {
  slug: string;
  /** szerokości plików w public/photos */
  widths: number[];
  /** proporcje oryginału (szerokość / wysokość) */
  ratio: number;
  alt: string;
  /** punkt kadrowania 0–1 */
  focus?: [number, number];
  /** kolor tła przed załadowaniem */
  tone: string;
}

export interface Photo extends Img {
  title: string;
  category: CategoryId;
}

const WIDE = [640, 1080, 1600, 2400];
const TALL = [640, 1080, 1600];

export const HERO: Img = {
  slug: 'hero',
  widths: [640, 1080, 1600, 2560],
  ratio: 1.5,
  alt: 'Portret kobiety o kręconych blond włosach na ciemnym tle, obok ściana ciepłych żarówek.',
  focus: [0.5, 0.4],
  tone: '#1b1714',
};

export const PHOTOS: Photo[] = [
  {
    slug: 'portret-cien', widths: TALL, ratio: 2 / 3, tone: '#2f2620', focus: [0.5, 0.3],
    title: 'Półcień', category: 'portret',
    alt: 'Portret mężczyzny w swetrze na czarnym tle, światło z boku.',
  },
  {
    slug: 'event-slub', widths: WIDE, ratio: 1.5, tone: '#52473e', focus: [0.55, 0.5],
    title: 'Zanim padnie „tak”', category: 'eventy',
    alt: 'Panna młoda trzyma bukiet w półmroku, ciepłe światło z okna.',
  },
  {
    slug: 'kreacja-zolty', widths: TALL, ratio: 640 / 886, tone: '#afb292', focus: [0.5, 0.35],
    title: 'Żółty kod', category: 'kreatywne',
    alt: 'Kobieta w żółtym dresie na tle betonu i nieba, mocne słońce.',
  },
  {
    slug: 'produkt-serum', widths: TALL, ratio: 2 / 3, tone: '#afa293', focus: [0.5, 0.55],
    title: 'Serum, cień liścia', category: 'produkt',
    alt: 'Szklana buteleczka z pipetą na drewnianym postumencie, cień liścia na ścianie.',
  },
  {
    slug: 'life-przyjaciele', widths: WIDE, ratio: 1.5, tone: '#c3ac9a', focus: [0.5, 0.5],
    title: 'Złota godzina', category: 'lifestyle',
    alt: 'Czworo przyjaciół obejmuje się na wzgórzu, patrząc na zachód słońca.',
  },
  {
    slug: 'portret-mono', widths: WIDE, ratio: 640 / 499, tone: '#313131', focus: [0.5, 0.45],
    title: 'Bez koloru', category: 'portret',
    alt: 'Czarno-biały portret kobiety z krótkimi włosami na ciemnym tle.',
  },
  {
    slug: 'event-koncert', widths: WIDE, ratio: 1.5, tone: '#8c6e5c', focus: [0.5, 0.4],
    title: 'Pierwszy rząd', category: 'eventy',
    alt: 'Tłum na koncercie, dłonie złożone w serce na tle scenicznych świateł.',
  },
  {
    slug: 'kreacja-skok', widths: TALL, ratio: 2 / 3, tone: '#a58070', focus: [0.5, 0.45],
    title: 'Grawitacja', category: 'kreatywne',
    alt: 'Mężczyzna w skórzanej kurtce w przysiadzie na krawędzi muru z czerwonej cegły.',
  },
  {
    slug: 'produkt-sluchawki', widths: WIDE, ratio: 1.5, tone: '#deb833', focus: [0.5, 0.5],
    title: 'Cisza na żółtym', category: 'produkt',
    alt: 'Czarne słuchawki nauszne na intensywnie żółtym tle.',
  },
  {
    slug: 'life-slonce', widths: TALL, ratio: 1, tone: '#a29389', focus: [0.45, 0.4],
    title: 'Pod słońce', category: 'lifestyle',
    alt: 'Uśmiechnięta kobieta w okularach odwraca głowę, włosy podświetlone słońcem.',
  },
  {
    slug: 'portret-rude', widths: TALL, ratio: 2 / 3, tone: '#754230', focus: [0.5, 0.3],
    title: 'Miedź', category: 'portret',
    alt: 'Rudowłosa kobieta patrzy przez ramię, ciepłe światło na ceglanym tle.',
  },
  {
    slug: 'event-konfetti', widths: WIDE, ratio: 1.5, tone: '#25251f', focus: [0.5, 0.5],
    title: 'Ostatni bis', category: 'eventy',
    alt: 'Konfetti nad sceną i publicznością w ciemnej sali koncertowej.',
  },
  {
    slug: 'produkt-but', widths: TALL, ratio: 0.8, tone: '#d0c8c2', focus: [0.5, 0.6],
    title: 'Zamsz i brzoskwinie', category: 'produkt',
    alt: 'Zielony zamszowy but na pastelowych bryłach, obok dwie brzoskwinie.',
  },
  {
    slug: 'kreacja-fiolet', widths: TALL, ratio: 640 / 959, tone: '#675868', focus: [0.5, 0.35],
    title: 'Fiolet', category: 'kreatywne',
    alt: 'Profil kobiety w fioletowo-turkusowym świetle na szarym tle.',
  },
  {
    slug: 'life-kawa', widths: WIDE, ratio: 1.5, tone: '#675445', focus: [0.5, 0.5],
    title: 'Niedzielny rytuał', category: 'lifestyle',
    alt: 'Dwie dłonie stukają się filiżankami kawy z latte art nad drewnianym stołem.',
  },
  {
    slug: 'portret-studio', widths: TALL, ratio: 2 / 3, tone: '#383130', focus: [0.5, 0.3],
    title: 'Studio, jedna lampa', category: 'portret',
    alt: 'Portret młodej kobiety w czarnej bluzce na grafitowym tle studyjnym.',
  },
  {
    slug: 'event-swiatla', widths: WIDE, ratio: 1.5, tone: '#78463e', focus: [0.5, 0.5],
    title: 'Ekrany w górze', category: 'eventy',
    alt: 'Publiczność koncertu nagrywa scenę telefonami w różowo-pomarańczowym świetle.',
  },
  {
    slug: 'produkt-zegarek', widths: WIDE, ratio: 640 / 465, tone: '#a5a098', focus: [0.5, 0.5],
    title: 'Czas w dłoni', category: 'produkt',
    alt: 'Dłoń trzyma minimalistyczny zegarek z brązowym paskiem.',
  },
  {
    slug: 'kreacja-pomarancz', widths: WIDE, ratio: 1.5, tone: '#9f735c', focus: [0.5, 0.45],
    title: 'Terakota', category: 'kreatywne',
    alt: 'Mężczyzna w kapeluszu i okrągłych okularach na tle ceglastej ściany.',
  },
  {
    slug: 'life-joga', widths: TALL, ratio: 640 / 744, tone: '#745f52', focus: [0.5, 0.5],
    title: 'Oddech', category: 'lifestyle',
    alt: 'Sylwetka osoby medytującej na tarasie o zachodzie słońca.',
  },
  {
    slug: 'portret-profil', widths: TALL, ratio: 0.8, tone: '#333333', focus: [0.5, 0.4],
    title: 'Linia profilu', category: 'portret',
    alt: 'Czarno-biały portret kobiety z długimi włosami, kolczyk w świetle.',
  },
  {
    slug: 'produkt-roza', widths: TALL, ratio: 640 / 958, tone: '#795f57', focus: [0.5, 0.5],
    title: 'Martwa natura', category: 'produkt',
    alt: 'Pojedyncza róża w szklanym wazonie, ostre światło i cień na ścianie.',
  },
];

/* ───────────── Featured project ───────────── */

export const FEATURED = {
  name: 'Nocturne',
  subtitle: 'Miasto po zmroku',
  kind: 'Sesja edytorialowa · projekt autorski',
  intro:
    'Seria portretów zrobionych wyłącznie w zastanym świetle miasta — neonach, witrynach i reflektorach. Bez lamp, bez blendy. Tylko to, co noc daje sama.',
  meta: [
    ['Typ', 'Sesja kreatywna'],
    ['Światło', 'Zastane, neony'],
    ['Rok', '2026'],
  ] as [string, string][],
  quote: 'Kiedy gaśnie dzień, miasto zaczyna mówić światłem.',
  frames: [
    {
      slug: 'noc-ulica', widths: WIDE, ratio: 1.5, tone: '#145563',
      alt: 'Nocna ulica w turkusowo-różowym świetle neonów.',
      caption: 'Plan ogólny', note: 'Najpierw miejsce. Kolor ulicy wyznacza paletę całej serii.',
    },
    {
      slug: 'noc-turkus', widths: TALL, ratio: 640 / 958, tone: '#128b7a',
      alt: 'Kobieta w spodniach w paski pozuje przy turkusowej ścianie z neonem.',
      caption: 'Kolor jako bohater', note: 'Jedna barwa, jedno źródło. Reszta znika w cieniu.',
    },
    {
      slug: 'noc-niebieski', widths: TALL, ratio: 0.8, tone: '#6b6fa1',
      alt: 'Portret kobiety w chłodnym, niebieskim świetle.',
      caption: 'Chłód ekranu', note: '',
    },
    {
      slug: 'noc-aparat', widths: TALL, ratio: 2 / 3, tone: '#395b6e',
      alt: 'Kobieta z aparatem przy oku na tle świateł nocnego miasta.',
      caption: 'Po drugiej stronie', note: '',
    },
    {
      slug: 'noc-ciezarowka', widths: TALL, ratio: 2 / 3, tone: '#3d393f',
      alt: 'Kobieta siedzi na starej ciężarówce oświetlonej girlandą żarówek.',
      caption: 'Ostatnia klatka', note: 'Koniec nocy. Żarówki gasną jedna po drugiej.',
    },
  ] satisfies (Img & { caption: string; note: string })[],
};

/* ───────────── Proces ───────────── */

export const PROCESS: { n: string; title: string; text: string; img: Img }[] = [
  {
    n: '01', title: 'Pomysł',
    text: 'Zaczynamy od rozmowy. Poznaję Twoją historię, cel zdjęć i miejsce, w którym mają żyć. Razem układamy moodboard i kierunek światła.',
    img: { slug: 'proces-pomysl', widths: WIDE, ratio: 4 / 3, tone: '#716052', alt: 'Stary aparat i odbitki polaroid rozłożone na mapie.' },
  },
  {
    n: '02', title: 'Przygotowanie',
    text: 'Lokalizacja, stylizacja, plan dnia i lista ujęć. Dopinam szczegóły wcześniej, żeby w dniu sesji nic nie odciągało uwagi od tego, co ważne.',
    img: { slug: 'proces-studio', widths: WIDE, ratio: 16 / 9, tone: '#6a6970', alt: 'Studio fotograficzne z lampami i białym tłem, gotowe do sesji.' },
  },
  {
    n: '03', title: 'Sesja',
    text: 'Pracuję spokojnie i blisko ludzi. Prowadzę i podpowiadam, ale najlepsze kadry dzieją się pomiędzy — w śmiechu, w spojrzeniu, w ruchu.',
    img: { slug: 'proces-sesja', widths: WIDE, ratio: 640 / 433, tone: '#747569', alt: 'Fotograf z aparatem przy oku na ruchliwej ulicy.' },
  },
  {
    n: '04', title: 'Gotowe fotografie',
    text: 'Selekcja, autorska obróbka koloru i retusz. Dostajesz prywatną galerię online z plikami w pełnej rozdzielczości, gotowymi do druku.',
    img: { slug: 'proces-gotowe', widths: TALL, ratio: 640 / 959, tone: '#58534b', focus: [0.5, 0.3], alt: 'Portret kobiety w koszuli w paski o zachodzie słońca.' },
  },
];

export const MANIFEST_IMG: Img = {
  slug: 'manifest-dlonie', widths: TALL, ratio: 1.5, tone: '#b29e95', focus: [0.5, 0.5],
  alt: 'Dłonie pary młodej z obrączką i bukietem kwiatów.',
};

/* ───────────── narzędzia ───────────── */

export function srcSet(img: Pick<Img, 'slug' | 'widths'>): string {
  return img.widths.map((w) => `/photos/${img.slug}-${w}.webp ${w}w`).join(', ');
}

export function src(img: Pick<Img, 'slug' | 'widths'>, target = 1080): string {
  const w = img.widths.find((x) => x >= target) ?? img.widths[img.widths.length - 1];
  return `/photos/${img.slug}-${w}.webp`;
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
