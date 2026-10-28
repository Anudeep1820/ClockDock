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
  Search,
  X,
  Link,
  Sparkles,
} from 'lucide-react';
import { liveMusicService, LiveTrack } from '../../utils/liveMusic';
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
  const [track, setTrack] = useState<LiveTrack>(liveMusicService.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(86);
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [bassPulse, setBassPulse] = useState(0);

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [spotifyTokenInput, setSpotifyTokenInput] = useState('');
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);

  // Subscribe to live music updates
  useEffect(() => {
    const unsub = liveMusicService.subscribe((newTrack) => {
      setTrack(newTrack);
      setIsPlaying(newTrack.isPlaying);
      setProgressSec(Math.floor(newTrack.progressMs / 1000));
    });
    return () => unsub();
  }, []);

  // Subscribe to live audio frequencies (microphone beat sync)
  useEffect(() => {
    const unsub = deviceAudioReactor.subscribe((data: AudioReactData) => {
      setBassPulse(data.bassLevel);
    });
    return () => unsub();
  }, []);

  // Progress timer increment when playing
  const totalSec = Math.max(30, Math.floor(track.durationMs / 1000));
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgressSec((prev) => (prev >= totalSec ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalSec]);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    liveMusicService.setTrack({ isPlaying: nextState });
  };

  const toggleMic = async () => {
    if (isLiveListening) {
      deviceAudioReactor.stopListening();
      setIsLiveListening(false);
    } else {
      const ok = await deviceAudioReactor.startListening();
      if (ok) setIsLiveListening(true);
    }
  };

  const handleSearchSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await liveMusicService.searchAndSetLiveTrack(searchQuery);
    setIsSearching(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingFormatted = `-${formatTime(Math.max(0, totalSec - progressSec))}`;
  const activeColor = nightMode ? nightHex : '#ffffff';

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-3 sm:p-6 select-none transition-all duration-300 ${
        isCompact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'
      }`}
    >
      <div className="w-full max-w-lg flex flex-row items-center gap-4 sm:gap-7">
        {/* Left: Album Artwork with beat reactive aura */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 shadow-2xl transition-transform duration-100 ease-out border border-white/10 cursor-pointer group"
          style={{
            transform: isLiveListening ? `scale(${1.0 + bassPulse * 0.12})` : 'scale(1)',
            boxShadow: nightMode
              ? `0 10px 40px ${nightHex}30`
              : '0 20px 50px rgba(0,0,0,0.8)',
          }}
          title="Click to search whatever song is playing on your phone"
        >
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Search Hint Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
            <Search className="w-4 h-4" />
            <span>Change</span>
          </div>
        </div>

        {/* Right: Live Title, Artist, Controls, Scrubber */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Track Header */}
          <div className="mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <h2
                onClick={() => setIsSearchOpen(true)}
                className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white truncate cursor-pointer hover:underline"
                style={{ color: activeColor }}
                title="Tap to change song"
              >
                {track.title}
              </h2>
            </div>
            <p
              className="text-xs sm:text-sm md:text-base font-medium text-zinc-400 truncate mt-0.5"
              style={{ color: nightMode ? `${nightHex}85` : undefined }}
            >
              {track.artist}
            </p>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
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
              onClick={togglePlay}
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

            {/* Mic Button: Dances to live speaker audio */}
            <button
              onClick={toggleMic}
              className={`ml-auto p-1.5 sm:p-2 rounded-full border transition-all ${
                isLiveListening
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
              title={isLiveListening ? 'Microphone beat sync active' : 'React to phone speaker music'}
            >
              {isLiveListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Scrubber Bar: 1:26 -----------o----------- -2:11 */}
          <div className="flex flex-col gap-1 mt-1 sm:mt-2">
            <div className="relative w-full h-1 sm:h-1.5 bg-white/15 rounded-full overflow-hidden cursor-pointer">
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
              <span>{remainingFormatted}</span>
            </div>
          </div>

          {/* Bottom subtle icons: Shuffle, Repeat, Spotify Badge, Search */}
          <div className="flex items-center justify-between text-zinc-500 text-[10px] sm:text-xs pt-2">
            <div className="flex items-center gap-3">
              <Shuffle className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
              <Repeat className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                title="Change Song"
              >
                <Search className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            {/* Spotify Brand Badge (Matching screenshot) */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1 font-semibold tracking-wider uppercase text-[10px] text-zinc-400 cursor-pointer hover:text-emerald-400 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Spotify</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH / LIVE SONG MATCHER MODAL */}
      {isSearchOpen && (
        <div
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Live Phone Song Matcher</h3>
                <p className="text-xs text-zinc-400">Search whatever song is playing on your phone</p>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Search Form */}
            <form onSubmit={handleSearchSong} className="flex gap-2">
              <input
                type="text"
                placeholder="Song or Artist (e.g. Birds, Starboy, Espresso)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Searching...' : 'Find'}</span>
              </button>
            </form>

            {/* Quick Popular Picks */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Picks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Birds Imagine Dragons',
                  'Starboy The Weeknd',
                  'Billie Jean Michael Jackson',
                  'Espresso Sabrina Carpenter',
                  'Not Like Us Kendrick Lamar',
                  'Midnight City M83',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={async () => {
                      setIsSearching(true);
                      await liveMusicService.searchAndSetLiveTrack(s);
                      setIsSearching(false);
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Spotify Web API Connect Accordion */}
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSpotifyInput((p) => !p)}
                className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 hover:underline"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Connect Live Spotify Token (Automatic Real-time Sync)</span>
              </button>

              {showSpotifyInput && (
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Paste your Spotify Access Token to auto-read the exact track & millisecond progress currently playing on your phone.
                  </p>
                  <input
                    type="password"
                    placeholder="Spotify Access Token"
                    value={spotifyTokenInput}
                    onChange={(e) => setSpotifyTokenInput(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (spotifyTokenInput) {
                        liveMusicService.setSpotifyToken(spotifyTokenInput);
                        setIsSearchOpen(false);
                      }
                    }}
                    className="py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400"
                  >
                    Connect Live Spotify
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
