import React, { useState, useEffect, useRef } from 'react';
import {
  ClockSettings,
  AnimationSpeed,
  EffectIntensity,
  ParticleDensity,
  NumeralSize,
  NumeralSpacing,
  ClockAlignment,
  GlowStrength,
  ShadowIntensity,
  TransitionStyle,
  ClockColorId,
  UserPreset,
  SleepScheduleMode,
} from '../types';
import {
  BACKGROUND_THEMES,
  CLOCK_COLORS,
  TYPOGRAPHY_STYLES,
  CLOCK_FACES,
  WORLD_CITIES,
  getColor,
  getTypography,
} from '../utils/themes';
import {
  loadUserPresets,
  saveUserPresets,
} from '../utils/storage';
import {
  parseImportedPresets,
  downloadPresetsAsJson,
} from '../utils/presets';
import {
  POPULAR_WEATHER_CITIES,
  searchCities,
  getCurrentDevicePosition,
  formatTemperature,
} from '../utils/weather';
import {
  WeatherData,
  GeocodingResult,
} from '../types';
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
  Info,
  CalendarRange,
  Eye,
  Download,
  Upload,
  Copy,
  SlidersHorizontal,
  Film,
  MoveVertical,
  AlignJustify,
  FileText,
  AlertTriangle,
  CloudSun,
  Navigation,
  Search,
  RefreshCw,
} from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onUpdate: (partial: Partial<ClockSettings>) => void;
  onReset: () => void;
  isSleepModeActive: boolean;
  isOverrideActive: boolean;
  nextTransition: Date | null;
  onToggleSleepManual: () => void;
  currentTime: Date;
  onShowToast: (msg: string) => void;
  weather?: WeatherData | null;
  onRefreshWeather?: () => void;
}

