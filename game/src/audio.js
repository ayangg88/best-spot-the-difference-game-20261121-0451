// Twin Lanterns — all sound is synthesised with WebAudio: no audio files,
// no network, and nothing to load. A tiny bell for a find, a soft thud for a
// miss, a rising arpeggio when a level clears.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(frequency, startAt, length, type, volume) {
    if (this.muted || !this.context) return;
    const now = this.context.currentTime + startAt;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + length + 0.05);
  }

  found(combo) {
    this.ensure();
    const lift = Math.min(combo, 5) * 40;
    this.tone(660 + lift, 0, 0.22, 'sine', 0.22);
    this.tone(990 + lift, 0.07, 0.3, 'sine', 0.18);
    this.tone(1320 + lift, 0.14, 0.34, 'triangle', 0.1);
  }

  miss() {
    this.ensure();
    this.tone(140, 0, 0.18, 'sawtooth', 0.08);
    this.tone(98, 0.05, 0.22, 'sawtooth', 0.07);
  }

  hint() {
    this.ensure();
    this.tone(520, 0, 0.16, 'sine', 0.14);
    this.tone(780, 0.1, 0.22, 'sine', 0.12);
  }

  levelClear() {
    this.ensure();
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.32, 'triangle', 0.16));
  }

  gameClear() {
    this.ensure();
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, i * 0.12, 0.4, 'triangle', 0.15));
  }

  tick() {
    this.ensure();
    this.tone(880, 0, 0.06, 'square', 0.04);
  }
}
