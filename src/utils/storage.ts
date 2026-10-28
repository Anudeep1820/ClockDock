import { ClockSettings } from '../types';

export const DEFAULT_SETTINGS: ClockSettings = {
  face: 'standby-digital',
  bgTheme: 'oled-black',
  clockColor: 'sunset-amber',
  fontStyle: 'modern',
  is24Hour: false,
  showDate: true,
  showSeconds: false,
  dimmer: 1.0,
  forcedLandscape: false,
};

const STORAGE_KEY = 'clockdock_v2_settings';

export function loadSettings(): ClockSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
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
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_SETTINGS };
}
