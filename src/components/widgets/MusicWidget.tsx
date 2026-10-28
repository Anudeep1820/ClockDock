import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Mic,
  MicOff,
  Sliders,
  Sparkles,
  Disc,
} from 'lucide-react';
import { SoundTrack } from '../../types';
import { soundEngine } from '../../utils/audio';
import { deviceAudioReactor, AudioReactData } from '../../utils/audioVisualizer';

const TRACKS: SoundTrack[] = [
  {
    id: '1',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    album: 'THIS IS IT',
    duration: 294,
    color: '#3b82f6',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Birds',
    artist: 'Imagine Dragons',
    album: 'Origins (Deluxe)',
    duration: 219,
    color: '#10b981',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Midnight Lo-Fi Chill',
    artist: 'ClockDock Bedside',
    album: 'Sleep Sessions',
    duration: 180,
    color: '#ec4899',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
  },
];

interface MusicWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
  onAudioBeat?: (bass: number) => void;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
  onAudioBeat,
}) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlayingLofi, setIsPlayingLofi] = useState(false);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState(1.4);
  const [showSettings, setShowSettings] = useState(false);

  // Live frequency bands (16 bands) & beat energy
  const [frequencyBars, setFrequencyBars] = useState<number[]>(new Array(16).fill(6));
  const [bassScale, setBassScale] = useState(1.0);
  const [isBeatActive, setIsBeatActive] = useState(false);

  const currentTrack = TRACKS[trackIndex];
  const activeColor = nightMode ? nightHex : '#ffffff';

  // Subscribe to live device audio reactivity
  useEffect(() => {
    const unsubscribe = deviceAudioReactor.subscribe((data: AudioReactData) => {
      setFrequencyBars(data.frequencyBands);
      const scale = 1.0 + data.bassLevel * 0.22;
      setBassScale(scale);
      setIsBeatActive(data.isBeat);
      if (onAudioBeat) {
        onAudioBeat(data.bassLevel);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onAudioBeat]);

  // Fallback animation when Lofi is playing and live mic is off
  useEffect(() => {
    if (isLiveListening) return; // Live mic overrides synthetic animation

    if (!isPlayingLofi) {
      setFrequencyBars(new Array(16).fill(6));
      setBassScale(1.0);
      return;
    }

    const interval = setInterval(() => {
      setFrequencyBars(
        Array.from({ length: 16 }, (_, i) => {
          // Subtle curve with higher bass in lower indices
          const base = i < 4 ? 40 : 20;
          return Math.floor(Math.random() * 60) + base;
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlayingLofi, isLiveListening]);

  // Toggle Live Microphone Listening to Device Music
  const toggleLiveListening = async () => {
    if (isLiveListening) {
      deviceAudioReactor.stopListening();
      setIsLiveListening(false);
    } else {
      setMicPermissionError(null);
      // Stop synthetic lofi so it listens cleanly to external phone/device audio
      if (isPlayingLofi) {
        soundEngine.stopAll();
        setIsPlayingLofi(false);
      }
      const success = await deviceAudioReactor.startListening();
      if (success) {
        setIsLiveListening(true);
      } else {
        setMicPermissionError(
          deviceAudioReactor.error || 'Mic permission required to react to device music'
        );
      }
    }
  };

  // Toggle Built-in Chill Lo-fi
  const toggleLofi = () => {
    if (isPlayingLofi) {
      soundEngine.stopAll();
      setIsPlayingLofi(false);
    } else {
      if (isLiveListening) {
        deviceAudioReactor.stopListening();
        setIsLiveListening(false);
      }
      soundEngine.playLofiTune();
      setIsPlayingLofi(true);
    }
  };

  const handleNext = () => setTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const handlePrev = () => setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full p-4 sm:p-6 rounded-3xl backdrop-blur-xl border select-none transition-all duration-300"
      style={{
        backgroundColor: nightMode ? `${nightHex}10` : 'rgba(18, 18, 22, 0.85)',
        borderColor: isBeatActive && isLiveListening
          ? nightMode ? nightHex : currentTrack.color
          : nightMode ? `${nightHex}35` : 'rgba(255, 255, 255, 0.12)',
        boxShadow: isBeatActive && isLiveListening
          ? `0 0 35px ${nightMode ? `${nightHex}40` : `${currentTrack.color}35`}`
          : nightMode ? `0 15px 35px ${nightHex}15` : '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top Header: React Mode Badge & Status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {/* Live Audio indicator */}
          <button
            onClick={toggleLiveListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isLiveListening
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-white/10 text-zinc-300 hover:text-white border border-white/10'
            }`}
            title="Listen and react to music playing from your phone or device"
          >
            {isLiveListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Mic className="w-3.5 h-3.5" />
                <span>Reacting to Music</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-zinc-400" />
                <span>Listen to Device Music</span>
              </>
            )}
          </button>
        </div>

        {/* Sensitivity & Settings toggle */}
        <button
          onClick={() => setShowSettings((p) => !p)}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Visualizer Sensitivity"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Permission alert error message if mic denied */}
      {micPermissionError && (
        <div className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-xl p-2 my-1">
          ⚠️ {micPermissionError} (allow microphone access when prompted)
        </div>
      )}

      {/* Sensitivity Slider Drawer */}
      {showSettings && (
        <div className="my-2 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs animate-fadeIn">
          <span className="text-zinc-400 font-medium">Reactivity Sensitivity:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.6"
              max="2.5"
              step="0.1"
              value={sensitivity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSensitivity(val);
                deviceAudioReactor.setSensitivity(val);
              }}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="font-mono text-zinc-300 w-8 text-right">{sensitivity}x</span>
          </div>
        </div>
      )}

      {/* Center: Album Artwork + Pulse + Live Info */}
      <div className="flex items-center gap-4 my-auto">
        {/* Pulsing Bass Artwork */}
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/15 transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${bassScale})`,
            boxShadow: isLiveListening || isPlayingLofi
              ? `0 0 25px ${nightMode ? nightHex : currentTrack.color}`
              : 'none',
          }}
        >
          <img
            src={currentTrack.cover}
            alt={currentTrack.album}
            className="w-full h-full object-cover"
          />
          {(isLiveListening || isPlayingLofi) && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Disc
                className={`w-7 h-7 text-white/90 ${
                  isLiveListening ? 'animate-spin' : isPlayingLofi ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              />
            </div>
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex flex-col overflow-hidden min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider opacity-60 truncate"
              style={{ color: activeColor }}
            >
              {isLiveListening ? 'Live Device Audio' : currentTrack.album}
            </span>
            {isLiveListening && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <h3
            className="text-base sm:text-lg font-black truncate tracking-tight mt-0.5"
            style={{ color: activeColor }}
          >
            {isLiveListening ? 'Playing on Device' : currentTrack.title}
          </h3>
          <p
            className="text-xs sm:text-sm font-medium opacity-75 truncate"
            style={{ color: activeColor }}
          >
            {isLiveListening ? 'Frequency reactive' : currentTrack.artist}
          </p>
        </div>
      </div>

      {/* 16-Band Live Frequency Spectrum Analyzer */}
      <div className="my-2 flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-14 sm:h-16 px-1">
          {frequencyBars.map((height, i) => {
            const isBass = i < 4;
            const barColor = nightMode
              ? nightHex
              : isBass
              ? currentTrack.color
              : '#38bdf8';

            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-75 min-h-[4px]"
                style={{
                  height: `${Math.max(6, Math.min(100, height))}%`,
                  backgroundColor: barColor,
                  boxShadow: height > 40
                    ? `0 0 10px ${barColor}`
                    : 'none',
                  opacity: Math.max(0.4, height / 100),
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase px-1">
          <span>Sub Bass</span>
          <span>Mids</span>
          <span>Treble</span>
        </div>
      </div>

      {/* Bottom Controls: Switch Track / Lo-fi Play / Next */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Optional built-in Lo-Fi toggle */}
          <button
            onClick={toggleLofi}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPlayingLofi
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Play / Pause synthetic relaxing beats"
          >
            {isPlayingLofi ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Lo-Fi</span>
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Audio Reactivity Mode Pill */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isLiveListening ? 'Reacting live' : 'Tap mic to react'}</span>
        </div>
      </div>
    </div>
  );
};
