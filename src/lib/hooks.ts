import { useEffect, useState } from 'react';

function query(q: string) {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false;
}

export function useMediaQuery(q: string) {
  const [match, setMatch] = useState(() => query(q));
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(query(q));
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return match;
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const MOBILE = '(max-width: 760px)';

export function prefersReducedMotion() {
  return query(REDUCED_MOTION);
}

/** Jedna wspólna wysokość okna (stabilna na mobile — bez skoków paska adresu). */
export function viewportHeight() {
  return window.innerHeight;
}
