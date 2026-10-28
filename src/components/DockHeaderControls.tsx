import React from 'react';
import { ClockFace } from '../types';
import {
  Maximize2,
  Minimize2,
  Bell,
  Sparkles,
  LayoutGrid,
  Zap,
} from 'lucide-react';

interface DockHeaderControlsProps {
  currentFace: ClockFace;
  onChangeFace: (face: ClockFace) => void;
  is24Hour: boolean;
  onToggle24Hour: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
  onOpenAlarms: () => void;
  nightMode?: boolean;
  nightHex?: string;
  visible: boolean;
}

export const DockHeaderControls: React.FC<DockHeaderControlsProps> = ({
  currentFace,
  onChangeFace,
  is24Hour,
  onToggle24Hour,
  isFullscreen,
  onToggleFullscreen,
  wakeLockActive,
  onToggleWakeLock,
  onOpenAlarms,
  nightMode = false,
  nightHex = '#ef4444',
  visible,
}) => {
  const clockStyles: { id: ClockFace; label: string }[] = [
    { id: 'standby-dual', label: 'Duo Widgets' },
    { id: 'big-bold', label: 'Big Bold' },
    { id: 'retro-flip', label: 'Retro Flip' },
    { id: 'minimal-analog', label: 'Analog Dial' },
    { id: 'neon-slice', label: 'Neon Slice' },
    { id: 'night-glow', label: 'Night Glow' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 p-3 sm:p-5 flex items-center justify-between pointer-events-none transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {/* Brand & Active Face Pill */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-lg"
          style={{
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(15, 15, 20, 0.85)',
            borderColor: nightMode ? `${nightHex}40` : 'rgba(255, 255, 255, 0.15)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-xs tracking-wider text-white">ClockDock</span>
        </div>

        {/* Styles Switcher Scroll */}
        <div
          className="hidden md:flex items-center gap-1 p-1 rounded-full border backdrop-blur-xl bg-zinc-950/80 border-zinc-800 shadow-xl"
        >
          {clockStyles.map((s) => {
            const isSelected = currentFace === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChangeFace(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
                style={{
                  backgroundColor: isSelected && nightMode ? nightHex : undefined,
                  color: isSelected && nightMode ? '#000000' : undefined,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls: 12/24, WakeLock, Alarm, Fullscreen */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mobile Style Dropdown button */}
        <div className="flex md:hidden">
          <select
            value={currentFace}
            onChange={(e) => onChangeFace(e.target.value as ClockFace)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 text-white focus:outline-none"
          >
            {clockStyles.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* 12h / 24h Toggle */}
        <button
          onClick={onToggle24Hour}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-zinc-800 bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
          title="Toggle 12h/24h Time"
        >
          {is24Hour ? '24H' : '12H'}
        </button>

        {/* Always-On Wake Lock */}
        <button
          onClick={onToggleWakeLock}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
            wakeLockActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title={wakeLockActive ? 'Always-On Screen Active' : 'Enable Always-On Screen'}
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Alarm Dialog */}
        <button
          onClick={onOpenAlarms}
          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
          title="Bedside Alarms"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Bedside Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
