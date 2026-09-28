// Audio synthesis helper for rich jungle & cartoon game sound effects using Web Audio API

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Button click / Pop sound
  playPop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Correct answer sound - joyful jungle chime chord
  playCorrect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const now = this.ctx.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // Audio fallback
    }
  }

  // Wrong answer sound - cute boing/buzz
  playWrong() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.28);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  // Level complete fanfare
  playLevelComplete() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.12 },
        { f: 1046.5, d: 0.35 },
        { f: 880.0, d: 0.15 },
        { f: 1046.5, d: 0.45 },
      ];

      let t = this.ctx.currentTime;
      melody.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.95;
      });
    } catch {
      // Audio fallback
    }
  }

  // Game complete fanfare
  playGrandWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const melody = [440, 554, 659, 880, 784, 880, 1108];
      let t = this.ctx.currentTime;
      melody.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);

        gain.gain.setValueAtTime(0.3, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 0.36);
      });
    } catch {
      // Audio fallback
    }
  }

  // Gentle jungle adventure background tune
  startBGM() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 261.63];
    let step = 0;

    const playNext = () => {
      if (!this.musicEnabled || !this.ctx || !this.isMusicPlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = notes[step % notes.length];
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.48);
        step++;
      } catch {
        // Audio fallback
      }
    };

    this.musicInterval = setInterval(playNext, 450);
  }

  stopBGM() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicEnabled;
  }

  toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const sound = new SoundEffects();
