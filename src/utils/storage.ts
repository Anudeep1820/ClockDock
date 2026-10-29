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
    numeralSpacing: 'normal',
    clockAlignment: 'center',
    shadowIntensity: 'soft',
    transitionStyle: 'smooth',
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
    numeralSpacing: 'wide',
    clockAlignment: 'center',
    shadowIntensity: 'deep',
    transitionStyle: 'slide',
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
    numeralSpacing: 'normal',
    clockAlignment: 'center',
    shadowIntensity: 'soft',
    transitionStyle: 'scale',
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
    numeralSpacing: 'normal',
    clockAlignment: 'center',
    shadowIntensity: 'deep',
    transitionStyle: 'smooth',
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
    numeralSpacing: 'normal',
    clockAlignment: 'center',
    shadowIntensity: 'soft',
    transitionStyle: 'minimal',
  },
];

export const DEFAULT_SETTINGS: ClockSettings = {
  // Daytime Appearance Defaults (Design Studio)
  face: 'standby-digital',
  clockColor: 'sunset-amber',
  customClockColor: '',
  customClockColorSecondary: '',
  fontStyle: 'modern',
  is24Hour: false,
  showDate: true,
  showSeconds: false,
  dimmer: 1.0,
  forcedLandscape: false,
  numeralSize: 'large',
  numeralSpacing: 'normal',
  clockAlignment: 'center',
  glowStrength: 'subtle',
  shadowIntensity: 'soft',
  transitionStyle: 'smooth',

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

  // Adaptive Sleep Mode Defaults (Phase 1)
  sleepModeEnabled: false,
  sleepScheduleMode: 'daily',
  sleepStart: '22:00',
  sleepEnd: '07:00',
  sleepStartWeekday: '22:30',
  sleepEndWeekday: '06:45',
  sleepStartWeekend: '23:45',
  sleepEndWeekend: '08:30',
  sleepManualOverride: null,

  // Dedicated Nighttime Appearance Defaults
  sleepBgTheme: 'oled-black',
  sleepTint: 'crimson',
  sleepDimmer: 0.30,
  sleepHideSeconds: true,
  sleepMinimalDate: true,
  sleepDisableAnimations: true,
  sleepGlowStrength: 'off',
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

    // Backward-compatible migration from legacy nightMode fields to sleepMode fields
    const sleepModeEnabled =
      parsed.sleepModeEnabled !== undefined
        ? parsed.sleepModeEnabled
        : parsed.nightModeEnabled !== undefined
        ? parsed.nightModeEnabled
        : DEFAULT_SETTINGS.sleepModeEnabled;

    const sleepStart = parsed.sleepStart || parsed.nightModeStart || DEFAULT_SETTINGS.sleepStart;
    const sleepEnd = parsed.sleepEnd || parsed.nightModeEnd || DEFAULT_SETTINGS.sleepEnd;
    const sleepTint = parsed.sleepTint || parsed.nightModeTint || DEFAULT_SETTINGS.sleepTint;
    const sleepDimmer =
      parsed.sleepDimmer !== undefined
        ? parsed.sleepDimmer
        : parsed.nightModeDimmer !== undefined
        ? parsed.nightModeDimmer
        : DEFAULT_SETTINGS.sleepDimmer;
    const sleepHideSeconds =
      parsed.sleepHideSeconds !== undefined
        ? parsed.sleepHideSeconds
        : parsed.nightModeSuppressSeconds !== undefined
        ? parsed.nightModeSuppressSeconds
        : DEFAULT_SETTINGS.sleepHideSeconds;
    const sleepMinimalDate =
      parsed.sleepMinimalDate !== undefined
        ? parsed.sleepMinimalDate
        : parsed.nightModeMinimalDate !== undefined
        ? parsed.nightModeMinimalDate
        : DEFAULT_SETTINGS.sleepMinimalDate;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bgTheme,
      sleepModeEnabled,
      sleepStart,
      sleepEnd,
      sleepTint,
      sleepDimmer,
      sleepHideSeconds,
      sleepMinimalDate,
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
    return [...BUILT_IN_PRESETS, ...userCustom];
  } catch (err) {
    console.warn('Failed to load user presets from localStorage:', err);
    return BUILT_IN_PRESETS;
  }
}

export function saveUserPresets(presets: UserPreset[]): void {
  if (typeof window === 'undefined') return;

  try {
    const customOnly = presets.filter((p) => !p.isBuiltIn);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.warn('Failed to save user presets to localStorage:', err);
  }
}

// -------------------------------------------------------------
// Adaptive Sleep Mode Scheduling Utilities
// -------------------------------------------------------------

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map((v) => parseInt(v, 10));
  const safeH = isNaN(h) ? 22 : h;
  const safeM = isNaN(m) ? 0 : m;
  return safeH * 60 + safeM;
}

/**
 * Checks whether `now` falls in a single scheduled start->end interval anchored at `anchorDate`.
 * Handles intervals crossing midnight cleanly.
 */
