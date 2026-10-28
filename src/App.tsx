import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings, ClockFaceId } from './types';
import { loadSettings, saveSettings, resetSettings } from './utils/storage';
import {
  getColor,
  getTypography,
  CLOCK_COLORS,
  CLOCK_FACES,
} from './utils/themes';
import { StandByDigital } from './components/faces/StandByDigital';
import { MinimalAnalog } from './components/faces/MinimalAnalog';
import { RetroFlip } from './components/faces/RetroFlip';
import { AmbientGlow } from './components/faces/AmbientGlow';
import { NeonCyber } from './components/faces/NeonCyber';
import { PremiumEditorial } from './components/faces/PremiumEditorial';
import { AuroraDigital } from './components/faces/AuroraDigital';
import { ModernWorldClock } from './components/faces/ModernWorldClock';
import { MatrixMinimal } from './components/faces/MatrixMinimal';
import { BackgroundStudio } from './components/BackgroundStudio';
import { SettingsSheet } from './components/SettingsSheet';
import { Settings, Maximize2, Minimize2, Zap, RotateCw } from 'lucide-react';

const ALL_FACES: ClockFaceId[] = [
  'standby-digital',
  'minimal-analog',
  'retro-flip',
  'ambient-glow',
  'neon-cyber',
  'premium-editorial',
  'aurora-digital',
  'modern-world',
  'matrix-minimal',
];

