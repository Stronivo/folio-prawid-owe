import { useRef, useState, type FormEvent } from 'react';
import { CATEGORIES, SITE } from '../data';
import { scrollToTarget } from '../lib/motion';
import Lines from '../components/Lines';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<string>('Portret');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const start = () => {
    const f = form.current;
    if (!f) return;
    scrollToTarget(f, window.innerWidth < 760 ? -90 : -160);
    window.setTimeout(() => f.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }), 900);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const date = String(data.get('date') ?? '').trim();
    const next: Record<string, string> = {};
    if (!name) next.name = 'Podaj imię.';
    if (!EMAIL_RE.test(email)) next.email = 'Sprawdź adres e-mail.';
    if (message.length < 10) next.message = 'Napisz kilka słów o sesji.';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!SITE.formspree) {
      // bez skonfigurowanego formularza — otwórz gotową wiadomość w programie pocztowym
      const body = `${message}\n\nRodzaj sesji: ${kind}${date ? `\nTermin: ${date}` : ''}\n\n${name}\n${email}`;
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Sesja: ${kind} — ${name}`)}&body=${encodeURIComponent(body)}`;
      setStatus('mail');
      return;
    }
    setStatus('sending');
    try {
      data.set('kind', kind);
      const res = await fetch(SITE.formspree, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      e.currentTarget?.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="kontakt" className="contact" data-nav="dark">
      <div className="wrap">
        <div className="sec-head" data-reveal="fade">
          <span className="mono">(05)</span>
          <span className="mono">Kontakt</span>
          <span className="sec-head__rule" />
          <span className="mono">{SITE.location}</span>
        </div>

        <Lines
          className="contact__title display"
          lines={['Masz historię', <>do <em className="serif">opowiedzenia?</em></>]}
        />

        <div className="contact__grid">
          <div className="contact__aside">
            <p className="contact__lead" data-reveal="up">
              Napisz, co chcesz uwiecznić — portret, wydarzenie, markę albo coś, czego jeszcze nie potrafisz nazwać.
              Odpowiadam osobiście i zaproponuję, jak możemy to zrobić.
            </p>
            <button className="btn btn--flash btn--xl" onClick={start} data-reveal="up">
              <span className="btn__label">Porozmawiajmy o sesji</span>
              <span className="btn__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5.5l6.5 6.5-6.5 6.5" /></svg>
              </span>
            </button>

            <dl className="contact__data" data-reveal="up">
              <div>
                <dt className="mono">E-mail</dt>
                <dd><a className="ulink" href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
              </div>
              <div>
                <dt className="mono">Instagram</dt>
                <dd><a className="ulink" href={SITE.instagram.url} target="_blank" rel="noreferrer">{SITE.instagram.handle}</a></dd>
              </div>
              <div>
                <dt className="mono">Studio</dt>
                <dd>{SITE.location}</dd>
              </div>
            </dl>
          </div>

          <form ref={form} className="form" onSubmit={submit} noValidate data-reveal="up">
            <fieldset className="form__kinds">
              <legend className="mono">Rodzaj sesji</legend>
              <div className="chips">
                {[...CATEGORIES.map((c) => c.label), 'Inne'].map((k) => (
                  <label key={k} className={`chip ${kind === k ? 'is-on' : ''}`}>
                    <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
                    {k}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form__row">
              <Field name="name" label="Imię" autoComplete="name" error={errors.name} />
              <Field name="email" label="E-mail" type="email" autoComplete="email" error={errors.email} />
            </div>
            <Field name="date" label="Planowany termin (opcjonalnie)" />
            <Field name="message" label="Opowiedz o swojej historii" textarea error={errors.message} />

            <div className="form__foot">
              <button className="btn btn--light" type="submit" disabled={status === 'sending'}>
                <span className="btn__label">{status === 'sending' ? 'Wysyłanie…' : 'Wyślij wiadomość'}</span>
                <span className="btn__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5.5l6.5 6.5-6.5 6.5" /></svg>
                </span>
              </button>
              <p className="form__status" role="status" aria-live="polite">
                {status === 'sent' && 'Dziękuję! Wiadomość dotarła — odezwę się wkrótce.'}
                {status === 'mail' && 'Otwieram Twój program pocztowy z gotową wiadomością.'}
                {status === 'error' && `Coś poszło nie tak. Napisz bezpośrednio: ${SITE.email}`}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  name, label, type = 'text', textarea, autoComplete, error,
}: { name: string; label: string; type?: string; textarea?: boolean; autoComplete?: string; error?: string }) {
  const id = `f-${name}`;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      {textarea ? (
        <textarea id={id} name={name} rows={4} placeholder=" " aria-invalid={!!error} />
      ) : (
        <input id={id} name={name} type={type} placeholder=" " autoComplete={autoComplete} aria-invalid={!!error} />
      )}
      <label htmlFor={id}>{label}</label>
      <span className="field__line" aria-hidden="true" />
      {error && <span className="field__err mono">{error}</span>}
    </div>
  );
}
