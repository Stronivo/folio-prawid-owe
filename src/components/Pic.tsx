import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { type Img, src, srcSet } from '../data';
import { useParallax } from '../lib/motion';

interface Props {
  img: Img;
  sizes: string;
  className?: string;
  /** siła paralaksy (0 = brak) */
  parallax?: number;
  eager?: boolean;
  /** wymuś proporcje ramki (np. "4 / 5"); domyślnie proporcje zdjęcia */
  aspect?: string | null;
  style?: CSSProperties;
}

export default function Pic({ img, sizes, className = '', parallax = 0, eager = false, aspect, style }: Props) {
  const ref = useParallax<HTMLImageElement>(parallax);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const [fx, fy] = img.focus ?? [0.5, 0.5];
  const frameStyle: CSSProperties = {
    ['--tone' as string]: img.tone,
    aspectRatio: aspect === null ? undefined : aspect ?? String(img.ratio),
    ...style,
  };

  return (
    <div className={`pic ${loaded ? 'is-loaded' : ''} ${className}`} style={frameStyle}>
      <img
        ref={(el) => {
          imgRef.current = el;
          (ref as React.MutableRefObject<HTMLImageElement | null>).current = el;
        }}
        srcSet={srcSet(img)}
        sizes={sizes}
        src={src(img)}
        alt={img.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        style={{ objectPosition: `${fx * 100}% ${fy * 100}%` }}
        onLoad={() => setLoaded(true)}
        {...(eager ? { fetchpriority: 'high' } : {})}
      />
    </div>
  );
}
