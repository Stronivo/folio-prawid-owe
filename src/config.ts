/**
 * Ustawienia strony FOLIO — wszystko, co Leon zmienia najczęściej, jest tutaj.
 */

/**
 * ▼▼▼ TUTAJ WKLEJ ADRES FORMULARZA FORMSPREE ▼▼▼
 * Przykład: 'https://formspree.io/f/abcdwxyz'
 * Zamiast tego możesz ustawić zmienną środowiskową VITE_FORMSPREE_ENDPOINT
 * (lokalnie w pliku .env.local, na Vercel: Settings → Environment Variables).
 * Pusty adres = uczciwy tryb demonstracyjny — nic nie jest wysyłane.
 */
const FORMSPREE_ENDPOINT = '';

export const SITE = {
  photographer: 'Leon Klimek',
  tagline: 'Portrety, ruch i życie ulicy.',

  /**
   * Oznaczenie „Zdjęcia przykładowe” przy galerii i w podglądzie.
   * Po podmianie zdjęć na własne ustaw na `false`.
   */
  showSampleLabel: true,

  formspreeEndpoint:
    FORMSPREE_ENDPOINT || ((import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined) ?? ''),
};
