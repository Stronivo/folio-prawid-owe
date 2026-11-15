/** Dźwięk migawki — domyślnie wyłączony, włączany przełącznikiem w sekcji gry. */
type Listener = (on: boolean) => void;

let enabled = false;
const listeners = new Set<Listener>();
let ctx: AudioContext | null = null;

export function isSoundOn() {
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  listeners.forEach((l) => l(on));
}

export function onSoundChange(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Krótki, suchy klik mechaniczny generowany w locie (bez plików audio). */
export function playShutter() {
  if (!enabled) return;
  try {
    ctx = ctx ?? new AudioContext();
    const now = ctx.currentTime;
    const click = (at: number, gain: number, freq: number) => {
      const len = Math.floor(ctx!.sampleRate * 0.035);
      const buf = ctx!.createBuffer(1, len, ctx!.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ctx!.createBufferSource();
      src.buffer = buf;
      const bp = ctx!.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq;
      bp.Q.value = 0.9;
      const g = ctx!.createGain();
      g.gain.value = gain;
      src.connect(bp).connect(g).connect(ctx!.destination);
      src.start(at);
    };
    click(now, 0.9, 2600);
    click(now + 0.075, 0.6, 1800);
  } catch {
    /* brak Web Audio — cicho */
  }
}