export const App: React.FC = () => {
  // 1. Settings state (loaded & persisted to localStorage)
  const [settings, setSettings] = useState<ClockSettings>(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 2. High-precision live time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 3. Immersive control visibility (auto-hides on idle)
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimerRef = useRef<number | null>(null);

  // 4. Fullscreen & Wake Lock state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinel = useRef<unknown>(null);

  // 5. Touch swipe handling for horizontal face switching
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Update and persist settings
  const handleUpdateSettings = useCallback((partial: Partial<ClockSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleResetSettings = useCallback(() => {
    const fresh = resetSettings();
    setSettings(fresh);
  }, []);

  // Live Clock Tick & Visibility Change recovery
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setCurrentTime(new Date());
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Refresh immediately when returning from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setCurrentTime(new Date());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Idle Activity Detector (fades controls after 3.5s)
  const reportActivity = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', reportActivity);
    window.addEventListener('touchstart', reportActivity, { passive: true });
    window.addEventListener('keydown', reportActivity);

    idleTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3500);

    return () => {
      window.removeEventListener('mousemove', reportActivity);
      window.removeEventListener('touchstart', reportActivity);
      window.removeEventListener('keydown', reportActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [reportActivity]);

  // Touch Swipe to switch faces (iOS StandBy behavior)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum swipe threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = ALL_FACES.indexOf(settings.face);

      if (deltaX < 0) {
        // Swiped Left -> Next face
        const nextIndex = (currentIndex + 1) % ALL_FACES.length;
        handleUpdateSettings({ face: ALL_FACES[nextIndex] });
      } else {
        // Swiped Right -> Prev face
        const prevIndex = (currentIndex - 1 + ALL_FACES.length) % ALL_FACES.length;
        handleUpdateSettings({ face: ALL_FACES[prevIndex] });
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Screen Wake Lock API (keeps bedside display on while plugged in)
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
          const sentinel = await (
            navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }
          ).wakeLock.request('screen');
          wakeLockSentinel.current = sentinel;
          setWakeLockActive(true);
        } catch {
          setWakeLockActive(false);
        }
      }
    } else {
      setWakeLockActive((prev) => !prev);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      try {
        (screen.orientation as unknown as { lock: (orientation: string) => Promise<void> })
          ?.lock?.('landscape')
          .catch(() => {});
      } catch {
        // ignore
      }
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Cycle accent color with 1 tap on the clock
  const cycleColor = useCallback(() => {
    const currentIndex = CLOCK_COLORS.findIndex((c) => c.id === settings.clockColor);
    const nextIndex = (currentIndex + 1) % CLOCK_COLORS.length;
    handleUpdateSettings({ clockColor: CLOCK_COLORS[nextIndex].id });
  }, [settings.clockColor, handleUpdateSettings]);

  // Keyboard Shortcuts (1-9 for face direct jumps, Arrows to cycle, S for settings, F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 's' || e.key === 'S') setIsSettingsOpen((p) => !p);
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'n' || e.key === 'N') {
        handleUpdateSettings({
          clockColor: settings.clockColor === 'crimson' ? 'warm-white' : 'crimson',
        });
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        if (index < ALL_FACES.length) {
          handleUpdateSettings({ face: ALL_FACES[index] });
        }
      } else if (e.key === 'ArrowRight') {
        const next = (ALL_FACES.indexOf(settings.face) + 1) % ALL_FACES.length;
        handleUpdateSettings({ face: ALL_FACES[next] });
      } else if (e.key === 'ArrowLeft') {
        const prev = (ALL_FACES.indexOf(settings.face) - 1 + ALL_FACES.length) % ALL_FACES.length;
        handleUpdateSettings({ face: ALL_FACES[prev] });
      } else if (e.key === ' ') {
        cycleColor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.clockColor, settings.face, handleUpdateSettings, cycleColor]);

  const activeColor = getColor(settings.clockColor);
  const activeTypography = getTypography(settings.fontStyle);

  return (
    <div
      className="relative w-screen h-[100dvh] overflow-hidden select-none flex items-center justify-center bg-black"
      style={{
        filter: `brightness(${settings.dimmer})`,
        transition: 'filter 0.3s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. ANIMATED BACKGROUND STUDIO LAYER */}
      <BackgroundStudio
        themeId={settings.bgTheme}
        isAnimated={settings.bgAnimationEnabled}
        speed={settings.bgSpeed}
        intensity={settings.bgIntensity}
        particleDensity={settings.particleDensity}
        blur={settings.bgBlur}
        customColor={settings.customBgColor}
        clockColor={activeColor}
      />

      {/* 2. ROTATION WRAPPER: Forces landscape orientation 90deg when user toggles forcedLandscape on mobile */}
      <div
        className={`relative z-10 flex items-center justify-center transition-all duration-300 overflow-hidden ${
          settings.forcedLandscape
            ? 'w-[100dvh] h-[100dvw] rotate-90 origin-center absolute'
            : 'w-full h-full'
        }`}
      >
        {/* SUBTLE CORNER CONTROLS (Fade out on idle for pure dark immersion) */}
        <div
          className={`fixed top-3 right-3 sm:top-6 sm:right-6 z-40 flex items-center gap-2 transition-all duration-700 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Always-On Screen WakeLock */}
          <button
            onClick={toggleWakeLock}
            className={`p-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-all ${
              wakeLockActive
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white'
            }`}
            title={wakeLockActive ? 'Screen Always-On Active' : 'Enable Screen Always-On'}
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-zinc-400 hover:text-white transition-all shadow-lg"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Rotate to 90° Landscape */}
          <button
            onClick={() => handleUpdateSettings({ forcedLandscape: !settings.forcedLandscape })}
            className={`p-2.5 rounded-full border backdrop-blur-xl transition-all shadow-lg ${
              settings.forcedLandscape
                ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 90° Landscape Dock Mode"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Settings Sheet Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
            title="Open Settings (S)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* CLOCK FACE NAVIGATION PILLS (Bottom subtle indicator showing all 9 faces) */}
        <div
          className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl transition-all duration-700 shadow-xl ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {CLOCK_FACES.map((face) => {
            const isSelected = settings.face === face.id;
            return (
              <button
                key={face.id}
                onClick={() => handleUpdateSettings({ face: face.id })}
                className={`transition-all duration-300 rounded-full ${
                  isSelected
                    ? 'w-5 sm:w-6 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/25 hover:bg-white/60'
                }`}
                title={face.name}
              />
            );
          })}
        </div>

        {/* MAIN CLOCK DISPLAY — Renders all 9 functional clock faces */}
        <main className="w-full h-full flex items-center justify-center overflow-hidden">
          {settings.face === 'standby-digital' && (
            <StandByDigital
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'minimal-analog' && (
            <MinimalAnalog
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'retro-flip' && (
            <RetroFlip
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'ambient-glow' && (
            <AmbientGlow
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'neon-cyber' && (
            <NeonCyber
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'premium-editorial' && (
            <PremiumEditorial
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'aurora-digital' && (
            <AuroraDigital
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'modern-world' && (
            <ModernWorldClock
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              worldCity={settings.worldClockCity}
              worldTimezone={settings.worldClockTimezone}
              showSecondary={settings.showSecondaryClock}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'matrix-minimal' && (
            <MatrixMinimal
              time={currentTime}
              color={activeColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              onCycleColor={cycleColor}
            />
          )}
        </main>
      </div>

      {/* DEDICATED SETTINGS SHEET */}
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={handleUpdateSettings}
        onReset={handleResetSettings}
      />
    </div>
  );
};

export default App;
