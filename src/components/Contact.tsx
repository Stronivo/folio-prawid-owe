import { useRef, useState } from 'react';
import { CATEGORIES } from '../data/photos';
import { SITE } from '../config';

type Field = 'name' | 'email' | 'type' | 'message';
type Status = 'idle' | 'sending' | 'success' | 'error' | 'demo';

const TYPES = [...CATEGORIES.map((c) => c.label), 'Mam inny pomysł'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Record<Field, string>) {
  const e: Partial<Record<Field, string>> = {};
  if (!v.name.trim()) e.name = 'Wpisz, jak masz na imię.';
  if (!v.email.trim()) e.email = 'Podaj adres e-mail, żebym mógł odpisać.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Ten adres e-mail wygląda na niepełny — sprawdź go, proszę.';
  if (!v.type) e.type = 'Wybierz rodzaj zdjęć albo „Mam inny pomysł”.';
  if (v.message.trim().length < 10) e.message = 'Napisz kilka słów o pomyśle (co najmniej 10 znaków).';
  return e;
}

export default function Contact() {
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', type: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const demo = !SITE.formspreeEndpoint;

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [f]: value }));
    if (errors[f]) setErrors((er) => ({ ...er, [f]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    const first = (Object.keys(errs) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (demo) {
      setStatus('demo');
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }
    setStatus('sending');
    setServerMsg('');
    try {
      const res = await fetch(SITE.formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imie: values.name.trim(),
          email: values.email.trim(),
          rodzaj_zdjec: values.type,
          wiadomosc: values.message.trim(),
          _subject: `FOLIO: ${values.type} — ${values.name.trim()}`,
          _replyto: values.email.trim(),
        }),
      });
      if (res.ok) {
        setStatus('success');
        setValues({ name: '', email: '', type: '', message: '' });
      } else {
        let msg = '';
        try {
          const data = await res.json();
          msg = Array.isArray(data?.errors) ? data.errors.map((x: { message?: string }) => x.message).filter(Boolean).join(' ') : '';
        } catch {
          /* brak treści */
        }
        setServerMsg(msg);
        setStatus('error');
      }
    } catch {
      setServerMsg('');
      setStatus('error');
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const fieldProps = (f: Field) => ({
    id: `f-${f}`,
    name: f,
    value: values[f],
    onChange: set(f),
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? `f-${f}-err` : undefined,
  });

  const Err = ({ f }: { f: Field }) =>
    errors[f] ? (
      <p className="field__error" id={`f-${f}-err`}>
        {errors[f]}
      </p>
    ) : null;

  return (
    <section className="contact" id="kontakt" aria-labelledby="contact-title">
      <div className="contact__intro">
        <p className="kicker">Kontakt</p>
        <h2 id="contact-title" className="display contact__title">
          Masz pomysł na zdjęcia?
        </h2>
        <p className="contact__lead">Napisz, co chodzi Ci po głowie — miejsce w Żorach lub okolicy, porę dnia, kto ma być w kadrze. Odpiszę na podany e-mail.</p>
        {demo && (
          <p className="contact__demo-note">
            Formularz działa w trybie demonstracyjnym: adres Formspree nie jest jeszcze ustawiony, więc wiadomości nie są wysyłane.
          </p>
        )}
      </div>

      {status === 'success' ? (
        <div className="form-status form-status--success" ref={statusRef} tabIndex={-1} role="status">
          <p className="form-status__title">Dziękuję, wiadomość dotarła.</p>
          <p>Odezwę się na podany adres e-mail.</p>
          <button type="button" className="btn" onClick={() => setStatus('idle')}>
            Napisz kolejną wiadomość
          </button>
        </div>
      ) : (
        <form className="form" ref={formRef} onSubmit={onSubmit} noValidate>
          {status === 'error' && (
            <div className="form-status form-status--error" ref={statusRef} tabIndex={-1} role="alert">
              <p className="form-status__title">Nie udało się wysłać wiadomości.</p>
              <p>
                {serverMsg || 'Serwer nie potwierdził odbioru.'} Twoja treść została w formularzu — spróbuj ponownie za chwilę.
              </p>
            </div>
          )}
          {status === 'demo' && (
            <div className="form-status form-status--demo" ref={statusRef} tabIndex={-1} role="status">
              <p className="form-status__title">Tryb demonstracyjny — wiadomość nie została wysłana.</p>
              <p>Formularz jest poprawnie wypełniony, ale nie ma jeszcze podłączonego adresu Formspree. Treść zostaje w polach.</p>
            </div>
          )}

          <div className="form__row">
            <div className={`field${errors.name ? ' has-error' : ''}`}>
              <label htmlFor="f-name">Imię</label>
              <input type="text" autoComplete="given-name" {...fieldProps('name')} />
              <Err f="name" />
            </div>
            <div className={`field${errors.email ? ' has-error' : ''}`}>
              <label htmlFor="f-email">E-mail</label>
              <input type="email" autoComplete="email" inputMode="email" {...fieldProps('email')} />
              <Err f="email" />
            </div>
          </div>

          <div className={`field${errors.type ? ' has-error' : ''}`}>
            <label htmlFor="f-type">Rodzaj zdjęć</label>
            <div className="select">
              <select {...fieldProps('type')}>
                <option value="" disabled>
                  Wybierz…
                </option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Err f="type" />
          </div>

          <div className={`field${errors.message ? ' has-error' : ''}`}>
            <label htmlFor="f-message">Wiadomość</label>
            <textarea rows={6} {...fieldProps('message')} />
            <Err f="message" />
          </div>

          <div className="form__submit">
            <button type="submit" className="btn btn--ink" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wysyłanie…' : 'Napisz do Leona'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
