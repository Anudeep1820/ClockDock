import React, { useState, useEffect, useRef } from 'react';
import { ClockFace, WidgetType, NightTint, AlarmItem } from './types';
import { PALETTES, NIGHT_TINTS } from './utils/themes';
import { ClockBigBold } from './components/ClockBigBold';
import { ClockRetroFlip } from './components/ClockRetroFlip';
import { ClockAnalog } from './components/ClockAnalog';
import { ClockNeonSlice } from './components/ClockNeonSlice';
import { ClockNightGlow } from './components/ClockNightGlow';
import { DualWidgetStandby } from './components/DualWidgetStandby';
import { DockHeaderControls } from './components/DockHeaderControls';
import { NightModeOverlay } from './components/NightModeOverlay';
import { WidgetPickerModal } from './components/WidgetPickerModal';
import { AlarmModal } from './components/AlarmModal';
import { soundEngine } from './utils/audio';

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

  // Dual Widget Slots
  const [leftWidget, setLeftWidget] = useState<WidgetType>('clock-digital');
  const [rightWidget, setRightWidget] = useState<WidgetType>('music');
  const [pickerSlot, setPickerSlot] = useState<'left' | 'right' | null>(null);

  // Alarms
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', time: '07:00', label: 'Sunrise Wakeup', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  ]);

  // Controls Visibility (Auto-hide on idle)
  const [controlsVisible, setControlsVisible] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);
  const wakeLockSentinel = useRef<unknown>(null);

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarms on the minute
      if (now.getSeconds() === 0) {
        const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;
        const triggered = alarms.find((a) => a.enabled && a.time === currentHHmm);
        if (triggered) {
          soundEngine.playAlarmChime();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [alarms]);

  // Activity / Idle Detector for Bedside immersion
  const handleUserActivity = () => {
    setControlsVisible(true);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    // Initial timeout
    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 4500);

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

      if (e.key === 'n' || e.key === 'N') {
        setNightMode((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '1') setCurrentFace('standby-dual');
      else if (e.key === '2') setCurrentFace('big-bold');
      else if (e.key === '3') setCurrentFace('retro-flip');
      else if (e.key === '4') setCurrentFace('minimal-analog');
      else if (e.key === '5') setCurrentFace('neon-slice');
      else if (e.key === '6') setCurrentFace('night-glow');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Screen Wake Lock API (keeps display awake while docked)
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

  const handleSwapWidgets = () => {
    const temp = leftWidget;
    setLeftWidget(rightWidget);
    setRightWidget(temp);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none flex flex-col justify-between"
      style={{
        filter: `brightness(${dimLevel})`,
        transition: 'filter 0.3s ease',
      }}
    >
      {/* Top Header Dock Controls */}
      <DockHeaderControls
        currentFace={currentFace}
        onChangeFace={setCurrentFace}
        is24Hour={is24Hour}
        onToggle24Hour={() => setIs24Hour((p) => !p)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        wakeLockActive={wakeLockActive}
        onToggleWakeLock={toggleWakeLock}
        onOpenAlarms={() => setIsAlarmModalOpen(true)}
        nightMode={nightMode}
        nightHex={activeTintHex}
        visible={controlsVisible}
      />

      {/* Main Clock Stage */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center">
        {currentFace === 'standby-dual' && (
          <DualWidgetStandby
            time={currentTime}
            palette={currentPalette}
            leftWidget={leftWidget}
            rightWidget={rightWidget}
            nightMode={nightMode}
            nightHex={activeTintHex}
            is24Hour={is24Hour}
            onOpenWidgetPicker={(slot) => setPickerSlot(slot)}
            onSwapWidgets={handleSwapWidgets}
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

      {/* Bottom Floating Bar: Night Mode & Tint dots (Auto-hides on idle) */}
      <footer
        className={`fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none transition-all duration-500 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="pointer-events-auto">
          <NightModeOverlay
            nightMode={nightMode}
            activeTint={activeTint}
            onSelectTint={setActiveTint}
            onToggleNightMode={() => setNightMode((p) => !p)}
            dimLevel={dimLevel}
            onChangeDim={setDimLevel}
          />
        </div>
      </footer>

      {/* Widget Picker Modal */}
      <WidgetPickerModal
        isOpen={pickerSlot !== null}
        activeSlot={pickerSlot}
        currentLeft={leftWidget}
        currentRight={rightWidget}
        onSelectWidget={(slot, type) => {
          if (slot === 'left') setLeftWidget(type);
          else setRightWidget(type);
        }}
        onClose={() => setPickerSlot(null)}
        nightMode={nightMode}
        nightHex={activeTintHex}
      />

      {/* Alarms Modal */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        alarms={alarms}
        onToggleAlarm={(id) =>
          setAlarms((prev) =>
            prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
          )
        }
        onAddAlarm={(newAlarm) => setAlarms((prev) => [newAlarm, ...prev])}
        onDeleteAlarm={(id) => setAlarms((prev) => prev.filter((a) => a.id !== id))}
        nightMode={nightMode}
        nightHex={activeTintHex}
      />
    </div>
  );
};

export default App;
