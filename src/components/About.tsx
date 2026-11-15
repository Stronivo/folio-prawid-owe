import { ABOUT_PHOTO, srcSet } from '../data/photos';

export default function About() {
  return (
    <section className="about" id="o-mnie" aria-labelledby="about-title">
      <figure className="about__photo">
        <img
          src={`/photos/${ABOUT_PHOTO.slug}-960.webp`}
          srcSet={srcSet(ABOUT_PHOTO.slug, ABOUT_PHOTO.widths)}
          sizes="(max-width: 760px) 100vw, 50vw"
          alt={ABOUT_PHOTO.alt}
          width={ABOUT_PHOTO.width}
          height={ABOUT_PHOTO.height}
          loading="lazy"
          decoding="async"
          style={{ backgroundColor: ABOUT_PHOTO.color }}
        />
      </figure>
      <div className="about__text">
        <p className="kicker">O mnie</p>
        <h2 id="about-title" className="display about__title">
          Cześć, jestem Leon.
        </h2>
        <p className="about__body">
          Lubię zdjęcia, na których ktoś jest zajęty chwilą i&nbsp;zapomina o&nbsp;aparacie. Jeśli masz ochotę wyjść na
          zdjęcia albo masz własny pomysł na kadr, napisz do mnie.
        </p>
        <a className="text-link" href="#kontakt">
          Napisz do Leona
        </a>
      </div>
    </section>
  );
}
