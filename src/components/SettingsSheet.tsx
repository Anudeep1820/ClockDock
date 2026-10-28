import React from 'react';
import { ClockSettings } from '../types';
import {
  BACKGROUND_THEMES,
  CLOCK_COLORS,
  TYPOGRAPHY_STYLES,
  CLOCK_FACES,
} from '../utils/themes';
import {
  X,
  SunMedium,
  RotateCw,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onUpdate: (partial: Partial<ClockSettings>) => void;
  onReset: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-[#0c0c10]/95 border border-white/10 p-5 sm:p-7 shadow-2xl max-h-[88dvh] overflow-y-auto no-scrollbar flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-xl font-black text-white tracking-tight">ClockDock Settings</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Customize your StandBy bedside clock & screensaver</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CLOCK FACE SELECTOR */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clock Face</span>
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {CLOCK_FACES.map((face) => {
              const isSelected = settings.face === face.id;
              return (
                <button
                  key={face.id}
                  onClick={() => onUpdate({ face: face.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-lg scale-[1.01]'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                      {face.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {face.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. BACKGROUND THEME PREVIEWS (Color Swatches) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Atmospheric Background Theme</span>
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {BACKGROUND_THEMES.map((theme) => {
              const isSelected = settings.bgTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdate({ bgTheme: theme.id })}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-white ring-2 ring-white/40 scale-105'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                  style={{
                    background: theme.previewGradient,
                  }}
                >
                  <span className="text-[11px] font-bold text-white drop-shadow truncate max-w-full">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CLOCK ACCENT COLOR SWATCHES */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Clock Accent Color
          </span>
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            {CLOCK_COLORS.map((c) => {
              const isSelected = settings.clockColor === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onUpdate({ clockColor: c.id })}
                  className={`relative rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                      : 'w-5 h-5 sm:w-6 sm:h-6 opacity-75 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: c.primary,
                    boxShadow: isSelected ? `0 0 14px ${c.glow}` : 'none',
                  }}
                  title={c.name}
                />
              );
            })}
          </div>
        </div>

        {/* 4. TYPOGRAPHY STYLE SELECTION */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Typography Style
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPOGRAPHY_STYLES.map((t) => {
              const isSelected = settings.fontStyle === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdate({ fontStyle: t.id })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-md'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50'
                  }`}
                >
                  <span
                    className={`block text-xl font-black ${t.className} ${
                      isSelected ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    12:00
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-medium mt-1">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. DISPLAY TOGGLES (12/24H, Date, Seconds, Landscape) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 12h / 24h */}
          <button
            onClick={() => onUpdate({ is24Hour: !settings.is24Hour })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              settings.is24Hour
                ? 'border-white bg-white/10 text-white'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
            }`}
          >
            <span className="text-xs font-bold font-mono">
              {settings.is24Hour ? '24-Hour' : '12-Hour'}
            </span>
            <span className="text-[10px] text-zinc-500">Format</span>
          </button>

          {/* Show Date */}
          <button
            onClick={() => onUpdate({ showDate: !settings.showDate })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              settings.showDate
                ? 'border-white bg-white/10 text-white'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {settings.showDate ? 'Date: Visible' : 'Date: Hidden'}
            </span>
          </button>

          {/* Show Seconds */}
          <button
            onClick={() => onUpdate({ showSeconds: !settings.showSeconds })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              settings.showSeconds
                ? 'border-white bg-white/10 text-white'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {settings.showSeconds ? 'Sec: Visible' : 'Sec: Hidden'}
            </span>
          </button>

          {/* Landscape Dock Mode */}
          <button
            onClick={() => onUpdate({ forcedLandscape: !settings.forcedLandscape })}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              settings.forcedLandscape
                ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {settings.forcedLandscape ? 'Landscape 90°' : 'Auto Rotate'}
            </span>
          </button>
        </div>

        {/* 6. BRIGHTNESS DIMMER SLIDER */}
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <SunMedium className="w-4 h-4 text-amber-400" />
              <span>Bedside Screen Dimmer</span>
            </div>
            <span className="font-mono text-zinc-400">{Math.round(settings.dimmer * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="1.0"
            step="0.05"
            value={settings.dimmer}
            onChange={(e) => onUpdate({ dimmer: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* Footer Actions: Restore Defaults & Done */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-red-400 hover:border-red-500/30 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-sm shadow-xl hover:bg-zinc-200 active:scale-95 transition-all text-center"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
