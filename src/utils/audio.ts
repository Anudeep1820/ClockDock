// ClockDock Phase 3 — Offline Web Audio API Synthesizer
// Generates synthesized bedside alarm chimes and timer bells with 0 external network requests

class SoundEngine {
  private ctx: AudioContext | null = null;
  private alarmLoopTimer: number | null = null;
  private pendingTimeouts: Set<number> = new Set();
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        return this.ctx;
      }
    } catch {
      // AudioContext unavailable
    }
    return null;
  }

  // Pre-warms / unlocks the audio context on user interaction
  public unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  // Play a single harmonic chime (composed of fundamental + overtone)
  private playChimeTone(freq: number, durationSec: number = 0.8, delaySec: number = 0, volume: number = 0.3) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    try {
      const startTime = ctx.currentTime + delaySec;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Gentle attack and exponential decay for organic bell sound
      gain1.gain.setValueAtTime(0.001, startTime);
      gain1.gain.linearRampToValueAtTime(volume, startTime + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + durationSec + 0.05);

      // Shimmering overtone (octave + fifth)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, startTime);

      gain2.gain.setValueAtTime(0.001, startTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec * 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(startTime);
      osc2.stop(startTime + durationSec * 0.7 + 0.05);
    } catch {
      // Audio execution blocked or failed
    }
  }

  // Single melodic chime sequence (E5 -> G#5 -> B5 -> E6)
  public playMelodicArpeggio() {
    this.playChimeTone(659.25, 1.2, 0.0, 0.35); // E5
    this.playChimeTone(830.61, 1.2, 0.2, 0.35); // G#5
    this.playChimeTone(987.77, 1.2, 0.4, 0.35); // B5
    this.playChimeTone(1318.51, 1.8, 0.6, 0.40); // E6
  }

  // Timer complete chime (crisp double chime: A5 -> C#6)
  public playTimerComplete() {
    this.playChimeTone(880.0, 0.9, 0.0, 0.35);
    this.playChimeTone(1108.73, 1.4, 0.22, 0.4);
    // Secondary confirmation pulse after 700ms
    const timerId = window.setTimeout(() => {
      this.pendingTimeouts.delete(timerId);
      if (!this.isMuted) {
        this.playChimeTone(880.0, 0.9, 0.0, 0.35);
        this.playChimeTone(1108.73, 1.5, 0.22, 0.4);
      }
    }, 700);
    this.pendingTimeouts.add(timerId);
  }

  // Subtle tap sound for buttons/laps
  public playSubtleClick() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  // Starts continuous repeating alarm chime loop until stopAlarm() is called
  public startAlarmLoop() {
    this.stopAlarmLoop();
    this.playMelodicArpeggio();

    this.alarmLoopTimer = window.setInterval(() => {
      this.playMelodicArpeggio();
    }, 2800);
  }

  public stopAlarmLoop() {
    if (this.alarmLoopTimer !== null) {
      clearInterval(this.alarmLoopTimer);
      this.alarmLoopTimer = null;
    }
    this.pendingTimeouts.forEach((id) => clearTimeout(id));
    this.pendingTimeouts.clear();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarmLoop();
    }
  }
}

export const soundEngine = new SoundEngine();
