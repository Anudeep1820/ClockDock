import { ClockSettings } from '../types';

export const DEFAULT_SETTINGS: ClockSettings = {
  face: 'standby-digital',
  clockColor: 'sunset-amber',
  fontStyle: 'modern',
  is24Hour: false,
  showDate: true,
  showSeconds: false,
  dimmer: 1.0,
  forcedLandscape: false,

  // Background Studio Defaults
  bgTheme: 'oled-black',
  bgAnimationEnabled: true,
  bgSpeed: 'normal',
  bgIntensity: 'medium',
  particleDensity: 'medium',
  bgBlur: false,
  customBgColor: '#0a0a14',

  // World Clock Defaults
  worldClockCity: 'Tokyo',
  worldClockTimezone: 'Asia/Tokyo',
  showSecondaryClock: true,
};

const STORAGE_KEY = 'clockdock_v3_settings';

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