type SettingsTab = 'studio' | 'wallpaper' | 'sleep' | 'presets' | 'dock' | 'weather';

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReset,
  isSleepModeActive,
  isOverrideActive,
  nextTransition,
  onToggleSleepManual,
  currentTime,
  onShowToast,
  weather,
  onRefreshWeather,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('studio');

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

  // Delete preset confirmation state
  const [presetToDelete, setPresetToDelete] = useState<UserPreset | null>(null);

  // Import preset modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live Studio Preview visibility toggle
  const [showLiveStudioPreview, setShowLiveStudioPreview] = useState(true);

  // Live Sleep Preview visibility toggle
  const [isPreviewingSleep, setIsPreviewingSleep] = useState(false);

  // Phase 4: Weather Settings State
  const [citySearchInput, setCitySearchInput] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<GeocodingResult[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchInput.trim()) return;
    setIsSearchingCities(true);
    const results = await searchCities(citySearchInput.trim());
    setCitySearchResults(results);
    setIsSearchingCities(false);
    if (results.length === 0) {
      onShowToast('No matching locations found');
    }
  };

  const handleSelectGeocodingResult = (result: GeocodingResult) => {
    const displayName = result.country ? `${result.name}, ${result.country}` : result.name;
    onUpdate({
      weatherCity: displayName,
      weatherLatitude: result.latitude,
      weatherLongitude: result.longitude,
      weatherUseGeolocation: false,
    });
    setCitySearchResults([]);
    setCitySearchInput('');
    onShowToast(`Location set to ${displayName}`);
  };

  const handleDetectDeviceLocation = async () => {
    setIsLocatingDevice(true);
    const pos = await getCurrentDevicePosition();
    setIsLocatingDevice(false);
    if (pos) {
      onUpdate({
        weatherCity: 'Current Location',
        weatherLatitude: pos.latitude,
        weatherLongitude: pos.longitude,
        weatherUseGeolocation: true,
      });
      onShowToast('Updated to device coordinates');
    } else {
      onShowToast('Location permission denied or unavailable');
    }
  };

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
      ...(preset.numeralSpacing && { numeralSpacing: preset.numeralSpacing }),
      ...(preset.clockAlignment && { clockAlignment: preset.clockAlignment }),
      ...(preset.shadowIntensity && { shadowIntensity: preset.shadowIntensity }),
      ...(preset.transitionStyle && { transitionStyle: preset.transitionStyle }),
      ...(preset.showDate !== undefined && { showDate: preset.showDate }),
      ...(preset.showSeconds !== undefined && { showSeconds: preset.showSeconds }),
      ...(preset.customClockColor !== undefined && { customClockColor: preset.customClockColor }),
      ...(preset.customClockColorSecondary !== undefined && {
        customClockColorSecondary: preset.customClockColorSecondary,
      }),
    });

    if (isSleepModeActive) {
      onShowToast(`Preset "${preset.name}" saved to daytime configuration (Sleep Mode active)`);
    } else {
      onShowToast(`Applied preset "${preset.name}"`);
    }
  };

  // Save current configuration as new preset
  const handleSaveCurrentAsPreset = () => {
    const trimmed = newPresetName.trim();
    if (!trimmed) return;

    if (presets.length >= 45) {
      onShowToast('Preset limit reached (maximum 45 presets)');
      return;
    }

    const newPreset: UserPreset = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      isBuiltIn: false,
      face: settings.face,
      bgTheme: settings.bgTheme,
      clockColor: settings.clockColor,
      customClockColor: settings.customClockColor,
      customClockColorSecondary: settings.customClockColorSecondary,
      fontStyle: settings.fontStyle,
      dimmer: settings.dimmer,
      bgSpeed: settings.bgSpeed,
      bgIntensity: settings.bgIntensity,
      particleDensity: settings.particleDensity,
      glowStrength: settings.glowStrength,
      numeralSize: settings.numeralSize,
      numeralSpacing: settings.numeralSpacing,
      clockAlignment: settings.clockAlignment,
      shadowIntensity: settings.shadowIntensity,
      transitionStyle: settings.transitionStyle,
      showDate: settings.showDate,
      showSeconds: settings.showSeconds,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    saveUserPresets(updated);
    setNewPresetName('');
    setIsCreatingPreset(false);
    onShowToast(`Saved preset "${trimmed}"`);
  };

  // Duplicate an existing preset
  const handleDuplicatePreset = (preset: UserPreset) => {
    if (presets.length >= 45) {
      onShowToast('Preset limit reached (maximum 45 presets)');
      return;
    }

    const copyName = `${preset.name} (Copy)`.slice(0, 40);
    const duplicated: UserPreset = {
      ...preset,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: copyName,
      isBuiltIn: false,
    };

    const updated = [...presets, duplicated];
    setPresets(updated);
    saveUserPresets(updated);
    onShowToast(`Duplicated as "${copyName}"`);
  };

  // Delete a custom preset after confirmation
  const handleConfirmDeletePreset = () => {
    if (!presetToDelete) return;
    const updated = presets.filter((p) => p.id !== presetToDelete.id);
    setPresets(updated);
    saveUserPresets(updated);
    onShowToast(`Deleted preset "${presetToDelete.name}"`);
    setPresetToDelete(null);
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
    onShowToast('Preset renamed');
  };

  // Export a single preset
  const handleExportSinglePreset = (preset: UserPreset) => {
    downloadPresetsAsJson(preset, `clockdock-${preset.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    onShowToast(`Exported preset "${preset.name}"`);
  };

  // Copy preset JSON to clipboard
  const handleCopyPresetJson = (preset: UserPreset) => {
    const jsonStr = JSON.stringify(preset, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        onShowToast(`Copied "${preset.name}" JSON to clipboard`);
      });
    } else {
      onShowToast('Clipboard unavailable on this browser');
    }
  };

  // Export all presets
  const handleExportAllPresets = () => {
    downloadPresetsAsJson(presets, 'clockdock-all-presets.json');
    onShowToast(`Exported all ${presets.length} presets`);
  };

  // Import JSON file or text
  const handleProcessImportText = (text: string) => {
    setImportError(null);
    const result = parseImportedPresets(text);
    if (!result.success) {
      setImportError(result.error);
      return;
    }

    // Add imported presets to collection, preventing duplicates by unique IDs
    const updated = [...presets];
    let addedCount = 0;
    for (const imp of result.presets) {
      if (updated.length < 45) {
        updated.push(imp);
        addedCount++;
      }
    }

    setPresets(updated);
    saveUserPresets(updated);
    setIsImportModalOpen(false);
    setImportJsonText('');
    onShowToast(`Successfully imported ${addedCount} preset(s)`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 65536) {
      setImportError('File size exceeds maximum limit of 64 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessImportText(content);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };

  // Format transition time cleanly
  const formattedNextTransition = nextTransition
    ? nextTransition.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  // Live Studio Preview calculations
  const effectiveColor = getColor(
    settings.clockColor,
    settings.customClockColor,
    settings.customClockColorSecondary
  );
  const activeTypography = getTypography(settings.fontStyle);
  const liveHours = currentTime.getHours() % (settings.is24Hour ? 24 : 12) || (settings.is24Hour ? 0 : 12);
  const liveMinutes = currentTime.getMinutes().toString().padStart(2, '0');
  const liveSeconds = currentTime.getSeconds().toString().padStart(2, '0');

  // Sleep preview values
  const sleepTintColor = getColor(settings.sleepTint);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#0b0c10]/95 border border-white/10 p-4 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto no-scrollbar flex flex-col gap-5 select-text touch-auto"
      >
        {/* Header with Offline Status & Sleep Mode indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
              <h2 className="text-xl font-black text-white tracking-tight">ClockDock Studio</h2>

              {/* Sleep Mode Active Pill */}
              {isSleepModeActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-rose-500/40 bg-rose-500/15 text-rose-300">
                  <Moon className="w-3 h-3 text-rose-400" />
                  <span>Sleep Mode Active</span>
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
              Clock Design Studio, visual presets, cinematic transitions & adaptive sleep mode
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
            title="Close Settings (Escape or S)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Pill Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-black/50 border border-white/10 rounded-2xl">
          {[
            { id: 'studio', label: 'Design Studio', icon: SlidersHorizontal },
            { id: 'wallpaper', label: 'Wallpaper', icon: Sparkles },
            { id: 'sleep', label: 'Sleep Mode', icon: Moon },
            { id: 'presets', label: 'Presets', icon: Bookmark },
            { id: 'dock', label: 'Smart Dock', icon: Sliders },
            { id: 'weather', label: 'Weather', icon: CloudSun },
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
        {/* TAB 1: CLOCK DESIGN STUDIO (PHASE 2) */}
        {/* ============================================================ */}
        {activeTab === 'studio' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Live Interactive Miniature Preview Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/15 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Live Studio Preview</span>
                </span>

                <button
                  onClick={() => setShowLiveStudioPreview((p) => !p)}
                  className="text-[11px] text-zinc-400 hover:text-white underline font-medium"
                >
                  {showLiveStudioPreview ? 'Collapse Preview' : 'Expand Preview'}
                </button>
              </div>

              {showLiveStudioPreview && (
                <div
                  className="relative w-full h-32 sm:h-36 rounded-2xl border border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: settings.bgTheme === 'oled-black' ? '#000000' : '#08080f',
                    filter: `brightness(${settings.dimmer})`,
                  }}
                >
                  <div className={`flex flex-col items-center ${activeTypography.className}`}>
                    {/* Live preview complication */}
                    {settings.showDate && (
                      <span
                        className="text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1"
                        style={{ color: effectiveColor.secondary }}
                      >
                        {currentTime.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}

                    {/* Live preview digits */}
                    <div
                      className="flex items-center font-black text-4xl sm:text-5xl leading-none"
                      style={{
                        letterSpacing:
                          settings.numeralSpacing === 'tight'
                            ? '-0.07em'
                            : settings.numeralSpacing === 'wide'
                            ? '0.08em'
                            : '-0.02em',
                      }}
                    >
                      <span
                        style={{
                          color: effectiveColor.primary,
                          textShadow:
                            settings.glowStrength === 'vibrant'
                              ? `0 0 25px ${effectiveColor.glow}`
                              : settings.glowStrength === 'subtle'
                              ? `0 0 14px ${effectiveColor.dimGlow}`
                              : 'none',
                        }}
                      >
                        {liveHours}
                      </span>
                      <span style={{ color: effectiveColor.secondary }} className="mx-1 animate-pulse">
                        :
                      </span>
                      <span
                        style={{
                          color: effectiveColor.secondary,
                          textShadow:
                            settings.glowStrength === 'vibrant'
                              ? `0 0 25px ${effectiveColor.glow}`
                              : settings.glowStrength === 'subtle'
                              ? `0 0 14px ${effectiveColor.dimGlow}`
                              : 'none',
                        }}
                      >
                        {liveMinutes}
                      </span>

                      {settings.showSeconds && (
                        <span
                          className="text-xs sm:text-sm font-mono ml-1.5 opacity-80"
                          style={{ color: effectiveColor.primary }}
                        >
                          {liveSeconds}
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] text-zinc-500 font-mono mt-1 capitalize">
                      {settings.face.replace('-', ' ')} • {settings.fontStyle}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* A. Clock Face Collection */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Clock Face ({CLOCK_FACES.length})</span>
                </span>
                <span className="text-[11px] text-zinc-500">Tap to switch face</span>
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

            {/* B. Typography & Proportions */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-zinc-400" />
                <span>Typography & Proportions</span>
              </span>

              {/* Typography presets */}
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

              {/* Numeral Size, Numeral Spacing & Clock Alignment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Numeral Size */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Numeral Size
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['standard', 'large', 'xlarge'] as NumeralSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onUpdate({ numeralSize: sz })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                          settings.numeralSize === sz
                            ? 'bg-white text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sz === 'xlarge' ? 'XL' : sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numeral Spacing */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <AlignJustify className="w-3 h-3" />
                    <span>Numeral Spacing</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['tight', 'normal', 'wide'] as NumeralSpacing[]).map((sp) => (
                      <button
                        key={sp}
                        onClick={() => onUpdate({ numeralSpacing: sp })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                          settings.numeralSpacing === sp
                            ? 'bg-white text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clock Alignment */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <MoveVertical className="w-3 h-3" />
                    <span>Clock Alignment</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['top', 'center', 'bottom'] as ClockAlignment[]).map((al) => (
                      <button
                        key={al}
                        onClick={() => onUpdate({ clockAlignment: al })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                          settings.clockAlignment === al
                            ? 'bg-white text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {al}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* C. Colors, Glow & Shadows */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                <span>Colors & Lighting</span>
              </span>

              {/* Curated Color Swatches */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-black/40 border border-zinc-800">
                {CLOCK_COLORS.map((c) => {
                  const isSelected = settings.clockColor === c.id && !settings.customClockColor;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onUpdate({ clockColor: c.id, customClockColor: '' })}
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

              {/* Custom Primary & Secondary Hex Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-zinc-300 font-semibold">Custom Primary:</label>
                    <input
                      type="color"
                      value={settings.customClockColor || effectiveColor.primary}
                      onChange={(e) => onUpdate({ customClockColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  {settings.customClockColor && (
                    <button
                      onClick={() => onUpdate({ customClockColor: '' })}
                      className="text-[10px] text-zinc-500 hover:text-white underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-zinc-300 font-semibold">Custom Secondary:</label>
                    <input
                      type="color"
                      value={settings.customClockColorSecondary || effectiveColor.secondary}
                      onChange={(e) => onUpdate({ customClockColorSecondary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  {settings.customClockColorSecondary && (
                    <button
                      onClick={() => onUpdate({ customClockColorSecondary: '' })}
                      className="text-[10px] text-zinc-500 hover:text-white underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Glow Intensity & Shadow Depth Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Glow Intensity */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Glow Intensity
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['off', 'subtle', 'vibrant'] as GlowStrength[]).map((glow) => (
                      <button
                        key={glow}
                        onClick={() => onUpdate({ glowStrength: glow })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
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

                {/* Shadow Intensity */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Shadow Depth
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800">
                    {(['none', 'soft', 'deep'] as ShadowIntensity[]).map((sh) => (
                      <button
                        key={sh}
                        onClick={() => onUpdate({ shadowIntensity: sh })}
                        className={`py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                          settings.shadowIntensity === sh
                            ? 'bg-white text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* D. Cinematic Transitions & Complications */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-zinc-400" />
                <span>Cinematic Transitions & Complications</span>
              </span>

              {/* Transition Style Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Clock Face Transition Style
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-zinc-800">
                  {[
                    { id: 'smooth', label: 'Smooth Fade' },
                    { id: 'slide', label: 'Cinematic Slide' },
                    { id: 'scale', label: 'Soft Scale' },
                    { id: 'minimal', label: 'Minimal / Instant' },
                  ].map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => onUpdate({ transitionStyle: tr.id as TransitionStyle })}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all ${
                        settings.transitionStyle === tr.id
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complications: 12/24H, Date, Seconds */}
              <div className="grid grid-cols-3 gap-2 pt-1">
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

              {/* World Clock Companion (Shown when modern-world is active) */}
              {settings.face === 'modern-world' && (
                <div className="p-3.5 rounded-xl bg-black/40 border border-sky-500/30 flex flex-col gap-2 mt-1">
                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Secondary World City</span>
                  </span>
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
                    className="w-full px-3 py-2 rounded-xl bg-black/80 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-sky-400"
                  >
                    {WORLD_CITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.country}) — {c.timezone}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WALLPAPER STUDIO (DAYTIME BACKGROUNDS) */}
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
        {/* TAB 3: ADAPTIVE SLEEP MODE (PHASE 1) */}
        {/* ============================================================ */}
        {activeTab === 'sleep' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Master Control Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-rose-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-rose-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">Adaptive Sleep Mode</h3>
                    <p className="text-[11px] text-zinc-400">
                      Circadian bedside automation with independent nighttime appearance
                    </p>
                  </div>
                </div>

                {/* Master Auto-Schedule Toggle */}
                <button
                  onClick={() => onUpdate({ sleepModeEnabled: !settings.sleepModeEnabled })}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    settings.sleepModeEnabled
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {settings.sleepModeEnabled ? 'Schedule Enabled' : 'Schedule Off'}
                </button>
              </div>

              {/* Manual Override Action with Contextual Explanation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-white/10">
                <div className="text-xs">
                  <span className="font-semibold text-zinc-300">
                    Status:{' '}
                    {isSleepModeActive ? (
                      <span className="text-rose-400 font-bold">🌙 Sleep Mode Active</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">☀️ Daytime Active</span>
                    )}
                  </span>
                  {isOverrideActive && (
                    <span className="text-[11px] text-amber-300 ml-2 font-mono">
                      (Manual Override)
                    </span>
                  )}
                  {formattedNextTransition && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Next transition: {formattedNextTransition}
                    </p>
                  )}
                </div>

                <button
                  onClick={onToggleSleepManual}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all shadow ${
                    isSleepModeActive
                      ? 'border-rose-400 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isSleepModeActive ? 'Exit Sleep Mode Manually' : 'Activate Sleep Mode Now'}
                </button>
              </div>
            </div>

            {/* Schedule Configuration Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Bedtime & Wake Schedule</span>
                </span>

                {/* Daily vs Weekday/Weekend selector */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['daily', 'weekday_weekend'] as SleepScheduleMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onUpdate({ sleepScheduleMode: mode })}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        settings.sleepScheduleMode === mode
                          ? 'bg-white text-black shadow'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode === 'daily' ? 'Daily' : 'Weekday / Weekend'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode: Daily Schedule */}
              {settings.sleepScheduleMode === 'daily' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      Night Bedtime (Daily):
                    </label>
                    <input
                      type="time"
                      value={settings.sleepStart}
                      onChange={(e) => onUpdate({ sleepStart: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      Morning Wake-Up (Daily):
                    </label>
                    <input
                      type="time"
                      value={settings.sleepEnd}
                      onChange={(e) => onUpdate({ sleepEnd: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              )}

              {/* Mode: Separate Weekday vs Weekend */}
              {settings.sleepScheduleMode === 'weekday_weekend' && (
                <div className="flex flex-col gap-3 pt-1">
                  {/* Weekday */}
                  <div className="p-3 rounded-xl bg-black/30 border border-zinc-800 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-zinc-300">
                      Weekday Schedule (Sunday night – Thursday night):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400">Bedtime</span>
                        <input
                          type="time"
                          value={settings.sleepStartWeekday}
                          onChange={(e) => onUpdate({ sleepStartWeekday: e.target.value })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400">Wake-Up</span>
                        <input
                          type="time"
                          value={settings.sleepEndWeekday}
                          onChange={(e) => onUpdate({ sleepEndWeekday: e.target.value })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekend */}
                  <div className="p-3 rounded-xl bg-black/30 border border-zinc-800 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-zinc-300">
                      Weekend Schedule (Friday night & Saturday night):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400">Bedtime</span>
                        <input
                          type="time"
                          value={settings.sleepStartWeekend}
                          onChange={(e) => onUpdate({ sleepStartWeekend: e.target.value })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-400">Wake-Up</span>
                        <input
                          type="time"
                          value={settings.sleepEndWeekend}
                          onChange={(e) => onUpdate({ sleepEndWeekend: e.target.value })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-700 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Nighttime Appearance (Configured Independently from Daytime!) */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Dedicated Night Appearance</span>
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Your daytime clock face and theme remain completely preserved and restore upon wake-up.
                  </p>
                </div>

                <button
                  onClick={() => setIsPreviewingSleep((p) => !p)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border flex items-center gap-1 transition-all ${
                    isPreviewingSleep
                      ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{isPreviewingSleep ? 'Hide Preview' : 'Show Live Preview'}</span>
                </button>
              </div>

              {/* Interactive Miniature Live Night Preview Card */}
              {isPreviewingSleep && (
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all animate-fadeIn"
                  style={{
                    backgroundColor: settings.sleepBgTheme === 'oled-black' ? '#000000' : '#08080c',
                    borderColor: `${sleepTintColor.primary}30`,
                    filter: `brightness(${settings.sleepDimmer})`,
                  }}
                >
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
                    NIGHT MODE LIVE PREVIEW
                  </span>
                  <div className="flex items-center gap-1 font-black text-4xl sm:text-5xl font-mono tracking-tight leading-none mt-1">
                    <span style={{ color: sleepTintColor.primary }}>{liveHours}</span>
                    <span style={{ color: sleepTintColor.secondary }} className="animate-pulse">:</span>
                    <span style={{ color: sleepTintColor.primary }}>{liveMinutes}</span>
                  </div>
                  {!settings.sleepMinimalDate && (
                    <span className="text-[10px] font-mono mt-1" style={{ color: sleepTintColor.secondary }}>
                      {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

              {/* Night Clock Tint */}
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
                      onClick={() => onUpdate({ sleepTint: tint.id as ClockColorId })}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        settings.sleepTint === tint.id
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                          : 'opacity-65 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: tint.color }}
                      title={tint.name}
                    />
                  ))}
                </div>
              </div>

              {/* Night Dimmer Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold">Nighttime Dimmer Level:</span>
                  <span className="font-mono text-zinc-400">
                    {Math.round(settings.sleepDimmer * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.65"
                  step="0.05"
                  value={settings.sleepDimmer}
                  onChange={(e) => onUpdate({ sleepDimmer: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Night Distraction Suppression Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onUpdate({ sleepHideSeconds: !settings.sleepHideSeconds })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.sleepHideSeconds
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Seconds: {settings.sleepHideSeconds ? 'Suppressed' : 'Visible'}
                </button>

                <button
                  onClick={() => onUpdate({ sleepMinimalDate: !settings.sleepMinimalDate })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.sleepMinimalDate
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Date: {settings.sleepMinimalDate ? 'Minimal' : 'Full'}
                </button>

                <button
                  onClick={() =>
                    onUpdate({ sleepDisableAnimations: !settings.sleepDisableAnimations })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.sleepDisableAnimations
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Animations: {settings.sleepDisableAnimations ? 'Paused' : 'Active'}
                </button>

                <button
                  onClick={() =>
                    onUpdate({
                      sleepGlowStrength: settings.sleepGlowStrength === 'off' ? 'subtle' : 'off',
                    })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.sleepGlowStrength === 'off'
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                  }`}
                >
                  Glow Halos: {settings.sleepGlowStrength === 'off' ? 'Disabled' : 'Subtle'}
                </button>
              </div>
            </div>

            {/* Hardware Note Alert */}
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
        {/* TAB 4: VISUAL PRESETS & SAFE IMPORT / EXPORT (PHASE 2) */}
        {/* ============================================================ */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Header bar with actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-rose-400" />
                  <span>Preset Library ({presets.length})</span>
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Save, duplicate, export, and import complete visual clock themes
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Export All button */}
                <button
                  onClick={handleExportAllPresets}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 bg-black/40 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-white/10 transition-all"
                  title="Export all presets as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All</span>
                </button>

                {/* Import button */}
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 bg-black/40 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-white/10 transition-all"
                  title="Import preset JSON"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>

                {/* Save Current button */}
                {!isCreatingPreset && (
                  <button
                    onClick={() => setIsCreatingPreset(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-all shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Current</span>
                  </button>
                )}
              </div>
            </div>

            {/* Save New Preset Drawer */}
            {isCreatingPreset && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/20 flex flex-col gap-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-white">Save Current Design as Preset</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Minimalist Midnight"
                    value={newPresetName}
                    maxLength={40}
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

            {/* Presets Grid */}
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
                            maxLength={40}
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

                      {/* Preset Action Icons */}
                      <div className="flex items-center gap-0.5">
                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicatePreset(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Duplicate Preset"
                          aria-label={`Duplicate ${p.name}`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Export JSON */}
                        <button
                          onClick={() => handleExportSinglePreset(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Download Preset JSON"
                          aria-label={`Export ${p.name}`}
                        >
                          <Download className="w-3 h-3" />
                        </button>

                        {/* Copy JSON */}
                        <button
                          onClick={() => handleCopyPresetJson(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Copy JSON to clipboard"
                          aria-label={`Copy JSON for ${p.name}`}
                        >
                          <FileText className="w-3 h-3" />
                        </button>

                        {/* Rename (custom only) */}
                        {!p.isBuiltIn && editingPresetId !== p.id && (
                          <button
                            onClick={() => {
                              setEditingPresetId(p.id);
                              setEditingPresetName(p.name);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Rename"
                            aria-label={`Rename ${p.name}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        {/* Delete (custom only) */}
                        {!p.isBuiltIn && (
                          <button
                            onClick={() => setPresetToDelete(p)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Preset"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
        {/* TAB 5: SMART DOCK & DEVICE CONTROLS */}
        {/* ============================================================ */}
        {activeTab === 'dock' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Screen Dimmer */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300 font-bold">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <span>Daytime Bedside Dimmer</span>
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

            {/* Smart Dock Orientation and Viewport Options */}
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
                      Rotates viewport for bedside charging stands
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
                      Runs 100% locally with zero network calls
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

            {/* Smart Dock Interaction Guide */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-1.5 text-xs text-zinc-400">
              <span className="font-bold text-zinc-300">Smart Dock Features & Gestures:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-400">
                <li><strong className="text-zinc-300">Touch to Reveal:</strong> Tap anywhere to show controls; auto-fades after 3.5s idle</li>
                <li><strong className="text-zinc-300">Hover Persistence:</strong> Controls stay visible while pointer interacts with buttons</li>
                <li><strong className="text-zinc-300">Keyboard Shortcuts:</strong> S (Settings), N (Toggle Sleep Mode), F (Fullscreen)</li>
                <li><strong className="text-zinc-300">Face Switching:</strong> Horizontal swipe on screen, Arrow keys, or 1–9</li>
                <li><strong className="text-zinc-300">Safe Area Handling:</strong> Screen adapts automatically around notches & home bars</li>
              </ul>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: WEATHER WIDGET (PHASE 4)                              */}
        {/* ============================================================ */}
        {activeTab === 'weather' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Header info card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <CloudSun className="w-4 h-4" />
                  <span>Bedside Weather Complication</span>
                </div>
                {/* Weather Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => onUpdate({ showWeather: !settings.showWeather })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showWeather ? 'bg-white' : 'bg-white/20'
                  }`}
                  aria-label="Toggle Weather Widget"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      settings.showWeather ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Display a subtle, frosted glass weather pill in the corner of your bedside clock. Powered by Open-Meteo with 100% offline caching and zero tracking.
              </p>
            </div>

            {/* Current Weather Status & Live Cache Card */}
            {weather ? (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">
                      {formatTemperature(weather.temperatureCelsius, settings.weatherUnit)}
                    </span>
                    <span className="text-sm font-semibold text-zinc-300">
                      {weather.condition}
                    </span>
                    {weather.isStale && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Cached Offline
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    {weather.locationName}{' '}
                    {weather.tempHighCelsius !== undefined && weather.tempLowCelsius !== undefined
                      ? `• High: ${formatTemperature(weather.tempHighCelsius, settings.weatherUnit)} / Low: ${formatTemperature(weather.tempLowCelsius, settings.weatherUnit)}`
                      : ''}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Updated {new Date(weather.fetchedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>

                {onRefreshWeather && (
                  <button
                    onClick={onRefreshWeather}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Fetch latest weather"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-xs text-zinc-500">
                  No weather data cached yet. Ensure you are online and select a city below.
                </p>
              </div>
            )}

            {/* Temperature Unit Segmented Control */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdate({ weatherUnit: 'celsius' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    settings.weatherUnit === 'celsius'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ weatherUnit: 'fahrenheit' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    settings.weatherUnit === 'fahrenheit'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>

            {/* Geolocation Button */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Automatic Location
              </label>
              <button
                type="button"
                onClick={handleDetectDeviceLocation}
                disabled={isLocatingDevice}
                className={`w-full py-2.5 px-4 rounded-xl border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  settings.weatherUseGeolocation
                    ? 'bg-sky-500/15 border-sky-400/40 text-sky-300'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocatingDevice ? 'animate-spin' : ''}`} />
                <span>
                  {isLocatingDevice
                    ? 'Requesting device coordinates...'
                    : settings.weatherUseGeolocation
                    ? 'Using Device Coordinates (Active)'
                    : 'Use Device GPS Location (Click to enable)'}
                </span>
              </button>
              <p className="text-[10px] text-zinc-500">
                Location permission is only requested when you click this button. ClockDock never tracks you in the background.
              </p>
            </div>

            {/* Manual City Search */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Search Any City
              </label>
              <form onSubmit={handleCitySearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={citySearchInput}
                    onChange={(e) => setCitySearchInput(e.target.value)}
                    placeholder="Search city (e.g. San Francisco, Berlin, Tokyo)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-black/50 text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingCities || !citySearchInput.trim()}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all disabled:opacity-40"
                >
                  {isSearchingCities ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Search Results Dropdown */}
              {citySearchResults.length > 0 && (
                <div className="p-2 rounded-xl bg-zinc-900 border border-white/15 space-y-1 animate-fadeIn">
                  <span className="text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-wider block">
                    Matching Locations
                  </span>
                  {citySearchResults.map((res, i) => (
                    <button
                      key={`${res.name}-${res.latitude}-${i}`}
                      type="button"
                      onClick={() => handleSelectGeocodingResult(res)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-white/10 hover:text-white flex items-center justify-between"
                    >
                      <span className="font-semibold">{res.name}</span>
                      <span className="text-[10px] text-zinc-400">
                        {res.admin1 ? `${res.admin1}, ` : ''}{res.country || ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Bedside Cities Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Popular Cities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {POPULAR_WEATHER_CITIES.map((c) => {
                  const isSelected =
                    !settings.weatherUseGeolocation &&
                    (settings.weatherCity.toLowerCase().includes(c.name.toLowerCase()) ||
                      (Math.abs(settings.weatherLatitude - c.latitude) < 0.1 &&
                        Math.abs(settings.weatherLongitude - c.longitude) < 0.1));

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        onUpdate({
                          weatherCity: c.name,
                          weatherLatitude: c.latitude,
                          weatherLongitude: c.longitude,
                          weatherUseGeolocation: false,
                        });
                        onShowToast(`Location set to ${c.name}`);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-white bg-white text-black font-bold shadow-md'
                          : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 font-medium'
                      }`}
                    >
                      <div className="truncate">{c.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                        {c.country}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Open-Meteo Attribution & Privacy Note */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
              <strong className="text-zinc-300">Privacy & Data Attribution:</strong> Weather data is provided by{' '}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline hover:text-sky-300"
              >
                Open-Meteo
              </a>{' '}
              under CC BY 4.0 license. No private API keys or personal identifiers are transmitted. Forecasts are cached locally so ClockDock continues to operate reliably while offline.
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

      {/* ============================================================ */}
      {/* CONFIRM DELETE MODAL */}
      {/* ============================================================ */}
      {presetToDelete && (
        <div
          onClick={() => setPresetToDelete(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-5 rounded-2xl bg-[#121218] border border-red-500/30 flex flex-col gap-3 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Delete Preset</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{presetToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setPresetToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePreset}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* IMPORT PRESET MODAL */}
      {/* ============================================================ */}
      {isImportModalOpen && (
        <div
          onClick={() => {
            setIsImportModalOpen(false);
            setImportError(null);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-5 rounded-3xl bg-[#121218] border border-white/20 flex flex-col gap-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Import Presets</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportError(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload a valid <code className="text-zinc-200">.json</code> file or paste exported preset JSON below. Input will be validated against ClockDock schema.
            </p>

            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/30 hover:border-white/60 bg-black/40 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Choose .JSON File from Device</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="flex-1 h-[1px] bg-zinc-800" />
              <span>or paste JSON text</span>
              <div className="flex-1 h-[1px] bg-zinc-800" />
            </div>

            {/* JSON Textarea */}
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setImportError(null);
              }}
              placeholder='Paste JSON here (e.g. {"name": "My Theme", "face": "standby-digital", ...})'
              className="w-full p-2.5 rounded-xl bg-black/60 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
            />

            {/* Error Message */}
            {importError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                {importError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportError(null);
                }}
                className="flex-1 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessImportText(importJsonText)}
                disabled={!importJsonText.trim()}
                className="flex-1 py-2 rounded-xl bg-sky-500 text-black text-xs font-bold hover:bg-sky-400 disabled:opacity-40 disabled:pointer-events-none"
              >
                Validate & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
