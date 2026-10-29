import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockSettings, ClockFaceId } from './types';
import {
  loadSettings,
  saveSettings,
  resetSettings,
  computeEffectiveSleepMode,
  getNextScheduledTransition,
} from './utils/storage';
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
import { Settings, Maximize2, Minimize2, Zap, RotateCw, Moon } from 'lucide-react';

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

  // 3. Smart Dock Controls visibility & interaction tracking
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimerRef = useRef<number | null>(null);
  const isInteractingWithControls = useRef(false);

  // 4. Fullscreen & Wake Lock state with user feedback toast
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinel = useRef<unknown>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // 5. Touch swipe handling for horizontal face switching
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Toast helper for user feedback
  const showToast = useCallback((msg: string) => {
    setFeedbackToast(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  }, []);

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
    showToast('Defaults restored');
  }, [showToast]);

  // Live Clock Tick & Visibility Change recovery
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setCurrentTime(new Date());
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Refresh immediately and re-request WakeLock when returning from background
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        setCurrentTime(new Date());

        // Reacquire screen wake lock if it was enabled
        if (wakeLockActive && 'wakeLock' in navigator) {
          try {
            const sentinel = await (
              navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }
            ).wakeLock.request('screen');
            wakeLockSentinel.current = sentinel;
          } catch {
            // Reacquisition failed (e.g. low battery)
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [wakeLockActive]);

  // Smart Dock: Idle Activity Detector (fades controls after 3.5s of no interaction)
  const reportActivity = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }

    // Do not hide if the user is currently hovering or focusing on controls
    if (!isInteractingWithControls.current) {
      idleTimerRef.current = window.setTimeout(() => {
        if (!isInteractingWithControls.current) {
          setControlsVisible(false);
        }
      }, 3500);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', reportActivity);
    window.addEventListener('touchstart', reportActivity, { passive: true });
    window.addEventListener('keydown', reportActivity);

    idleTimerRef.current = window.setTimeout(() => {
      if (!isInteractingWithControls.current) {
        setControlsVisible(false);
      }
    }, 3500);

    return () => {
      window.removeEventListener('mousemove', reportActivity);
      window.removeEventListener('touchstart', reportActivity);
      window.removeEventListener('keydown', reportActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [reportActivity]);

  // --------------------------------------------------------------------------
  // Adaptive Sleep Mode Evaluation (Phase 1)
  // --------------------------------------------------------------------------
  const {
    isSleepActive: isSleepModeActive,
    overrideActive: isOverrideActive,
    nextTransition,
    expiredOverrideToClear,
  } = computeEffectiveSleepMode(currentTime, settings);

  // Automatically clear manual override when scheduled transition is crossed
  useEffect(() => {
    if (expiredOverrideToClear) {
      handleUpdateSettings({ sleepManualOverride: null });
    }
  }, [expiredOverrideToClear, handleUpdateSettings]);

  // Toggle sleep mode manually with automatic next-scheduled-boundary expiration
  const handleToggleSleepManual = useCallback(() => {
    const next = getNextScheduledTransition(currentTime, settings);
    const expiresAt = next
      ? next.time.getTime()
      : currentTime.getTime() + 8 * 60 * 60 * 1000;

    if (isSleepModeActive) {
      // User manually exits sleep mode -> set daytime override until next sleep time
      handleUpdateSettings({
        sleepManualOverride: {
          targetState: false,
          expiresAt,
        },
      });
      showToast('Sleep Mode paused until next bedtime');
    } else {
      // User manually enters sleep mode -> set nighttime override until next wake-up time
      handleUpdateSettings({
        sleepManualOverride: {
          targetState: true,
          expiresAt,
        },
      });
      showToast('Sleep Mode activated until wake-up');
    }
  }, [currentTime, settings, isSleepModeActive, handleUpdateSettings, showToast]);

  // --------------------------------------------------------------------------
  // Effective Appearance Parameters (Independent Night vs Daytime Configurations)
  // --------------------------------------------------------------------------
  const effectiveBgTheme = isSleepModeActive ? settings.sleepBgTheme : settings.bgTheme;
  const effectiveColor = isSleepModeActive
    ? getColor(settings.sleepTint)
    : getColor(settings.clockColor);
  const effectiveDimmer = isSleepModeActive ? settings.sleepDimmer : settings.dimmer;
  const effectiveShowSeconds =
    isSleepModeActive && settings.sleepHideSeconds ? false : settings.showSeconds;
  const effectiveShowDate =
    isSleepModeActive && settings.sleepMinimalDate ? false : settings.showDate;
  const effectiveAnimation = isSleepModeActive && settings.sleepDisableAnimations
    ? false
    : settings.bgAnimationEnabled;
  const effectiveGlowStrength = isSleepModeActive
    ? settings.sleepGlowStrength
    : settings.glowStrength;

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
          showToast('Screen Always-On: Off');
        } catch {
          setWakeLockActive(false);
        }
      } else {
        try {
          const sentinel = await (
            navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }
          ).wakeLock.request('screen');
          wakeLockSentinel.current = sentinel;
          setWakeLockActive(true);
          showToast('Screen Always-On: Active');
        } catch (err: unknown) {
          setWakeLockActive(false);
          const errorName = (err as { name?: string })?.name;
          if (errorName === 'NotAllowedError') {
            showToast('Wake Lock restricted by device battery saver');
          } else {
            showToast('Screen Wake Lock unavailable');
          }
        }
      }
    } else {
      showToast('Wake Lock API not supported on this browser');
    }
  };

  // Fullscreen toggle with graceful fallback
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            try {
              (screen.orientation as unknown as { lock: (orientation: string) => Promise<void> })
                ?.lock?.('landscape')
                .catch(() => {});
            } catch {
              // Orientation lock is optional
            }
          })
          .catch(() => {
            showToast('Fullscreen not permitted by browser');
          });
      } else {
        showToast('Fullscreen API unavailable on this browser');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(() => {});
      }
    }
  };

  // Cycle accent color with 1 tap on the clock
  const cycleColor = useCallback(() => {
    const currentIndex = CLOCK_COLORS.findIndex((c) => c.id === settings.clockColor);
    const nextIndex = (currentIndex + 1) % CLOCK_COLORS.length;
    handleUpdateSettings({ clockColor: CLOCK_COLORS[nextIndex].id });
  }, [settings.clockColor, handleUpdateSettings]);

  // Keyboard Shortcuts (1-9 for face direct jumps, Arrows to cycle, S for settings, F for fullscreen, N for night mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if (e.key === 's' || e.key === 'S') setIsSettingsOpen((p) => !p);
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'n' || e.key === 'N') {
        handleToggleSleepManual();
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
  }, [settings.face, handleUpdateSettings, cycleColor, handleToggleSleepManual]);

  const activeTypography = getTypography(settings.fontStyle);

  return (
    <div
      className="relative w-screen h-[100dvh] overflow-hidden overscroll-none select-none touch-none flex items-center justify-center bg-black"
      style={{
        filter: `brightness(${effectiveDimmer})`,
        transition: 'filter 0.5s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={reportActivity}
    >
      {/* 1. ANIMATED BACKGROUND STUDIO LAYER */}
      <BackgroundStudio
        themeId={effectiveBgTheme}
        isAnimated={effectiveAnimation}
        speed={settings.bgSpeed}
        intensity={settings.bgIntensity}
        particleDensity={settings.particleDensity}
        blur={settings.bgBlur}
        customColor={settings.customBgColor}
        customColorSecondary={settings.customBgColorSecondary}
        clockColor={effectiveColor}
        glowStrength={effectiveGlowStrength}
        bgBrightness={settings.bgBrightness}
        reduceMotion={settings.reduceMotion}
      />

      {/* 2. ROTATION WRAPPER: Forces landscape orientation 90deg when user toggles forcedLandscape on mobile */}
      <div
        className={`relative z-10 flex items-center justify-center transition-all duration-300 overflow-hidden ${
          settings.forcedLandscape
            ? 'w-[100dvh] h-[100dvw] rotate-90 origin-center absolute'
            : 'w-full h-full'
        }`}
      >
        {/* SMART DOCK FEEDBACK TOAST */}
        {feedbackToast && (
          <div className="fixed safe-top left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-xl shadow-2xl animate-fadeIn pointer-events-none">
            {feedbackToast}
          </div>
        )}

        {/* SMART DOCK CORNER CONTROLS (Fade out on idle, stay visible on interaction) */}
        <div
          onMouseEnter={() => {
            isInteractingWithControls.current = true;
            setControlsVisible(true);
          }}
          onMouseLeave={() => {
            isInteractingWithControls.current = false;
            reportActivity();
          }}
          onFocus={() => {
            isInteractingWithControls.current = true;
            setControlsVisible(true);
          }}
          onBlur={() => {
            isInteractingWithControls.current = false;
            reportActivity();
          }}
          className={`fixed safe-top safe-right z-40 flex items-center gap-2 transition-all duration-500 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Adaptive Sleep Mode Quick Toggle */}
          <button
            onClick={handleToggleSleepManual}
            className={`p-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-white ${
              isSleepModeActive
                ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white'
            }`}
            title={
              isSleepModeActive
                ? 'Sleep Mode Active (Tap to Exit / Resume Daytime)'
                : 'Activate Adaptive Sleep Mode (N)'
            }
            aria-label="Toggle Adaptive Sleep Mode"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Always-On Screen WakeLock */}
          <button
            onClick={toggleWakeLock}
            className={`p-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-white ${
              wakeLockActive
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white'
            }`}
            title={wakeLockActive ? 'Screen Always-On Active' : 'Enable Screen Always-On'}
            aria-label="Toggle Screen Always-On"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-zinc-400 hover:text-white transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-white"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Rotate to 90° Landscape */}
          <button
            onClick={() => handleUpdateSettings({ forcedLandscape: !settings.forcedLandscape })}
            className={`p-2.5 rounded-full border backdrop-blur-xl transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-white ${
              settings.forcedLandscape
                ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white'
            }`}
            title="Toggle 90° Landscape Dock Mode"
            aria-label="Toggle 90 degree Landscape Dock Mode"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Settings Sheet Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-zinc-300 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-white"
            title="Open Settings (S)"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* CLOCK FACE NAVIGATION PILLS (Bottom subtle indicator showing all 9 faces) */}
        <div
          onMouseEnter={() => {
            isInteractingWithControls.current = true;
            setControlsVisible(true);
          }}
          onMouseLeave={() => {
            isInteractingWithControls.current = false;
            reportActivity();
          }}
          className={`fixed safe-bottom left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl transition-all duration-500 shadow-xl ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {CLOCK_FACES.map((face) => {
            const isSelected = settings.face === face.id;
            return (
              <button
                key={face.id}
                onClick={() => handleUpdateSettings({ face: face.id })}
                className={`transition-all duration-300 rounded-full focus-visible:ring-2 focus-visible:ring-white ${
                  isSelected
                    ? 'w-5 sm:w-6 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/25 hover:bg-white/60'
                }`}
                title={face.name}
                aria-label={`Select ${face.name}`}
              />
            );
          })}
        </div>

        {/* MAIN CLOCK DISPLAY — Renders all 9 functional clock faces */}
        <main className="w-full h-full flex items-center justify-center overflow-hidden">
          {settings.face === 'standby-digital' && (
            <StandByDigital
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              numeralSize={settings.numeralSize}
              glowStrength={effectiveGlowStrength}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'minimal-analog' && (
            <MinimalAnalog
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              glowStrength={effectiveGlowStrength}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'retro-flip' && (
            <RetroFlip
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'ambient-glow' && (
            <AmbientGlow
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              numeralSize={settings.numeralSize}
              glowStrength={effectiveGlowStrength}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'neon-cyber' && (
            <NeonCyber
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              numeralSize={settings.numeralSize}
              glowStrength={effectiveGlowStrength}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'premium-editorial' && (
            <PremiumEditorial
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'aurora-digital' && (
            <AuroraDigital
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              numeralSize={settings.numeralSize}
              glowStrength={effectiveGlowStrength}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'modern-world' && (
            <ModernWorldClock
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
              worldCity={settings.worldClockCity}
              worldTimezone={settings.worldClockTimezone}
              showSecondary={settings.showSecondaryClock}
              onCycleColor={cycleColor}
            />
          )}

          {settings.face === 'matrix-minimal' && (
            <MatrixMinimal
              time={currentTime}
              color={effectiveColor}
              typography={activeTypography}
              is24Hour={settings.is24Hour}
              showDate={effectiveShowDate}
              showSeconds={effectiveShowSeconds}
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
        isSleepModeActive={isSleepModeActive}
        isOverrideActive={isOverrideActive}
        nextTransition={nextTransition}
        onToggleSleepManual={handleToggleSleepManual}
        currentTime={currentTime}
      />
    </div>
  );
};

export default App;
