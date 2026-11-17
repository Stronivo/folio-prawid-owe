import type { CSSProperties, ElementType, ReactNode } from 'react';

interface Props {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  /** opóźnienie pierwszej linii (s) */
  delay?: number;
  step?: number;
  id?: string;
}

/** Nagłówek, którego linie wysuwają się spod maski po wejściu w kadr. */
export default function Lines({ as: Tag = 'h2', lines, className = '', delay = 0, step = 0.09, id }: Props) {
  return (
    <Tag className={`lines ${className}`} data-reveal="lines" id={id}>
      {lines.map((l, i) => (
        <span className="line" key={i}>
          <span style={{ '--d': `${delay + i * step}s` } as CSSProperties}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}
