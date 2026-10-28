import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Disc } from 'lucide-react';
import { SoundTrack } from '../../types';
import { soundEngine } from '../../utils/audio';

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
    title: 'Midnight Rain Lofi',
    artist: 'ClockDock Chill',
    album: 'Bedside Sessions',
    duration: 180,
    color: '#ec4899',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop',
  },
];

interface MusicWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(42);
  const [volume, setVolume] = useState(0.7);
  const [bars, setBars] = useState([30, 60, 45, 80, 20, 90, 50, 70]);

  const currentTrack = TRACKS[trackIndex];

  // Visualizer animated bars
  useEffect(() => {
    if (!isPlaying) {
      setBars([10, 15, 12, 10, 14, 10, 12, 10]);
      return;
    }
    const interval = setInterval(() => {
      setBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
      setProgress((prev) => (prev >= currentTrack.duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  const togglePlay = () => {
    if (isPlaying) {
      soundEngine.stopAll();
      setIsPlaying(false);
    } else {
      soundEngine.playLofiTune();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
    if (isPlaying) {
      soundEngine.playLofiTune();
    }
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
    if (isPlaying) {
      soundEngine.playLofiTune();
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const activeColor = nightMode ? nightHex : '#ffffff';

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full p-4 sm:p-6 rounded-3xl backdrop-blur-xl border select-none transition-all duration-300"
      style={{
        backgroundColor: nightMode ? `${nightHex}10` : 'rgba(18, 18, 22, 0.75)',
        borderColor: nightMode ? `${nightHex}35` : 'rgba(255, 255, 255, 0.1)',
        boxShadow: nightMode
          ? `0 15px 35px ${nightHex}15`
          : '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top Header: Album Art & Title */}
      <div className="flex items-center gap-4">
        {/* Album Artwork with subtle glow */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-xl border border-white/10 group">
          <img
            src={currentTrack.cover}
            alt={currentTrack.album}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Disc className="w-6 h-6 animate-spin text-white/90" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col overflow-hidden">
          <span
            className="text-[11px] font-bold uppercase tracking-wider opacity-60 truncate"
            style={{ color: activeColor }}
          >
            {currentTrack.album}
          </span>
          <h3
            className="text-base sm:text-lg font-black truncate tracking-tight mt-0.5"
            style={{ color: activeColor }}
          >
            {currentTrack.title}
          </h3>
          <p
            className="text-xs sm:text-sm font-medium opacity-75 truncate"
            style={{ color: activeColor }}
          >
            {currentTrack.artist}
          </p>
        </div>

        {/* Visualizer bars in corner */}
        <div className="ml-auto flex items-end gap-1 h-8 shrink-0">
          {bars.map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: `${height}%`,
                backgroundColor: nightMode ? nightHex : currentTrack.color,
                boxShadow: `0 0 8px ${nightMode ? nightHex : currentTrack.color}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Center: Interactive Scrubber */}
      <div className="my-3 flex flex-col gap-1.5">
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${(progress / currentTrack.duration) * 100}%`,
              backgroundColor: nightMode ? nightHex : currentTrack.color,
              boxShadow: `0 0 10px ${nightMode ? nightHex : currentTrack.color}`,
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatSec(progress)}</span>
          <span>{formatSec(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Bottom Controls: Prev, Play, Next, Volume */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
            style={{ color: nightMode ? nightHex : undefined }}
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 sm:p-3.5 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center"
            style={{
              backgroundColor: nightMode ? nightHex : '#ffffff',
              color: nightMode ? '#000000' : '#000000',
              boxShadow: `0 0 20px ${nightMode ? `${nightHex}70` : 'rgba(255,255,255,0.4)'}`,
            }}
            title={isPlaying ? 'Pause' : 'Play Chill Beats'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
            style={{ color: nightMode ? nightHex : undefined }}
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              soundEngine.setVolume(val);
            }}
            className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};
