import { ClockSettings, UserPreset } from '../types';

export const BUILT_IN_PRESETS: UserPreset[] = [
  {
    id: 'preset-midnight-calm',
    name: 'Midnight Calm',
    isBuiltIn: true,
    face: 'standby-digital',
    bgTheme: 'deep-ocean',
    clockColor: 'lavender',
    fontStyle: 'modern',
    dimmer: 0.75,
    bgSpeed: 'slow',
    bgIntensity: 'medium',
    glowStrength: 'subtle',
    numeralSize: 'large',
  },
  {
    id: 'preset-neon-dreams',
    name: 'Neon Dreams',
    isBuiltIn: true,
    face: 'neon-cyber',
    bgTheme: 'midnight-nebula',
    clockColor: 'electric-cyan',
    fontStyle: 'cyber',
    dimmer: 0.95,
    bgSpeed: 'normal',
    bgIntensity: 'high',
    glowStrength: 'vibrant',
    numeralSize: 'large',
  },
  {
    id: 'preset-aurora-night',
    name: 'Aurora Night',
    isBuiltIn: true,
    face: 'aurora-digital',
    bgTheme: 'aurora-borealis',
    clockColor: 'mint',
    fontStyle: 'modern',
    dimmer: 0.9,
    bgSpeed: 'slow',
    bgIntensity: 'medium',
    glowStrength: 'subtle',
    numeralSize: 'large',
  },
  {
    id: 'preset-warm-sunset',
    name: 'Warm Sunset',
    isBuiltIn: true,
    face: 'retro-flip',
    bgTheme: 'sunset-horizon',
    clockColor: 'sunset-amber',
    fontStyle: 'modern',
    dimmer: 0.85,
    bgSpeed: 'normal',
    bgIntensity: 'medium',
    glowStrength: 'subtle',
    numeralSize: 'standard',
  },
  {
    id: 'preset-pure-black',
    name: 'Pure Black',
    isBuiltIn: true,
    face: 'standby-digital',
    bgTheme: 'oled-black',
    clockColor: 'crimson',
    fontStyle: 'modern',
    dimmer: 0.6,
    bgSpeed: 'normal',
    bgIntensity: 'low',
    glowStrength: 'subtle',
    numeralSize: 'large',
  },
];

export const DEFAULT_SETTINGS: ClockSettings = {
  face: 'standby-digital',
  clockColor: 'sunset-amber',
  fontStyle: 'modern',
  is24Hour: false,
  showDate: true,
  showSeconds: false,
  dimmer: 1.0,
  forcedLandscape: false,
  numeralSize: 'large',
  glowStrength: 'subtle',

  // Background Studio Defaults
  bgTheme: 'oled-black',
  bgAnimationEnabled: true,
  bgSpeed: 'normal',
  bgIntensity: 'medium',
  particleDensity: 'medium',
  bgBlur: false,
  customBgColor: '#0a0a14',
  customBgColorSecondary: '#160d2b',
  bgBrightness: 1.0,
  reduceMotion: false,

  // World Clock Defaults
  worldClockCity: 'Tokyo',
  worldClockTimezone: 'Asia/Tokyo',
  showSecondaryClock: true,

  // Intelligent Night Mode Defaults
  nightModeEnabled: false,
  nightModeStart: '22:00',
  nightModeEnd: '07:00',
  nightModeTint: 'crimson',
  nightModeDimmer: 0.35,
  nightModeSuppressSeconds: true,
  nightModeMinimalDate: true,
  nightModeManual: null,
};

const STORAGE_KEY = 'clockdock_v3_settings';
const PRESETS_STORAGE_KEY = 'clockdock_v3_presets';

export function loadSettings(): ClockSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('clockdock_v2_settings');
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    
    // Map any legacy theme IDs to new background theme IDs if needed
    let bgTheme = parsed.bgTheme || DEFAULT_SETTINGS.bgTheme;
    if (bgTheme === 'midnight-blue') bgTheme = 'deep-ocean';
    if (bgTheme === 'deep-purple') bgTheme = 'midnight-nebula';
    if (bgTheme === 'forest-green') bgTheme = 'aurora-borealis';
    if (bgTheme === 'sunset-gradient') bgTheme = 'sunset-horizon';
    if (bgTheme === 'warm-ember') bgTheme = 'sunset-horizon';
    if (bgTheme === 'aurora') bgTheme = 'aurora-borealis';

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bgTheme,
    };
  } catch (err) {
    console.warn('Failed to load ClockDock settings from localStorage:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ClockSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save ClockDock settings to localStorage:', err);
  }
}

export function resetSettings(): ClockSettings {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('clockdock_v2_settings');
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_SETTINGS };
}

// Preset management
export function loadUserPresets(): UserPreset[] {
  if (typeof window === 'undefined') return BUILT_IN_PRESETS;

  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return BUILT_IN_PRESETS;
    const userCustom: UserPreset[] = JSON.parse(raw);
    // Combine built-in with user-saved presets
    return [...BUILT_IN_PRESETS, ...userCustom];
  } catch (err) {
    console.warn('Failed to load user presets from localStorage:', err);
    return BUILT_IN_PRESETS;
  }
}

export function saveUserPresets(presets: UserPreset[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Only store custom non-builtin presets in localStorage
    const customOnly = presets.filter((p) => !p.isBuiltIn);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.warn('Failed to save user presets to localStorage:', err);
  }
}

/**
 * Intelligent Night Mode Schedule Checker
 * Evaluates whether current local device time falls within configured night schedule.
 * Accurately handles schedules crossing midnight (e.g. 22:00 -> 07:00).
 */
export function isNightScheduleActive(
  now: Date,
  start: string,
  end: string
): boolean {
  try {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(':').map((v) => parseInt(v, 10));
    const [endH, endM] = end.split(':').map((v) => parseInt(v, 10));

    const startTotal = (isNaN(startH) ? 22 : startH) * 60 + (isNaN(startM) ? 0 : startM);
    const endTotal = (isNaN(endH) ? 7 : endH) * 60 + (isNaN(endM) ? 0 : endM);

    if (startTotal === endTotal) {
      return false;
    }

    if (startTotal < endTotal) {
      // Schedule within same day, e.g. 01:00 -> 06:00
      return currentMinutes >= startTotal && currentMinutes < endTotal;
    } else {
      // Schedule crosses midnight, e.g. 22:00 -> 07:00
      return currentMinutes >= startTotal || currentMinutes < endTotal;
    }
  } catch {
    return false;
  }
}
