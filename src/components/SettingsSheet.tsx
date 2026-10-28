import React, { useState, useEffect } from 'react';
import {
  ClockSettings,
  AnimationSpeed,
  EffectIntensity,
  ParticleDensity,
  NumeralSize,
  GlowStrength,
  ClockColorId,
  UserPreset,
} from '../types';
import {
  BACKGROUND_THEMES,
  CLOCK_COLORS,
  TYPOGRAPHY_STYLES,
  CLOCK_FACES,
  WORLD_CITIES,
} from '../utils/themes';
import {
  loadUserPresets,
  saveUserPresets,
  isNightScheduleActive,
} from '../utils/storage';
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
  Moon,
  Bookmark,
  Trash2,
  Edit2,
  Plus,
  Maximize2,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onUpdate: (partial: Partial<ClockSettings>) => void;
  onReset: () => void;
  isNightModeActive: boolean;
  onToggleNightManual: () => void;
}

type SettingsTab = 'faces' | 'wallpaper' | 'night' | 'presets' | 'display';

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReset,
  isNightModeActive,
  onToggleNightManual,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('faces');

  // Track online / offline status for PWA indicator
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // User presets state
  const [presets, setPresets] = useState<UserPreset[]>(() => loadUserPresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');

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

  // Apply a selected preset
  const handleApplyPreset = (preset: UserPreset) => {
    onUpdate({
      face: preset.face,
      bgTheme: preset.bgTheme,
      clockColor: preset.clockColor,
      fontStyle: preset.fontStyle,
      dimmer: preset.dimmer,
      ...(preset.bgSpeed && { bgSpeed: preset.bgSpeed }),
      ...(preset.bgIntensity && { bgIntensity: preset.bgIntensity }),
      ...(preset.particleDensity && { particleDensity: preset.particleDensity }),
      ...(preset.glowStrength && { glowStrength: preset.glowStrength }),
      ...(preset.numeralSize && { numeralSize: preset.numeralSize }),
    });
  };

  // Save current configuration as new preset
  const handleSaveCurrentAsPreset = () => {
    const trimmed = newPresetName.trim();
    if (!trimmed) return;

    const newPreset: UserPreset = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      isBuiltIn: false,
      face: settings.face,
      bgTheme: settings.bgTheme,
      clockColor: settings.clockColor,
      fontStyle: settings.fontStyle,
      dimmer: settings.dimmer,
      bgSpeed: settings.bgSpeed,
      bgIntensity: settings.bgIntensity,
      particleDensity: settings.particleDensity,
      glowStrength: settings.glowStrength,
      numeralSize: settings.numeralSize,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    saveUserPresets(updated);
    setNewPresetName('');
    setIsCreatingPreset(false);
  };

  // Delete a custom preset
  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    saveUserPresets(updated);
  };

  // Rename a custom preset
  const handleRenamePreset = (id: string) => {
    const trimmed = editingPresetName.trim();
    if (!trimmed) return;

    const updated = presets.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
    setPresets(updated);
    saveUserPresets(updated);
    setEditingPresetId(null);
    setEditingPresetName('');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#0b0c10]/95 border border-white/10 p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto no-scrollbar flex flex-col gap-5"
      >
        {/* Header with Offline Status & Night Mode indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
              <h2 className="text-xl font-black text-white tracking-tight">ClockDock Studio 2.0</h2>

              {/* Night Mode Active Pill */}
              {isNightModeActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-rose-500/40 bg-rose-500/15 text-rose-300">
                  <Moon className="w-3 h-3 text-rose-400" />
                  <span>Night Mode Active</span>
                </div>
              )}

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
              Premium StandBy clock faces, wallpaper studio & intelligent bedside night mode
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Pill Bar */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-black/50 border border-white/10 rounded-2xl">
          {[
            { id: 'faces', label: 'Clock', icon: Clock },
            { id: 'wallpaper', label: 'Wallpaper', icon: Sparkles },
            { id: 'night', label: 'Night Mode', icon: Moon },
            { id: 'presets', label: 'Presets', icon: Bookmark },
            { id: 'display', label: 'Display', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  isTabActive
                    ? 'bg-white text-black shadow-lg scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: CLOCK FACES & STYLING */}
        {/* ============================================================ */}
        {activeTab === 'faces' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Clock Face Grid */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Clock Face ({CLOCK_FACES.length})</span>
                </span>
                <span className="text-[11px] text-zinc-500">Swipe screen anytime to switch</span>
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

            {/* World Clock Specific Settings */}
            {settings.face === 'modern-world' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-sky-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Secondary World Timezone</span>
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
            )}

            {/* Accent Color Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
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

            {/* Typography Styles */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
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

            {/* Numeral Size & Glow Strength */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Numeral Size */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Numeral Size
                </span>
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                  {(['standard', 'large', 'xlarge'] as NumeralSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onUpdate({ numeralSize: sz })}
                      className={`py-1.5 text-[11px] font-bold capitalize rounded-lg transition-all ${
                        settings.numeralSize === sz
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sz === 'xlarge' ? 'X-Large' : sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Strength */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Clock Glow Strength
                </span>
                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                  {(['off', 'subtle', 'vibrant'] as GlowStrength[]).map((glow) => (
                    <button
                      key={glow}
                      onClick={() => onUpdate({ glowStrength: glow })}
                      className={`py-1.5 text-[11px] font-bold capitalize rounded-lg transition-all ${
                        settings.glowStrength === glow
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {glow}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Toggles: 12/24H, Date, Seconds */}
            <div className="grid grid-cols-3 gap-2">
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
                  {settings.showSeconds ? 'Seconds: Visible' : 'Seconds: Hidden'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WALLPAPER STUDIO */}
        {/* ============================================================ */}
        {activeTab === 'wallpaper' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wallpaper Presets</span>
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Hardware-accelerated ambient canvases & atmospheric gradients
                </p>
              </div>

              {/* Master Animation Toggle */}
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

            {currentTheme && (
              <p className="text-[11px] text-zinc-400 italic">
                {currentTheme.name}: {currentTheme.description}
              </p>
            )}

            {/* Custom Color Options */}
            {settings.bgTheme === 'custom-color' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-700 flex flex-col gap-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Custom Solid & Dual Gradient Hues</span>
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-zinc-400">Primary Color:</label>
                    <input
                      type="color"
                      value={settings.customBgColor}
                      onChange={(e) => onUpdate({ customBgColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-zinc-400">Secondary Gradient Color:</label>
                    <input
                      type="color"
                      value={settings.customBgColorSecondary}
                      onChange={(e) => onUpdate({ customBgColorSecondary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customization Sliders & Options */}
            {settings.bgTheme !== 'oled-black' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800">
                {/* Speed */}
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

                {/* Intensity */}
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

                {/* Particle Density */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Particle Density</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['low', 'medium', 'high'] as ParticleDensity[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => onUpdate({ particleDensity: d })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                          settings.particleDensity === d
                            ? 'bg-white text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Background Dimming & Blur Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => onUpdate({ bgBlur: !settings.bgBlur })}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    settings.bgBlur
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Atmospheric Blur: {settings.bgBlur ? 'On' : 'Off'}
                </button>

                <button
                  onClick={() => onUpdate({ reduceMotion: !settings.reduceMotion })}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    settings.reduceMotion
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Reduced Motion: {settings.reduceMotion ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Background Brightness Slider */}
              <div className="flex items-center gap-2.5 w-full sm:w-48 ml-auto">
                <SunMedium className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={settings.bgBrightness}
                  onChange={(e) => onUpdate({ bgBrightness: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded appearance-none cursor-pointer accent-white"
                  title="Wallpaper Brightness"
                />
                <span className="font-mono text-[11px] text-zinc-400">
                  {Math.round(settings.bgBrightness * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: INTELLIGENT NIGHT MODE */}
        {/* ============================================================ */}
        {activeTab === 'night' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Master Toggle & Manual Override */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-rose-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-black text-white">Bedside Night Mode</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Manual Override Button */}
                  <button
                    onClick={onToggleNightManual}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                      isNightModeActive
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isNightModeActive ? '🌙 Night Mode Active (Tap to Exit)' : '☀️ Day Mode (Tap for Night)'}
                  </button>

                  {/* Auto-Schedule Toggle */}
                  <button
                    onClick={() => onUpdate({ nightModeEnabled: !settings.nightModeEnabled })}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                      settings.nightModeEnabled
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {settings.nightModeEnabled ? 'Schedule Enabled' : 'Schedule Off'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically transitions into OLED Pure Black with low-emission night tint and
                suppressed seconds to protect your circadian rhythm and bedroom sleep.
              </p>
            </div>

            {/* Scheduled Hours Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Night Mode Starts (Local Time):
                </label>
                <input
                  type="time"
                  value={settings.nightModeStart}
                  onChange={(e) => onUpdate({ nightModeStart: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Night Mode Ends (Local Time):
                </label>
                <input
                  type="time"
                  value={settings.nightModeEnd}
                  onChange={(e) => onUpdate({ nightModeEnd: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Night Appearance Controls */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Night Appearance Preferences
              </span>

              {/* Night Tint Picker */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-300 font-semibold">Low-Emission Tint:</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'crimson', name: 'Crimson Red', color: '#EF4444' },
                    { id: 'sunset-amber', name: 'Warm Amber', color: '#F59E0B' },
                    { id: 'warm-white', name: 'Warm White', color: '#F8FAFC' },
                    { id: 'mint', name: 'Dim Emerald', color: '#10B981' },
                  ].map((tint) => (
                    <button
                      key={tint.id}
                      onClick={() => onUpdate({ nightModeTint: tint.id as ClockColorId })}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        settings.nightModeTint === tint.id
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                          : 'opacity-65 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: tint.color }}
                      title={tint.name}
                    />
                  ))}
                </div>
              </div>

              {/* Night Dimmer */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Night Dimmer Level:</span>
                  <span className="font-mono text-zinc-400">
                    {Math.round(settings.nightModeDimmer * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.65"
                  step="0.05"
                  value={settings.nightModeDimmer}
                  onChange={(e) => onUpdate({ nightModeDimmer: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Circadian distraction toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    onUpdate({ nightModeSuppressSeconds: !settings.nightModeSuppressSeconds })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.nightModeSuppressSeconds
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Seconds: {settings.nightModeSuppressSeconds ? 'Suppressed' : 'Visible'}
                </button>

                <button
                  onClick={() =>
                    onUpdate({ nightModeMinimalDate: !settings.nightModeMinimalDate })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.nightModeMinimalDate
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Date: {settings.nightModeMinimalDate ? 'Minimal' : 'Full'}
                </button>
              </div>
            </div>

            {/* Hardware note alert */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Note: In-app dimming applies within the web application. To adjust your phone's
                physical backlight, use your device's native hardware brightness controls.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SAVED PRESETS */}
        {/* ============================================================ */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-rose-400" />
                  <span>Favorite Presets</span>
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Switch full visual setups with 1 tap or save your current look
                </p>
              </div>

              {!isCreatingPreset && (
                <button
                  onClick={() => setIsCreatingPreset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Current</span>
                </button>
              )}
            </div>

            {/* Save New Preset Drawer */}
            {isCreatingPreset && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/20 flex flex-col gap-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-white">Save Current Setup as Preset</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. My Bedside Setup"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-white"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCurrentAsPreset}
                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPreset(false);
                      setNewPresetName('');
                    }}
                    className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Presets List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((p) => {
                const isSelected =
                  settings.face === p.face &&
                  settings.bgTheme === p.bgTheme &&
                  settings.clockColor === p.clockColor;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all relative ${
                      isSelected
                        ? 'border-white bg-white/10 shadow-lg'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {editingPresetId === p.id ? (
                        <div className="flex items-center gap-1.5 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingPresetName}
                            onChange={(e) => setEditingPresetName(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-black border border-white/30 text-white text-xs font-semibold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenamePreset(p.id)}
                            className="p-1 rounded bg-white text-black text-xs font-bold"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{p.name}</span>
                          {p.isBuiltIn && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-white/10 text-zinc-400">
                              Built-in
                            </span>
                          )}
                        </div>
                      )}

                      {!p.isBuiltIn && editingPresetId !== p.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPresetId(p.id);
                              setEditingPresetName(p.name);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeletePreset(p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 capitalize">
                        {p.face.replace('-', ' ')} • {p.bgTheme.replace('-', ' ')}
                      </span>

                      <button
                        onClick={() => handleApplyPreset(p)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: DISPLAY & DEVICE CONTROLS */}
        {/* ============================================================ */}
        {activeTab === 'display' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Screen Dimmer */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300 font-bold">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <span>Bedside Screen Dimmer</span>
                </div>
                <span className="font-mono text-zinc-400">
                  {Math.round(settings.dimmer * 100)}%
                </span>
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

            {/* Orientation and Viewport options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Forced 90deg Landscape */}
              <button
                onClick={() => onUpdate({ forcedLandscape: !settings.forcedLandscape })}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  settings.forcedLandscape
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 text-left">
                  <RotateCw className="w-4 h-4" />
                  <div>
                    <span className="block text-xs font-bold text-white">
                      Forced 90° Landscape
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Ideal for mobile bedside docks
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold">
                  {settings.forcedLandscape ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* PWA Cache & Offline Status Pill */}
              <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <span className="block text-xs font-bold text-white">
                      {isOnline ? 'PWA Offline Cache Active' : 'Offline Mode Active'}
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Works 100% without network
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Safe Area & Gestures Guide */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-1.5 text-xs text-zinc-400">
              <span className="font-bold text-zinc-300">Gesture & Keyboard Shortcuts:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-400">
                <li>Swipe Left / Right: cycle through all 9 clock faces</li>
                <li>Tap screen / move mouse: reveal hidden controls</li>
                <li>Keys 1–9: jump directly to clock face 1 through 9</li>
                <li>Key S: open/close settings sheet • Key F: fullscreen toggle</li>
                <li>Spacebar: cycle accent colors</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Actions: Restore Defaults & Done */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
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
