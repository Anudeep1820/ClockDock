// Web Audio API ambient sleep sounds & alarm generator

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private currentGain: GainNode | null = null;
  private lofiInterval: number | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  stopAll() {
    if (this.currentSource) {
      try {
        if ('stop' in this.currentSource && typeof (this.currentSource as AudioScheduledSourceNode).stop === 'function') {
          (this.currentSource as AudioScheduledSourceNode).stop();
        }
        this.currentSource.disconnect();
      } catch {
        // ignore
      }
      this.currentSource = null;
    }
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
  }

  playRain(volume: number = 0.5) {
    this.stopAll();
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to simulate soft raindrops on window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    this.currentSource = noise;
    this.currentGain = gainNode;
  }

  playWaves(volume: number = 0.5) {
    this.stopAll();
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise for deep ocean roll
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);

    // LFO modulator for wave ebb and flow
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    lfo.start();
    this.currentSource = noise;
    this.currentGain = gainNode;
  }

  playCampfire(volume: number = 0.5) {
    this.stopAll();
    const ctx = this.initCtx();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Crackle pops + gentle hiss
      const pop = Math.random() > 0.999 ? (Math.random() - 0.5) * 2 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.05 + pop * 0.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    this.currentSource = noise;
    this.currentGain = gainNode;
  }

  playLofiTune(onBeat?: (val: number) => void) {
    this.stopAll();
    const ctx = this.initCtx();

    // Pentatonic dreamy chords: Cmaj7, Am7, Fmaj7, G7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C E G B
      [220.00, 261.63, 329.63, 392.00], // A C E G
      [174.61, 220.00, 261.63, 329.63], // F A C E
      [196.00, 246.94, 293.66, 349.23], // G B D F
    ];
    let step = 0;

    const playChord = () => {
      if (this.isMuted) return;
      const currentChord = chords[step % chords.length];
      step++;

      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft ADSR envelope for warm vinyl EP tone
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + 2.4);
      });

      if (onBeat) onBeat(1);
    };

    playChord();
    this.lofiInterval = window.setInterval(playChord, 2200);
  }

  playAlarmChime() {
    const ctx = this.initCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.6);
    });
  }

  setVolume(vol: number) {
    if (this.currentGain && this.ctx) {
      this.currentGain.gain.setValueAtTime(vol * 0.5, this.ctx.currentTime);
    }
  }
}

export const soundEngine = new AmbientSoundEngine();
