/**
 * Form Adventure City – a small Web Audio sound engine.
 * Every sound effect and the background music are generated in the browser,
 * so no audio files are needed and everything works offline.
 * The AudioContext is created on the first user gesture (browser autoplay rules).
 */

export type BuildingSoundName =
  | "building_L1"
  | "building_L2"
  | "building_L3"
  | "building_L4"
  | "building_final"
  | "building_reflect";

export type SfxName =
  | "click"
  | "pop"
  | "vote"
  | "correct"
  | "wrong"
  | "fanfare"
  | "whoosh"
  | "tick"
  | "bonk"
  | "ding"
  | "sparkle"
  | "applause"
  | "drum"
  | "badge"
  | "alert"
  | BuildingSoundName;

// A cheerful little loop in C major (16 eighth-notes per bar).
const MELODY = [523.25, 659.25, 783.99, 659.25, 880, 783.99, 659.25, 523.25, 587.33, 698.46, 880, 698.46, 783.99, 659.25, 587.33, 0];
const BASS = [130.81, 0, 130.81, 0, 110, 0, 110, 0, 87.31, 0, 87.31, 0, 98, 0, 98, 0];
const BPM = 116;
const LOOKAHEAD = 0.25;

interface ToneOptions {
  type?: OscillatorType;
  vol?: number;
  slideTo?: number;
  attack?: number;
  music?: boolean;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private musicOn = true;
  private sfxOn = true;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;

  /** Call on the first user gesture. Creates the audio context and starts the music if enabled. */
  unlock(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "running") {
      this.startMusic();
    } else {
      void ctx
        .resume()
        .then(() => this.startMusic())
        .catch(() => undefined);
    }
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  setSfx(on: boolean): void {
    this.sfxOn = on;
  }

  /** Plays the unique signature sound for a specific building/level. */
  playBuilding(levelId: "L1" | "L2" | "L3" | "L4" | "final" | "reflect"): void {
    const map: Record<"L1" | "L2" | "L3" | "L4" | "final" | "reflect", BuildingSoundName> = {
      L1: "building_L1",
      L2: "building_L2",
      L3: "building_L3",
      L4: "building_L4",
      final: "building_final",
      reflect: "building_reflect",
    };
    this.play(map[levelId]);
  }

  play(name: SfxName): void {
    if (!this.sfxOn) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;

    switch (name) {
      case "click":
        this.tone(880, t, 0.08, { type: "triangle", vol: 0.16, slideTo: 620 });
        break;
      case "pop":
        this.tone(320, t, 0.16, { type: "sine", vol: 0.3, slideTo: 980 });
        break;
      case "vote":
        this.tone(523.25, t, 0.12, { type: "triangle", vol: 0.22 });
        this.tone(783.99, t + 0.09, 0.2, { type: "triangle", vol: 0.22 });
        break;
      case "correct":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, t + i * 0.09, 0.25, { type: "triangle", vol: 0.22 }));
        break;
      case "wrong":
        this.tone(260, t, 0.3, { type: "sawtooth", vol: 0.1, slideTo: 130 });
        this.tone(196, t + 0.12, 0.3, { type: "square", vol: 0.05, slideTo: 98 });
        break;
      case "fanfare": {
        const notes: [number, number, number][] = [
          [523.25, 0, 0.12],
          [523.25, 0.13, 0.12],
          [523.25, 0.26, 0.12],
          [698.46, 0.39, 0.3],
          [783.99, 0.72, 0.3],
          [1046.5, 1.05, 0.9],
        ];
        for (const [f, at, d] of notes) this.tone(f, t + at, d, { type: "triangle", vol: 0.22 });
        break;
      }
      case "whoosh":
        this.noise(t, 0.45, 400, 2400, 0.9, 0.25);
        break;
      case "tick":
        this.tone(1400, t, 0.04, { type: "square", vol: 0.07 });
        break;
      case "bonk":
        this.tone(180, t, 0.18, { type: "square", vol: 0.12, slideTo: 80 });
        break;
      case "ding":
        this.tone(1318.5, t, 0.7, { type: "sine", vol: 0.25 });
        this.tone(1975.5, t, 0.5, { type: "sine", vol: 0.08 });
        break;
      case "sparkle":
        [1568, 1976, 2349, 2637].forEach((f, i) => this.tone(f, t + i * 0.07, 0.22, { type: "sine", vol: 0.12 }));
        break;
      case "applause":
        for (let i = 0; i < 22; i++) {
          this.noise(t + i * 0.06 + Math.random() * 0.03, 0.16, 1500 + Math.random() * 2500, 900 + Math.random() * 900, 0.9, 0.16);
        }
        break;
      case "drum":
        this.tone(160, t, 0.3, { type: "sine", vol: 0.6, slideTo: 42 });
        break;
      case "badge":
        [659.25, 830.61, 987.77, 1318.5, 1661.2].forEach((f, i) => this.tone(f, t + i * 0.08, 0.3, { type: "triangle", vol: 0.18 }));
        break;

      case "alert": {
        // Attention-grabbing dual-tone siren + urgent beacon chime
        this.tone(520, t, 0.22, { type: "sawtooth", vol: 0.2, slideTo: 980 });
        this.tone(980, t + 0.22, 0.2, { type: "sawtooth", vol: 0.18, slideTo: 540 });
        this.tone(540, t + 0.42, 0.22, { type: "sawtooth", vol: 0.2, slideTo: 1046.5 });
        this.tone(1046.5, t + 0.65, 0.14, { type: "square", vol: 0.16 });
        this.tone(1318.5, t + 0.81, 0.28, { type: "triangle", vol: 0.26 });
        break;
      }

