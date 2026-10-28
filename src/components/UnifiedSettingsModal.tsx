import React from 'react';
import { ClockFace, NightTint } from '../types';
import { NIGHT_TINTS } from '../utils/themes';
import {
  X,
  Moon,
  SunMedium,
  Maximize2,
  Minimize2,
  Zap,
  Check,
} from 'lucide-react';

interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFace: ClockFace;
  onChangeFace: (face: ClockFace) => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  activeTint: NightTint;
  onSelectTint: (tint: NightTint) => void;
  dimLevel: number;
  onChangeDim: (val: number) => void;
  is24Hour: boolean;
  onToggle24Hour: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  currentFace,
  onChangeFace,
  nightMode,
  onToggleNightMode,
  activeTint,
  onSelectTint,
  dimLevel,
  onChangeDim,
  is24Hour,
  onToggle24Hour,
  isFullscreen,
  onToggleFullscreen,
  wakeLockActive,
  onToggleWakeLock,
}) => {
  if (!isOpen) return null;

  const clockStyles: { id: ClockFace; name: string; desc: string }[] = [
    { id: 'standby-dual', name: 'StandBy Duo', desc: 'Clock + Music side by side' },
    { id: 'big-bold', name: 'Big Bold', desc: 'Giant digits readable from across room' },
    { id: 'retro-flip', name: 'Retro Flip', desc: 'Mechanical split flip board' },
    { id: 'minimal-analog', name: 'Analog Dial', desc: 'Swiss Bauhaus sweeping dial' },
    { id: 'neon-slice', name: 'Neon Slice', desc: 'Cyberpunk angular slice' },
    { id: 'night-glow', name: 'Night Glow', desc: 'OLED dark night with date' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-zinc-950/95 border border-zinc-800/80 p-5 sm:p-7 shadow-2xl max-h-[90dvh] overflow-y-auto no-scrollbar flex flex-col gap-6"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl font-black text-white">Bedside Dock Settings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Customize clock style, night tint & screen</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Clock Face Selection */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Clock Style
          </span>
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            {clockStyles.map((s) => {
              const isSelected = currentFace === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onChangeFace(s.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-lg'
                      : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                      {s.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{s.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Night Mode & 7 Circadian Tints */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-bold text-white">Night Mode</span>
            </div>
            <button
              onClick={onToggleNightMode}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                nightMode ? 'bg-rose-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  nightMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Color Tint Row (7 Swatches) */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Night Tint:</span>
            <div className="flex items-center gap-2">
              {NIGHT_TINTS.map((t) => {
                const isSelected = activeTint === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTint(t.id);
                      if (!nightMode) onToggleNightMode();
                    }}
                    className={`rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'w-6 h-6 ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                        : 'w-4 h-4 opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: t.hex,
                      boxShadow: isSelected ? `0 0 10px ${t.hex}` : 'none',
                    }}
                    title={t.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Screen Dimmer Brightness */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <SunMedium className="w-4 h-4 text-amber-400" />
              <span>Screen Dimmer</span>
            </div>
            <span className="font-mono text-zinc-400">{Math.round(dimLevel * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={dimLevel}
            onChange={(e) => onChangeDim(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* 4. Toggles: 24H, Always-On, Fullscreen */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggle24Hour}
            className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center flex flex-col items-center justify-center gap-1 hover:border-zinc-700 transition-colors"
          >
            <span className="text-xs font-mono font-bold text-white">
              {is24Hour ? '24-Hour' : '12-Hour'}
            </span>
            <span className="text-[10px] text-zinc-500">Format</span>
          </button>

          <button
            onClick={onToggleWakeLock}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
              wakeLockActive
                ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold">Always-On</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-[10px] font-bold">Fullscreen</span>
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:bg-zinc-200 active:scale-95 transition-all"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};
