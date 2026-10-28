import React, { useState, useEffect, useRef } from 'react';
import { ClockFace, NightTint } from './types';
import { PALETTES, NIGHT_TINTS } from './utils/themes';
import { ClockBigBold } from './components/ClockBigBold';
import { ClockRetroFlip } from './components/ClockRetroFlip';
import { ClockAnalog } from './components/ClockAnalog';
import { ClockNeonSlice } from './components/ClockNeonSlice';
import { ClockNightGlow } from './components/ClockNightGlow';
import { DualWidgetStandby } from './components/DualWidgetStandby';
import { UnifiedSettingsModal } from './components/UnifiedSettingsModal';
import { Settings, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Current Time State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Clock Face
  const [currentFace, setCurrentFace] = useState<ClockFace>('standby-dual');
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Settings
  const [is24Hour, setIs24Hour] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [activeTint, setActiveTint] = useState<NightTint>('crimson');
  const [dimLevel, setDimLevel] = useState(1.0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Controls Visibility (Auto-fade on idle so screen is pure clean)
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);
  const wakeLockSentinel = useRef<unknown>(null);

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls for pure clean bedside view
  const handleUserActivity = () => {
    setControlsVisible(true);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3500);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'n' || e.key === 'N') setNightMode((prev) => !prev);
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 's' || e.key === 'S') setIsSettingsOpen((prev) => !prev);
      else if (e.key === '1') setCurrentFace('standby-dual');
      else if (e.key === '2') setCurrentFace('big-bold');
      else if (e.key === '3') setCurrentFace('retro-flip');
      else if (e.key === '4') setCurrentFace('minimal-analog');
      else if (e.key === '5') setCurrentFace('neon-slice');
      else if (e.key === '6') setCurrentFace('night-glow');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Screen Wake Lock API (keeps screen awake while on dock)
  const toggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      if (wakeLockActive && wakeLockSentinel.current) {
        try {
          const s = wakeLockSentinel.current as { release: () => Promise<void> };
          await s.release();
          wakeLockSentinel.current = null;
          setWakeLockActive(false);
        } catch {
          // ignore
        }
      } else {
        try {
          const sentinel = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }).wakeLock.request('screen');
          wakeLockSentinel.current = sentinel;
          setWakeLockActive(true);
        } catch {
          setWakeLockActive(false);
        }
      }
    } else {
      setWakeLockActive(!wakeLockActive);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentPalette = PALETTES[paletteIndex % PALETTES.length];
  const activeTintHex = NIGHT_TINTS.find((t) => t.id === activeTint)?.hex || '#ef4444';

  const cyclePalette = () => {
    setPaletteIndex((prev) => (prev + 1) % PALETTES.length);
  };

  return (
    <div
      className="relative w-screen h-[100dvh] overflow-hidden bg-black select-none flex flex-col justify-center items-center m-0 p-0"
      style={{
        filter: `brightness(${dimLevel})`,
        transition: 'filter 0.3s ease',
      }}
    >
      {/* SINGLE SUBTLE CORNER SETTINGS BUTTON (Fades out when inactive for 100% clean screen) */}
      <div
        className={`fixed top-3 right-3 sm:top-5 sm:right-5 z-40 transition-all duration-700 ${
          controlsVisible ? 'opacity-100' : 'opacity-20 hover:opacity-100'
        }`}
      >
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 sm:p-2.5 rounded-full bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl"
          title="Open Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Subtle Palette Quick-Switcher (Bottom right corner hint) */}
      <div
        className={`fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 transition-all duration-700 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={cyclePalette}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all"
          title="Switch Color Theme"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </div>

      {/* MAIN CLOCK & MUSIC STAGE (Auto-scales to any phone screen in Portrait or Landscape) */}
      <main className="w-full h-full flex items-center justify-center overflow-hidden">
        {currentFace === 'standby-dual' && (
          <DualWidgetStandby
            time={currentTime}
            palette={currentPalette}
            nightMode={nightMode}
            nightHex={activeTintHex}
            is24Hour={is24Hour}
          />
        )}

        {currentFace === 'big-bold' && (
          <ClockBigBold
            time={currentTime}
            palette={currentPalette}
            is24Hour={is24Hour}
            nightMode={nightMode}
            nightHex={activeTintHex}
            onCyclePalette={cyclePalette}
          />
        )}

        {currentFace === 'retro-flip' && (
          <ClockRetroFlip
            time={currentTime}
            nightMode={nightMode}
            nightHex={activeTintHex}
            is24Hour={is24Hour}
          />
        )}

        {currentFace === 'minimal-analog' && (
          <ClockAnalog
            time={currentTime}
            nightMode={nightMode}
            nightHex={activeTintHex}
          />
        )}

        {currentFace === 'neon-slice' && (
          <ClockNeonSlice
            time={currentTime}
            nightMode={nightMode}
            nightHex={activeTintHex}
            is24Hour={is24Hour}
          />
        )}

        {currentFace === 'night-glow' && (
          <ClockNightGlow
            time={currentTime}
            nightMode={nightMode}
            nightHex={activeTintHex}
            is24Hour={is24Hour}
          />
        )}
      </main>

      {/* SINGLE UNIFIED SETTINGS MODAL */}
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentFace={currentFace}
        onChangeFace={setCurrentFace}
        nightMode={nightMode}
        onToggleNightMode={() => setNightMode((p) => !p)}
        activeTint={activeTint}
        onSelectTint={setActiveTint}
        dimLevel={dimLevel}
        onChangeDim={setDimLevel}
        is24Hour={is24Hour}
        onToggle24Hour={() => setIs24Hour((p) => !p)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        wakeLockActive={wakeLockActive}
        onToggleWakeLock={toggleWakeLock}
      />
    </div>
  );
};

export default App;
