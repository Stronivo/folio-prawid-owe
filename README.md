# FOLIO — Leon Klimek

Strona fotograficzna: React + TypeScript + CSS (Vite). Bez płatnych bibliotek i usług.

```bash
npm install
npm run dev      # podgląd lokalny: http://localhost:5173
npm run build    # wersja produkcyjna w dist/
```

## Co ustawić przed publikacją

| Co | Gdzie |
| --- | --- |
| Adres formularza Formspree | `src/config.ts` → stała `FORMSPREE_ENDPOINT` (albo zmienna `VITE_FORMSPREE_ENDPOINT` na Vercel) |
| Oznaczenie „Zdjęcia przykładowe” | `src/config.ts` → `showSampleLabel: false` |
| Zdjęcia, kategorie, podpisy, opisy alternatywne, punkty kadrowania | `src/data/photos.ts` (pliki w `public/photos`) |
| Ramka bohatera zdjęcia głównego (narożniki ostrości) | `HERO_SUBJECT` w `src/data/photos.ts` |
| Nazwisko za sylwetką (linia liter, maska pierwszego planu) | `HERO_NAME` w `src/data/photos.ts` |
| Plakaty „Ludzie / Ruch / Miejsca” | `POSTERS` w `src/data/photos.ts` |
| Jedno miejsce, trzy pory dnia (3 zdjęcia z tej samej pozycji, nazwa miejsca) | `TIMES` w `src/data/photos.ts` |
| Sportowe przejście (akcja, piłka, portret) | `SPORT` w `src/data/photos.ts` |
| Pasek klatek w „O mnie” | `FILMSTRIP` w `src/data/photos.ts` |
| Panorama do gry „Złap kadr” | `PANO` i `RIDER` w `src/components/Game.tsx` |

Pierwsze zdjęcie na liście `PHOTOS` jest zdjęciem głównym i pierwszą odbitką w portfolio.
Pliki zdjęć: `public/photos/<slug>-<szerokość>.webp` (np. 480, 960, 1600, 2400 px).

## Formspree

1. Załóż darmowy formularz na formspree.io i skopiuj adres w postaci `https://formspree.io/f/xxxxxxx`.
2. Wklej go w `src/config.ts` do `FORMSPREE_ENDPOINT` **albo** dodaj na Vercel zmienną
   `VITE_FORMSPREE_ENDPOINT` (Settings → Environment Variables) i zrób ponowne wdrożenie.
3. Bez adresu formularz działa w uczciwym trybie demonstracyjnym — niczego nie wysyła.

## Vercel

Zaimportuj folder `folio` jako projekt. Vercel rozpozna Vite automatycznie
(build: `npm run build`, katalog wyjściowy: `dist`).

## Maska pierwszego planu

Na zdjęciu głównym nazwisko stoi za sylwetką. Zasłania je plik `public/photos/skok-maska-*.webp`:
ten sam kadr co zdjęcie główne, z przezroczystym tłem wszędzie poza bohaterem.
Po zmianie zdjęcia głównego przygotuj nową maskę (np. „Usuń tło” w edytorze, eksport
w tym samym rozmiarze) albo ustaw `HERO_NAME.cutout: null` — wtedy nazwisko leży za całym kadrem bez zasłaniania.

## Zdjęcia przykładowe

Zdjęcia demonstracyjne pochodzą z Unsplash (licencja Unsplash, przez picsum.photos)
oraz z rawpixel (CC0, przez Openverse): piłka, boisko, portret zawodniczki.
Warianty „trzy pory dnia” zostały przygotowane cyfrowo z jednego zdjęcia ulicy.
Autor każdego zdjęcia jest zapisany w `credit` i widoczny w podglądzie, dopóki
`showSampleLabel` jest włączone. Logo FOLIO: `public/folio-logo.png` (przycięte, z przezroczystym tłem).
