import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Mic,
  MicOff,
  Music,
  Folder,
  Search,
  Radio,
  Sliders,
} from 'lucide-react';
import { systemMusicDetector, DetectedMusicState } from '../../utils/systemAudioDetector';
import { liveMusicService } from '../../utils/liveMusic';

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
  // Live Track State
  const [title, setTitle] = useState('Birds');
  const [artist, setArtist] = useState('Imagine Dragons');
  const [coverUrl, setCoverUrl] = useState(
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/b3/a409b307-e854-c81e-1f7c-f8319e782d49/18UMGIM76332.rgb.jpg/600x600bb.jpg'
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(86); // 1:26
  const totalSec = 217; // 3:37 -> -2:11

  // System Music Detector State
  const [detectorState, setDetectorState] = useState<DetectedMusicState>(
    systemMusicDetector.getState()
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search Dialog
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Subscribe to system music detector
  useEffect(() => {
    const unsub = systemMusicDetector.subscribe((st) => {
      setDetectorState(st);
      if (st.isListening) {
        setIsPlaying(st.isAudioDetected);
      }
    });
    return () => unsub();
  }, []);

  // Timer simulation when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgressSec((prev) => (prev >= totalSec ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleSystemDetector = async () => {
    if (detectorState.isListening) {
      systemMusicDetector.stop();
    } else {
      await systemMusicDetector.start();
    }
  };

  // Handle local song file chosen from user's phone files
  const handleLocalFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
      setArtist('Local Phone Music');
      // Create local object URL for instant preview
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio(objectUrl);
      audio.play().catch(() => {});
      setIsPlaying(true);
      setProgressSec(0);
    }
  };

  const handleSearchSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await liveMusicService.searchAndSetLiveTrack(searchQuery);
    const updated = liveMusicService.getCurrentTrack();
    setTitle(updated.title);
    setArtist(updated.artist);
    setCoverUrl(updated.coverUrl);
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
  const bassScale = 1.0 + (detectorState.isListening ? detectorState.bassEnergy * 0.15 : 0);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6 select-none transition-all duration-300 ${
        isCompact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleLocalFileChosen}
        className="hidden"
      />

      <div className="w-full max-w-xl flex flex-row items-center gap-3 sm:gap-6 md:gap-7">
        {/* LEFT: Big Square Album Art (Pulsing with System Detector) */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 shadow-2xl transition-transform duration-100 ease-out border border-white/10 cursor-pointer group"
          style={{
            transform: `scale(${bassScale})`,
            boxShadow: nightMode
              ? `0 10px 40px ${nightHex}35`
              : detectorState.isAudioDetected
              ? '0 20px 50px rgba(16, 185, 129, 0.4)'
              : '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}
          title="Click to search song or load file from phone"
        >
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay Detector Tag */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase flex items-center gap-1 border border-white/10">
            {detectorState.isListening ? (
              <>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    detectorState.isAudioDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span>{detectorState.isAudioDetected ? 'LIVE' : 'WAITING'}</span>
              </>
            ) : (
              <span>MUSIC</span>
            )}
          </div>
        </div>

        {/* RIGHT: Live Metadata, Scrubber, and Controls */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Track Title & Artist */}
          <div className="mb-1.5 sm:mb-2.5">
            <h2
              onClick={() => setIsSearchOpen(true)}
              className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate cursor-pointer hover:underline"
              style={{ color: activeColor }}
              title="Click to change track"
            >
              {title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p
                className="text-xs sm:text-sm font-medium text-zinc-400 truncate"
                style={{ color: nightMode ? `${nightHex}85` : undefined }}
              >
                {artist}
              </p>
              {detectorState.isListening && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                  {detectorState.bpm} BPM
                </span>
              )}
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next, System Detector Mic, Local File */}
          <div className="flex items-center gap-3 sm:gap-5 my-0.5 sm:my-1">
            <button
              onClick={() => setProgressSec(0)}
              className="p-1 sm:p-1.5 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              style={{ color: nightMode ? nightHex : undefined }}
              title="Previous"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 sm:p-2.5 rounded-full text-white hover:scale-110 active:scale-95 transition-transform"
              style={{ color: nightMode ? nightHex : '#ffffff' }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => setProgressSec(0)}
              className="p-1 sm:p-1.5 text-zinc-300 hover:text-white active:scale-90 transition-transform"
              style={{ color: nightMode ? nightHex : undefined }}
              title="Next"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            {/* System Music Detector Toggle */}
            <button
              onClick={toggleSystemDetector}
              className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                detectorState.isListening
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
              }`}
              title={
                detectorState.isListening
                  ? 'System Music Detector Active'
                  : 'Turn on System Music Detector to react to your phone audio'
              }
            >
              {detectorState.isListening ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">Listening</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Detect Music</span>
                </>
              )}
            </button>

            {/* Local Phone Music File Picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white transition-colors"
              title="Open song file from phone storage"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber Bar: 1:26 -----------o----------- -2:11 */}
          <div className="flex flex-col gap-1 mt-1 sm:mt-1.5">
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

          {/* Live EQ Dancing Spectrum Bars (when system detector is active) */}
          {detectorState.isListening && (
            <div className="flex items-end gap-1 h-3.5 mt-1.5">
              {detectorState.frequencyBands.map((b, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(15, b)}%`,
                    backgroundColor: nightMode ? nightHex : '#10b981',
                  }}
                />
              ))}
            </div>
          )}

          {/* Bottom subtle bar: Shuffle, Repeat, Change Song */}
          <div className="flex items-center justify-between text-zinc-500 text-[10px] sm:text-xs pt-1.5">
            <div className="flex items-center gap-3">
              <Shuffle className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
              <Repeat className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-colors" />
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[10px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>Change Song</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH / SONG MATCHER MODAL */}
      {isSearchOpen && (
        <div
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Song Playing on Phone</h3>
                <p className="text-xs text-zinc-400">Search any title or choose file from phone</p>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchSong} className="flex gap-2">
              <input
                type="text"
                placeholder="Type song title (e.g. Birds, Starboy, Espresso)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 shrink-0"
              >
                {isSearching ? '...' : 'Find'}
              </button>
            </form>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase text-zinc-500">Popular</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Birds Imagine Dragons',
                  'Starboy The Weeknd',
                  'Billie Jean Michael Jackson',
                  'Espresso Sabrina Carpenter',
                  'Not Like Us Kendrick Lamar',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={async () => {
                      setIsSearching(true);
                      await liveMusicService.searchAndSetLiveTrack(s);
                      const up = liveMusicService.getCurrentTrack();
                      setTitle(up.title);
                      setArtist(up.artist);
                      setCoverUrl(up.coverUrl);
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

            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800"
            >
              <Folder className="w-4 h-4" />
              <span>Choose Song from Phone Storage</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
