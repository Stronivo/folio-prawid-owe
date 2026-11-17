import { BLADES, LETTERS, LOGO_H, LOGO_W, STAR } from '../logoPaths';

interface Props {
  className?: string;
  /** gwiazdka w kolorze flesza */
  accent?: boolean;
  title?: string;
}

/** Logo FOLIO — wektorowy obrys dostarczonego znaku. Przysłona i gwiazdka są osobnymi warstwami do animacji. */
export default function Logo({ className = '', accent = true, title = 'FOLIO' }: Props) {
  return (
    <svg
      className={`logo ${className}`}
      viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <path className="logo__letters" fillRule="evenodd" d={LETTERS} />
      <g className="logo__iris">
        <path className="logo__blades" d={BLADES} />
      </g>
      <g className="logo__star-wrap">
        <path className={`logo__star${accent ? ' is-accent' : ''}`} d={STAR} />
      </g>
    </svg>
  );
}
