import React, { useState, useEffect } from 'react';
import { ClockSettings, AnimationSpeed, EffectIntensity, ParticleDensity } from '../types';
import {
  BACKGROUND_THEMES,
  CLOCK_COLORS,
  TYPOGRAPHY_STYLES,
  CLOCK_FACES,
  WORLD_CITIES,
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
  Palette,
  Type,
  Globe,
  Sliders,
  Wifi,
  WifiOff,
  Gauge,
  Layers,
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
  // Track online / offline status for PWA indicator
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const currentTheme = BACKGROUND_THEMES.find((t) => t.id === settings.bgTheme);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#0b0c10]/95 border border-white/10 p-5 sm:p-7 shadow-2xl max-h-[90dvh] overflow-y-auto no-scrollbar flex flex-col gap-6"
      >
        {/* Header with Offline / PWA status indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
              <h2 className="text-xl font-black text-white tracking-tight">ClockDock Studio</h2>
              
              {/* PWA Offline Ready Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isOnline
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                }`}
                title={isOnline ? 'Online • PWA Cached Offline' : 'Operating in 100% Offline Mode'}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>Offline Ready</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Offline Mode</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              9 StandBy clock faces, dynamic animated backgrounds & bedside settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CLOCK FACE SELECTOR (All 9 faces with badges and visual cards) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-300" />
              <span>Clock Faces ({CLOCK_FACES.length})</span>
            </span>
            <span className="text-[11px] text-zinc-500">Swipe screen to switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CLOCK_FACES.map((face) => {
              const isSelected = settings.face === face.id;
              return (
                <button
                  key={face.id}
                  onClick={() => onUpdate({ face: face.id })}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.08)] scale-[1.01]'
                      : 'border-zinc-850 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {face.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'
                      }`}
                    >
                      {face.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {face.subtitle}
                  </p>
                  {isSelected && (
                    <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. WORLD CLOCK CONFIGURATION (Visible or expanded when World Clock is selected or as dedicated control) */}
        {settings.face === 'modern-world' && (
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-sky-500/30 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>World Clock Companion</span>
              </span>
              <button
                onClick={() => onUpdate({ showSecondaryClock: !settings.showSecondaryClock })}
                className={`text-[11px] px-2.5 py-1 rounded-full font-bold border transition-colors ${
                  settings.showSecondaryClock
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                }`}
              >
                {settings.showSecondaryClock ? 'Secondary Visible' : 'Secondary Hidden'}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">Select Secondary City / Timezone:</label>
              <select
                value={settings.worldClockCity}
                onChange={(e) => {
                  const selected = WORLD_CITIES.find((c) => c.city === e.target.value);
                  if (selected) {
                    onUpdate({
                      worldClockCity: selected.city,
                      worldClockTimezone: selected.timezone,
                    });
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-400"
              >
                {WORLD_CITIES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({c.country}) — {c.timezone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 3. ANIMATED BACKGROUND STUDIO */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Animated Background Studio</span>
            </span>

            {/* Animation Master Toggle */}
            <button
              onClick={() => onUpdate({ bgAnimationEnabled: !settings.bgAnimationEnabled })}
              className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-all ${
                settings.bgAnimationEnabled
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              {settings.bgAnimationEnabled ? 'Animation On' : 'Paused'}
            </button>
          </div>

          {/* Background Grid Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {BACKGROUND_THEMES.map((theme) => {
              const isSelected = settings.bgTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdate({ bgTheme: theme.id })}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all overflow-hidden h-16 ${
                    isSelected
                      ? 'border-white ring-2 ring-white/50 scale-[1.03] shadow-lg'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  style={{ background: theme.previewGradient }}
                >
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate max-w-full px-1">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Description of active theme */}
          {currentTheme && (
            <p className="text-[11px] text-zinc-400 italic">
              {currentTheme.name}: {currentTheme.description}
            </p>
          )}

          {/* Custom Solid Color Picker (Visible when custom-color theme is active) */}
          {settings.bgTheme === 'custom-color' && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-zinc-700 animate-fadeIn">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Custom Solid Color:</span>
              </label>
              <input
                type="color"
                value={settings.customBgColor}
                onChange={(e) => onUpdate({ customBgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-zinc-400">{settings.customBgColor}</span>
              
              {/* Quick Preset Colors */}
              <div className="flex items-center gap-1.5 ml-auto">
                {['#000000', '#0a0d14', '#150a1f', '#061a14', '#1a0d0d'].map((hex) => (
                  <button
                    key={hex}
                    onClick={() => onUpdate({ customBgColor: hex })}
                    className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Background Customization Controls: Speed, Intensity, Particles & Blur */}
          {settings.bgTheme !== 'oled-black' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800/80">
              {/* Animation Speed Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  <span>Speed</span>
                </span>
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                  {(['slow', 'normal', 'fast'] as AnimationSpeed[]).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onUpdate({ bgSpeed: spd })}
                      className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                        settings.bgSpeed === spd
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effect Intensity Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  <span>Intensity</span>
                </span>
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                  {(['low', 'medium', 'high'] as EffectIntensity[]).map((int) => (
                    <button
                      key={int}
                      onClick={() => onUpdate({ bgIntensity: int })}
                      className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                        settings.bgIntensity === int
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Density or Blur Toggle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Density / Blur</span>
                </span>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                  {(['low', 'medium', 'high'] as ParticleDensity[]).map((density) => (
                    <button
                      key={density}
                      onClick={() => onUpdate({ particleDensity: density })}
                      className={`flex-1 py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                        settings.particleDensity === density
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                  <button
                    onClick={() => onUpdate({ bgBlur: !settings.bgBlur })}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all border ${
                      settings.bgBlur
                        ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                    title="Atmospheric Blur Filter"
                  >
                    Blur
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. CLOCK ACCENT COLOR SWATCHES */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-zinc-300" />
            <span>Clock Accent Color</span>
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

        {/* 5. TYPOGRAPHY STYLE SELECTION */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-zinc-300" />
            <span>Typography Style</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TYPOGRAPHY_STYLES.map((t) => {
              const isSelected = settings.fontStyle === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdate({ fontStyle: t.id })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-white bg-white/10 shadow-md'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50'
                  }`}
                >
                  <span
                    className={`block text-lg font-black ${t.className} ${
                      isSelected ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    12:00
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-medium mt-1 truncate">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. DISPLAY TOGGLES (12/24H, Date, Seconds, Landscape) */}
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
            <span className="text-[10px] text-zinc-500">Time Format</span>
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

        {/* 7. BRIGHTNESS DIMMER SLIDER */}
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
