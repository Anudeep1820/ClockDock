// Real-time Device & Room Audio Reactivity Engine
// Uses Web Audio API AnalyserNode + getUserMedia to react to music playing from phone/speakers

export interface AudioReactData {
  frequencyBands: number[]; // 16 normalized frequency bands [0..100]
  bassLevel: number;        // 0..1 bass energy for beat pulsing
  isBeat: boolean;          // true when a kick/beat hits
  volume: number;           // 0..1 overall amplitude
}

type AudioCallback = (data: AudioReactData) => void;

class DeviceAudioReactor {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private listeners: Set<AudioCallback> = new Set();

  private isListening: boolean = false;
  private sensitivity: number = 1.4; // Sensitivity multiplier
  private bassHistory: number[] = [];
  private smoothBands: number[] = new Array(16).fill(0);

  public error: string | null = null;

  async startListening(): Promise<boolean> {
    if (this.isListening) return true;

    try {
      this.error = null;
      // Request audio stream from device (phone microphone / audio input)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.isListening = true;
      this.startLoop();
      return true;
    } catch (err: unknown) {
      console.warn('Microphone access denied or unavailable:', err);
      this.error = err instanceof Error ? err.message : 'Permission denied';
      this.isListening = false;
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
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

    // Reset bands
    this.smoothBands = new Array(16).fill(0);
    this.notify({
      frequencyBands: this.smoothBands,
      bassLevel: 0,
      isBeat: false,
      volume: 0,
    });
  }

  setSensitivity(val: number) {
    this.sensitivity = Math.max(0.5, Math.min(3.0, val));
  }

  getSensitivity() {
    return this.sensitivity;
  }

  isActive() {
    return this.isListening;
  }

  subscribe(callback: AudioCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(data: AudioReactData) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch {
        // ignore
      }
    });
  }

  private startLoop() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount; // 64
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Group 64 bins into 16 visualizer bands
      const numBands = 16;
      const binsPerBand = Math.floor(bufferLength / numBands);
      const rawBands: number[] = [];

      let totalSum = 0;
      let bassSum = 0;

      for (let i = 0; i < numBands; i++) {
        let bandSum = 0;
        for (let j = 0; j < binsPerBand; j++) {
          const val = dataArray[i * binsPerBand + j];
          bandSum += val;
          totalSum += val;
          if (i < 3) {
            bassSum += val; // First 3 bands = sub-bass & bass
          }
        }
        const avg = bandSum / binsPerBand;
        // Normalize 0..100 with sensitivity
        const scaled = Math.min(100, (avg / 255) * 100 * this.sensitivity);
        rawBands.push(scaled);
      }

      // Smooth decay physics
      for (let i = 0; i < numBands; i++) {
        if (rawBands[i] > this.smoothBands[i]) {
          this.smoothBands[i] = rawBands[i]; // Immediate jump on hit
        } else {
          this.smoothBands[i] = Math.max(0, this.smoothBands[i] - 3.8); // Gentle falloff
        }
      }

      // Bass energy & Beat Detection
      const currentBass = Math.min(1.0, (bassSum / (3 * binsPerBand * 255)) * this.sensitivity);
      this.bassHistory.push(currentBass);
      if (this.bassHistory.length > 30) this.bassHistory.shift();

      const avgBass =
        this.bassHistory.reduce((a, b) => a + b, 0) / (this.bassHistory.length || 1);
      const isBeat = currentBass > avgBass * 1.35 && currentBass > 0.25;

      const overallVolume = Math.min(1.0, (totalSum / (bufferLength * 255)) * this.sensitivity);

      this.notify({
        frequencyBands: [...this.smoothBands],
        bassLevel: currentBass,
        isBeat,
        volume: overallVolume,
      });

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }
}

export const deviceAudioReactor = new DeviceAudioReactor();
