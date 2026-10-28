// System Music Detector using Web Audio API + Microphone
// Detects real-time music playing through the phone's speakers without requiring Spotify

export interface DetectedMusicState {
  isListening: boolean;
  isAudioDetected: boolean;  // True when music/sound is actively playing
  decibels: number;          // Volume in dB (e.g. -60 to 0)
  bpm: number;               // Estimated beats per minute
  bassEnergy: number;        // 0..1 bass beat hit
  waveform: number[];        // 16 points for live visualizer wave
  frequencyBands: number[];  // 16 EQ bands
}

type Listener = (state: DetectedMusicState) => void;

class SystemMusicDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animId: number | null = null;
  private listeners: Set<Listener> = new Set();

  private isRunning: boolean = false;
  private beatHistory: number[] = [];
  private lastBeatTime: number = 0;
  private detectedBpm: number = 120;
  private silenceFrames: number = 0;

  private currentState: DetectedMusicState = {
    isListening: false,
    isAudioDetected: false,
    decibels: -60,
    bpm: 120,
    bassEnergy: 0,
    waveform: new Array(16).fill(0),
    frequencyBands: new Array(16).fill(0),
  };

  async start(): Promise<boolean> {
    if (this.isRunning) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.mediaStream = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.isRunning = true;
      this.loop();
      return true;
    } catch (err) {
      console.warn('System audio detector mic access error:', err);
      return false;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.analyser = null;

    this.updateState({
      isListening: false,
      isAudioDetected: false,
      decibels: -60,
      bassEnergy: 0,
      waveform: new Array(16).fill(0),
      frequencyBands: new Array(16).fill(0),
    });
  }

  toggle(): Promise<boolean> {
    if (this.isRunning) {
      this.stop();
      return Promise.resolve(false);
    } else {
      return this.start();
    }
  }

  isActive() {
    return this.isRunning;
  }

  getState() {
    return this.currentState;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<DetectedMusicState>) {
    this.currentState = { ...this.currentState, ...partial };
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentState);
      } catch {
        // ignore
      }
    });
  }

  private loop = () => {
    if (!this.isRunning || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount; // 64
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);

    // Compute RMS and Decibels
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    const db = rms > 0 ? Math.max(-60, Math.round(20 * Math.log10(rms))) : -60;

    // Check if audio is actively playing through the speaker
    const isPlaying = db > -45;
    if (!isPlaying) {
      this.silenceFrames++;
    } else {
      this.silenceFrames = 0;
    }
    const isAudioDetected = this.silenceFrames < 25; // Smooth debounce

    // 16 Frequency Bands
    const numBands = 16;
    const binsPerBand = Math.floor(bufferLength / numBands);
    const bands: number[] = [];
    let bassSum = 0;

    for (let i = 0; i < numBands; i++) {
      let bSum = 0;
      for (let j = 0; j < binsPerBand; j++) {
        const val = freqData[i * binsPerBand + j];
        bSum += val;
        if (i < 3) bassSum += val;
      }
      bands.push(Math.round((bSum / binsPerBand / 255) * 100));
    }

    const currentBass = Math.min(1.0, bassSum / (3 * binsPerBand * 255));

    // Beat / Tempo Tracking
    const now = performance.now();
    if (currentBass > 0.4 && now - this.lastBeatTime > 260) {
      const delta = now - this.lastBeatTime;
      this.lastBeatTime = now;
      if (delta > 300 && delta < 1200) {
        const instantBpm = Math.round(60000 / delta);
        this.beatHistory.push(instantBpm);
        if (this.beatHistory.length > 8) this.beatHistory.shift();
        this.detectedBpm = Math.round(
          this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length
        );
      }
    }

    // 16 Waveform points
    const wavePoints: number[] = [];
    const step = Math.floor(bufferLength / 16);
    for (let i = 0; i < 16; i++) {
      wavePoints.push(Math.round(((timeData[i * step] - 128) / 128) * 50));
    }

    this.updateState({
      isListening: true,
      isAudioDetected,
      decibels: db,
      bpm: this.detectedBpm,
      bassEnergy: currentBass,
      waveform: wavePoints,
      frequencyBands: bands,
    });

    this.animId = requestAnimationFrame(this.loop);
  };
}

export const systemMusicDetector = new SystemMusicDetector();
