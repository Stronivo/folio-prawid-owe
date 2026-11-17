# FOLIO — Leon Klimek

Strona marki fotograficznej FOLIO. React + TypeScript + Vite, płynne przewijanie (Lenis), bez płatnych usług.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # wersja produkcyjna w dist/
```

## Sekcje

1. **Hero** — pełnoekranowe zdjęcie, wejście przez „otwarcie kadru” i błysk flesza, logo z obracającą się przysłoną.
2. **Manifest** — słowa nagłówka zapalają się w trakcie przewijania.
3. **Portfolio** — nieregularna siatka, filtry kategorii, lightbox (strzałki, Esc, przesunięcie palcem).
4. **Featured project „Nocturne”** — przypięta sekcja przewijana poziomo.
5. **Proces** — przyklejony kadr, zdjęcia odsłaniane kurtyną, licznik 01–04.
6. **Kontakt** — formularz + dane kontaktowe.

## Co uzupełnić przed publikacją

| Co | Gdzie |
| --- | --- |
| E-mail, Instagram, lokalizacja | `src/data.ts` → `SITE` (obecny e-mail i Instagram to **przykłady**) |
| Formularz | `src/data.ts` → `FORMSPREE_ENDPOINT` albo zmienna `VITE_FORMSPREE_ENDPOINT` na Vercel. Bez niej formularz otwiera gotową wiadomość w programie pocztowym. |
| Zdjęcia, tytuły, kategorie | `src/data.ts` → `PHOTOS`, `FEATURED`, `PROCESS`, `HERO` |

Pliki zdjęć: `public/photos/<slug>-<szerokość>.webp` (640, 1080, 1600, 2400).

## Logo

`src/logoPaths.ts` to wektorowy obrys 1:1 dostarczonego pliku `public/folio-logo.png`
(litery, przysłona i gwiazdka jako osobne warstwy — do animacji). Kształt znaku nie został zmieniony;
gwiazdka ma kolor flesza `#ff4f1f`.

## Zdjęcia demonstracyjne

Wszystkie zdjęcia pochodzą z Unsplash (licencja Unsplash) i służą wyłącznie jako materiał przykładowy —
podmień je na własne prace. Informacja w stopce: „Zdjęcia demonstracyjne: Unsplash”.