function isDateInInterval(now: Date, startStr: string, endStr: string, anchorDate: Date): boolean {
  const startMins = parseTimeToMinutes(startStr);
  const endMins = parseTimeToMinutes(endStr);

  const startDate = new Date(anchorDate);
  startDate.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);

  const endDate = new Date(anchorDate);
  if (startMins < endMins) {
    // Same calendar day interval, e.g. 01:00 -> 06:00
    endDate.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);
  } else {
    // Crosses midnight: finishes on the subsequent day, e.g. 22:00 -> 07:00
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);
  }

  return now >= startDate && now < endDate;
}

/**
 * Evaluates whether natural (un-overridden) sleep mode is active right now based on local time.
 * Supports daily schedule or separate weekday / weekend schedules.
 */
export function isNaturalSleepActive(now: Date, settings: ClockSettings): boolean {
  if (!settings.sleepModeEnabled) return false;

  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (settings.sleepScheduleMode === 'daily') {
    return (
      isDateInInterval(now, settings.sleepStart, settings.sleepEnd, today) ||
      isDateInInterval(now, settings.sleepStart, settings.sleepEnd, yesterday)
    );
  }

  // Weekday / Weekend mode:
  // Friday night & Saturday night use weekend sleep schedule
  const isWeekendNight = (d: Date) => d.getDay() === 5 || d.getDay() === 6;

  const todayStart = isWeekendNight(today) ? settings.sleepStartWeekend : settings.sleepStartWeekday;
  const todayEnd = isWeekendNight(today) ? settings.sleepEndWeekend : settings.sleepEndWeekday;

  const yestStart = isWeekendNight(yesterday)
    ? settings.sleepStartWeekend
    : settings.sleepStartWeekday;
  const yestEnd = isWeekendNight(yesterday) ? settings.sleepEndWeekend : settings.sleepEndWeekday;

  return (
    isDateInInterval(now, todayStart, todayEnd, today) ||
    isDateInInterval(now, yestStart, yestEnd, yesterday)
  );
}

/**
 * Returns the nearest upcoming scheduled transition boundary (sleep start or wake end).
 */
export function getNextScheduledTransition(
  now: Date,
  settings: ClockSettings
): { type: 'sleep_start' | 'sleep_end'; time: Date } | null {
  if (!settings.sleepModeEnabled) return null;

  const candidates: { type: 'sleep_start' | 'sleep_end'; time: Date }[] = [];

  for (let offset = -1; offset <= 2; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);

    let startStr: string;
    let endStr: string;

    if (settings.sleepScheduleMode === 'daily') {
      startStr = settings.sleepStart;
      endStr = settings.sleepEnd;
    } else {
      const isWeekendNight = d.getDay() === 5 || d.getDay() === 6;
      startStr = isWeekendNight ? settings.sleepStartWeekend : settings.sleepStartWeekday;
      endStr = isWeekendNight ? settings.sleepEndWeekend : settings.sleepEndWeekday;
    }

    const startMins = parseTimeToMinutes(startStr);
    const endMins = parseTimeToMinutes(endStr);

    const startObj = new Date(d);
    startObj.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);

    const endObj = new Date(d);
    if (startMins >= endMins) {
      endObj.setDate(endObj.getDate() + 1);
    }
    endObj.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

    if (startObj > now) candidates.push({ type: 'sleep_start', time: startObj });
    if (endObj > now) candidates.push({ type: 'sleep_end', time: endObj });
  }

  candidates.sort((a, b) => a.time.getTime() - b.time.getTime());
  return candidates[0] || null;
}

/**
 * Computes the final effective Sleep Mode state taking into account:
 * 1. Natural schedule (daily or weekday/weekend)
 * 2. Manual override and its expiration on the next scheduled transition boundary
 */
export function computeEffectiveSleepMode(
  now: Date,
  settings: ClockSettings
): {
  isSleepActive: boolean;
  overrideActive: boolean;
  nextTransition: Date | null;
  expiredOverrideToClear: boolean;
} {
  const naturalActive = isNaturalSleepActive(now, settings);
  const nextScheduled = getNextScheduledTransition(now, settings);

  const override = settings.sleepManualOverride;

  if (override) {
    // Check if the override has expired because the scheduled transition was reached
    if (now.getTime() >= override.expiresAt) {
      return {
        isSleepActive: naturalActive,
        overrideActive: false,
        nextTransition: nextScheduled ? nextScheduled.time : null,
        expiredOverrideToClear: true,
      };
    }

    return {
      isSleepActive: override.targetState,
      overrideActive: true,
      nextTransition: new Date(override.expiresAt),
      expiredOverrideToClear: false,
    };
  }

  return {
    isSleepActive: naturalActive,
    overrideActive: false,
    nextTransition: nextScheduled ? nextScheduled.time : null,
    expiredOverrideToClear: false,
  };
}
