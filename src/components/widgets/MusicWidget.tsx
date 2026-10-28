import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Mic,
  MicOff,
  Edit3,
  Check,
} from 'lucide-react';
import { deviceAudioReactor, AudioReactData } from '../../utils/audioVisualizer';

interface MusicWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
  isCompact?: boolean;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
  isCompact = false,
}) => {
  // Track info - defaults to user's screenshot "Birds by Imagine Dragons"
  const [title, setTitle] = useState('Birds');
  const [artist, setArtist] = useState('Imagine Dragons');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop'
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [progressSec, setProgressSec] = useState(86); // 1:26
  const totalSec = 217; // 3:37 -> remaining 2:11 (-2:11)

  // Audio reactivity from phone speaker / room
  const [bassPulse, setBassPulse] = useState(0);

  // Hook into MediaSession API if available
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler?.('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler?.('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler?.('previoustrack', () => {
        setProgressSec(0);
      });
      navigator.mediaSession.setActionHandler?.('nexttrack', () => {
        setProgressSec(0);
      });
    }
  }, []);

  // Listen to device music frequencies if mic enabled
  useEffect(() => {
    const unsub = deviceAudioReactor.subscribe((data: AudioReactData) => {
      setBassPulse(data.bassLevel);
    });
    return () => unsub();
  }, []);

  // Progress timer simulation while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgressSec((prev) => (prev >= totalSec ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleLiveMic = async () => {
    if (isLiveListening) {
      deviceAudioReactor.stopListening();
      setIsLiveListening(false);
    } else {
      const ok = await deviceAudioReactor.startListening();
      if (ok) setIsLiveListening(true);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingTime = `-${formatTime(totalSec - progressSec)}`;

  const activeColor = nightMode ? nightHex : '#ffffff';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-3 sm:p-6 select-none transition-all duration-300 ${
        isCompact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'
      }`}
    >
      <div className="w-full max-w-lg flex flex-row items-center gap-4 sm:gap-7">
        {/* Left: Big Rounded Square Album Artwork (Exact match for screenshot) */}
        <div
          className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 shadow-2xl transition-transform duration-100 ease-out border border-white/10"
          style={{
            transform: isLiveListening ? `scale(${1.0 + bassPulse * 0.12})` : 'scale(1)',
            boxShadow: nightMode
              ? `0 10px 40px ${nightHex}30`
              : '0 20px 50px rgba(0,0,0,0.8)',
          }}
        >
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Quick Change Cover overlay */}
          <button
            onClick={() => setIsEditing((p) => !p)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/70 hover:text-white backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity"
            title="Edit Track Info"
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Metadata, Controls, and Scrub Bar (Exact match for screenshot) */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Track Title & Artist */}
          {isEditing ? (
            <div className="flex flex-col gap-1 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title"
                className="bg-zinc-800 text-white text-sm font-bold px-2 py-1 rounded"
              />
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded"
              />
            </div>
          ) : (
            <div className="mb-2 sm:mb-3">
              <h2
                className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white truncate"
                style={{ color: activeColor }}
              >
                {title}
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base font-medium text-zinc-400 truncate mt-0.5"
                style={{ color: nightMode ? `${nightHex}85` : undefined }}
              >
                {artist}
              </p>
            </div>
          )}

          {/* Playback Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-4 sm:gap-6 my-1">
            <button
              onClick={() => setProgressSec(0)}
              className="p-1.5 sm:p-2 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              style={{ color: nightMode ? nightHex : undefined }}
              title="Previous"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2.5 sm:p-3 rounded-full text-white hover:scale-110 active:scale-95 transition-transform"
              style={{ color: nightMode ? nightHex : '#ffffff' }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => setProgressSec(0)}
              className="p-1.5 sm:p-2 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              style={{ color: nightMode ? nightHex : undefined }}
              title="Next"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            {/* Live Mic Reactivity Toggle */}
            <button
              onClick={toggleLiveMic}
              className={`ml-auto p-1.5 sm:p-2 rounded-full border transition-all ${
                isLiveListening
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
              title={isLiveListening ? 'Microphone beat sync active' : 'Sync to phone speaker'}
            >
              {isLiveListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Scrubber Bar: 1:26 -----------o----------- -2:11 */}
          <div className="flex flex-col gap-1 mt-1 sm:mt-2">
            <div className="relative w-full h-1 sm:h-1.5 bg-white/15 rounded-full overflow-hidden cursor-pointer group">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(progressSec / totalSec) * 100}%`,
                  backgroundColor: nightMode ? nightHex : '#ffffff',
                  boxShadow: nightMode ? `0 0 10px ${nightHex}` : 'none',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs font-mono text-zinc-500">
              <span>{formatTime(progressSec)}</span>
              <span>{remainingTime}</span>
            </div>
          </div>

          {/* Bottom subtle icons: Shuffle, Repeat, Spotify Badge */}
          <div className="flex items-center justify-between text-zinc-500 text-[10px] sm:text-xs pt-2">
            <div className="flex items-center gap-3">
              <Shuffle className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
              <Repeat className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
            </div>

            {/* Spotify Brand Badge (as seen in screenshot) */}
            <div className="flex items-center gap-1 font-semibold tracking-wider uppercase text-[10px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Spotify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