      case "building_L1": {
        // Building 1 – Vote Plaza: bouncy ballot-box xylophone chime + pop
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          this.tone(f, t + i * 0.08, 0.18, { type: "triangle", vol: 0.24 });
          this.tone(f * 2, t + i * 0.08, 0.1, { type: "sine", vol: 0.08 });
        });
        this.tone(360, t + 0.34, 0.14, { type: "sine", vol: 0.28, slideTo: 960 });
        break;
      }

      case "building_L2": {
        // Building 2 – Trivia Tower: royal castle brass fanfare + tower bell
        const fanfare: [number, number, number][] = [
          [392.0, 0, 0.11],
          [523.25, 0.11, 0.11],
          [659.25, 0.22, 0.14],
          [783.99, 0.37, 0.42],
        ];
        for (const [f, at, d] of fanfare) {
          this.tone(f, t + at, d, { type: "sawtooth", vol: 0.14 });
          this.tone(f * 0.5, t + at, d, { type: "triangle", vol: 0.18 });
        }
        this.tone(1567.98, t + 0.37, 0.55, { type: "sine", vol: 0.16 });
        break;
      }

      case "building_L3": {
        // Building 3 – Robo Lab: futuristic R2-style computer bleeps + robot servo sweep
        const roboNotes = [1180, 1640, 920, 1960, 1420, 2120];
        roboNotes.forEach((f, i) => {
          this.tone(f, t + i * 0.055, 0.06, { type: "square", vol: 0.13 });
        });
        this.tone(300, t + 0.35, 0.28, { type: "sawtooth", vol: 0.16, slideTo: 1120 });
        this.tone(880, t + 0.64, 0.18, { type: "triangle", vol: 0.22, slideTo: 1320 });
        break;
      }

      case "building_L4": {
        // Building 4 – Game Show Arena: big stage drum + glitzy show chord + crowd cheer
        this.tone(150, t, 0.22, { type: "sine", vol: 0.5, slideTo: 48 });
        [523.25, 659.25, 783.99, 987.77, 1046.5].forEach((f, i) => {
          this.tone(f, t + 0.08 + i * 0.04, 0.45, { type: "sawtooth", vol: 0.1 });
          this.tone(f, t + 0.08 + i * 0.04, 0.5, { type: "triangle", vol: 0.14 });
        });
        for (let i = 0; i < 8; i++) {
          this.noise(t + 0.18 + i * 0.045, 0.12, 1800 + i * 180, 1100, 0.9, 0.12);
        }
        break;
      }

      case "building_final": {
        // Building 5 – Classroom HQ: authentic ringing school bell (rapid metallic strikes)
        for (let i = 0; i < 7; i++) {
          const at = t + i * 0.065;
          this.tone(1174.66, at, 0.09, { type: "sine", vol: 0.22 });
          this.tone(1760.0, at, 0.07, { type: "triangle", vol: 0.14 });
          this.tone(2637.0, at, 0.05, { type: "square", vol: 0.06 });
        }
        this.tone(1174.66, t + 0.46, 0.45, { type: "sine", vol: 0.24 });
        break;
      }

      case "building_reflect": {
        // Building 6 – Idea Park: dreamy ascending harp glissando + lightbulb ping
        const harp = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1318.5, 1567.98];
        harp.forEach((f, i) => {
          this.tone(f, t + i * 0.05, 0.32, { type: "sine", vol: 0.16 });
        });
        this.tone(2637.02, t + 0.44, 0.5, { type: "triangle", vol: 0.22 });
        break;
      }
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const w = window as Window & { webkitAudioContext?: typeof AudioContext };
      const Ctor: typeof AudioContext | undefined = window.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(master);

      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.3;
      this.musicBus.connect(master);

      this.ctx = ctx;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, start: number, dur: number, opts: ToneOptions = {}): void {
    const ctx = this.ctx;
    const bus = opts.music ? this.musicBus : this.sfxBus;
    if (!ctx || !bus) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, start + dur);
    const peak = opts.vol ?? 0.2;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + (opts.attack ?? 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private noise(start: number, dur: number, freq: number, sweepTo: number, q: number, vol: number, music = false): void {
    const ctx = this.ctx;
    const bus = music ? this.musicBus : this.sfxBus;
    if (!ctx || !bus) return;
    if (!this.noiseBuffer) {
      const len = Math.floor(ctx.sampleRate * 1.5);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), start + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(start, Math.random() * 1.0, dur);
  }

  private startMusic(): void {
    if (!this.ctx || this.timer !== null || !this.musicOn) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
  }

  private stopMusic(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    // If the tab was throttled, jump forward instead of playing a burst of old notes.
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    const stepDur = 60 / BPM / 2;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const i = this.step % 16;
      const mel = MELODY[i];
      const bass = BASS[i];
      if (mel) this.tone(mel, this.nextTime, stepDur * 0.85, { type: "triangle", vol: 0.08, music: true });
      if (bass) this.tone(bass, this.nextTime, stepDur * 1.7, { type: "sine", vol: 0.16, music: true, attack: 0.02 });
      if (i % 2 === 1) this.noise(this.nextTime, 0.04, 7000, 6000, 1.2, 0.05, true);
      this.nextTime += stepDur;
      this.step += 1;
    }
  }
}

export const sound = new SoundEngine();
