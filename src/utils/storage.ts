import {
  ClockSettings,
  UserPreset,
  AlarmItem,
  TimerState,
  StopwatchState,
  WeatherData,
  ClockFaceId,
  BackgroundThemeId,
  ClockColorId,
} from '../types';

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

  // Weather Defaults (Phase 4)
  showWeather: true,
  weatherUnit: 'celsius',
  weatherCity: 'New York',
  weatherLatitude: 40.7128,
  weatherLongitude: -74.0060,
  weatherUseGeolocation: false,
};

const STORAGE_KEY = 'clockdock_v3_settings';
const PRESETS_STORAGE_KEY = 'clockdock_v3_presets';

// In-memory fallback caches if localStorage is unavailable or throws QuotaExceededError
let memorySettingsCache: ClockSettings | null = null;
let memoryPresetsCache: UserPreset[] | null = null;

const VALID_FACES: ClockFaceId[] = [
  'standby-digital',
  'minimal-analog',
  'retro-flip',
  'ambient-glow',
  'neon-cyber',
  'premium-editorial',
  'aurora-digital',
  'modern-world',
  'matrix-minimal',
];

const VALID_BG_THEMES: BackgroundThemeId[] = [
  'oled-black',
  'aurora-borealis',
  'liquid-gradient',
  'cosmic-night',
  'ambient-particles',
  'sunset-horizon',
  'deep-ocean',
  'midnight-nebula',
  'soft-glow',
  'custom-color',
];

const VALID_CLOCK_COLORS: ClockColorId[] = [
  'warm-white',
  'crimson',
  'sunset-amber',
  'electric-cyan',
  'mint',
  'lavender',
  'golden-amber',
];

export function loadSettings(): ClockSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('clockdock_v2_settings');
    if (!raw) return memorySettingsCache || DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return memorySettingsCache || DEFAULT_SETTINGS;

    // Map any legacy theme IDs to new background theme IDs if needed
    let bgTheme = parsed.bgTheme || DEFAULT_SETTINGS.bgTheme;
    if (bgTheme === 'midnight-blue') bgTheme = 'deep-ocean';
    if (bgTheme === 'deep-purple') bgTheme = 'midnight-nebula';
    if (bgTheme === 'forest-green') bgTheme = 'aurora-borealis';
    if (bgTheme === 'sunset-gradient') bgTheme = 'sunset-horizon';
    if (bgTheme === 'warm-ember') bgTheme = 'sunset-horizon';
    if (bgTheme === 'aurora') bgTheme = 'aurora-borealis';

    // Validate face against known functional clock faces
    const face: ClockFaceId = VALID_FACES.includes(parsed.face)
      ? parsed.face
      : DEFAULT_SETTINGS.face;

    // Validate background theme
    const safeBgTheme: BackgroundThemeId = VALID_BG_THEMES.includes(bgTheme)
      ? bgTheme
      : DEFAULT_SETTINGS.bgTheme;

    // Validate clock color
    const clockColor: ClockColorId = VALID_CLOCK_COLORS.includes(parsed.clockColor)
      ? parsed.clockColor
      : DEFAULT_SETTINGS.clockColor;

    // Validate dimmer levels
    const dimmer =
      typeof parsed.dimmer === 'number' && !isNaN(parsed.dimmer)
        ? Math.min(1.0, Math.max(0.05, parsed.dimmer))
        : DEFAULT_SETTINGS.dimmer;

    // Backward-compatible migration from legacy nightMode fields to sleepMode fields
    const sleepModeEnabled =
      parsed.sleepModeEnabled !== undefined
        ? Boolean(parsed.sleepModeEnabled)
        : parsed.nightModeEnabled !== undefined
        ? Boolean(parsed.nightModeEnabled)
        : DEFAULT_SETTINGS.sleepModeEnabled;

    const sleepStart =
      typeof parsed.sleepStart === 'string' && /^\d{2}:\d{2}$/.test(parsed.sleepStart)
        ? parsed.sleepStart
        : parsed.nightModeStart || DEFAULT_SETTINGS.sleepStart;

    const sleepEnd =
      typeof parsed.sleepEnd === 'string' && /^\d{2}:\d{2}$/.test(parsed.sleepEnd)
        ? parsed.sleepEnd
        : parsed.nightModeEnd || DEFAULT_SETTINGS.sleepEnd;

    const sleepTint: ClockColorId = VALID_CLOCK_COLORS.includes(parsed.sleepTint)
      ? parsed.sleepTint
      : VALID_CLOCK_COLORS.includes(parsed.nightModeTint)
      ? parsed.nightModeTint
      : DEFAULT_SETTINGS.sleepTint;

    const sleepDimmer =
      typeof parsed.sleepDimmer === 'number' && !isNaN(parsed.sleepDimmer)
        ? Math.min(1.0, Math.max(0.05, parsed.sleepDimmer))
        : typeof parsed.nightModeDimmer === 'number' && !isNaN(parsed.nightModeDimmer)
        ? Math.min(1.0, Math.max(0.05, parsed.nightModeDimmer))
        : DEFAULT_SETTINGS.sleepDimmer;

    const sleepHideSeconds =
      parsed.sleepHideSeconds !== undefined
        ? Boolean(parsed.sleepHideSeconds)
        : parsed.nightModeSuppressSeconds !== undefined
        ? Boolean(parsed.nightModeSuppressSeconds)
        : DEFAULT_SETTINGS.sleepHideSeconds;

    const sleepMinimalDate =
      parsed.sleepMinimalDate !== undefined
        ? Boolean(parsed.sleepMinimalDate)
        : parsed.nightModeMinimalDate !== undefined
        ? Boolean(parsed.nightModeMinimalDate)
        : DEFAULT_SETTINGS.sleepMinimalDate;

    const showWeather =
      parsed.showWeather !== undefined ? Boolean(parsed.showWeather) : DEFAULT_SETTINGS.showWeather;
    const weatherUnit =
      parsed.weatherUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherCity =
      typeof parsed.weatherCity === 'string' && parsed.weatherCity.trim()
        ? parsed.weatherCity.trim().slice(0, 50)
        : DEFAULT_SETTINGS.weatherCity;
    const weatherLatitude =
      typeof parsed.weatherLatitude === 'number' && !isNaN(parsed.weatherLatitude)
        ? parsed.weatherLatitude
        : DEFAULT_SETTINGS.weatherLatitude;
    const weatherLongitude =
      typeof parsed.weatherLongitude === 'number' && !isNaN(parsed.weatherLongitude)
        ? parsed.weatherLongitude
        : DEFAULT_SETTINGS.weatherLongitude;
    const weatherUseGeolocation = Boolean(parsed.weatherUseGeolocation);

    const mergedSettings: ClockSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      face,
      bgTheme: safeBgTheme,
      clockColor,
      dimmer,
      sleepModeEnabled,
      sleepStart,
      sleepEnd,
      sleepTint,
      sleepDimmer,
      sleepHideSeconds,
      sleepMinimalDate,
      showWeather,
      weatherUnit,
      weatherCity,
      weatherLatitude,
      weatherLongitude,
      weatherUseGeolocation,
    };

    memorySettingsCache = mergedSettings;
    return mergedSettings;
  } catch (err) {
    console.warn('Failed to load ClockDock settings from localStorage:', err);
    return memorySettingsCache || DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ClockSettings): void {
  memorySettingsCache = settings;
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save ClockDock settings to localStorage:', err);
  }
}

export function resetSettings(): ClockSettings {
  memorySettingsCache = { ...DEFAULT_SETTINGS };
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
    if (!raw) return memoryPresetsCache || BUILT_IN_PRESETS;
    const userCustom: UserPreset[] = JSON.parse(raw);
    const combined = [...BUILT_IN_PRESETS, ...(Array.isArray(userCustom) ? userCustom : [])];
    memoryPresetsCache = combined;
    return combined;
  } catch (err) {
    console.warn('Failed to load user presets from localStorage:', err);
    return memoryPresetsCache || BUILT_IN_PRESETS;
  }
}

export function saveUserPresets(presets: UserPreset[]): void {
  memoryPresetsCache = presets;
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

// --------------------------------------------------------------------------
// Phase 3: Time Tools Persistence (Alarms, Timer, Stopwatch)
// --------------------------------------------------------------------------

const ALARMS_STORAGE_KEY = 'clockdock_alarms_v1';
const TIMER_STORAGE_KEY = 'clockdock_timer_v1';
const STOPWATCH_STORAGE_KEY = 'clockdock_stopwatch_v1';

export const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-default-1',
    time: '07:30',
    label: 'Morning StandBy',
    enabled: false,
    days: [1, 2, 3, 4, 5], // Mon-Fri
  },
  {
    id: 'alarm-default-2',
    time: '08:30',
    label: 'Weekend Rise',
    enabled: false,
    days: [0, 6], // Sun, Sat
  },
];

export const DEFAULT_TIMER: TimerState = {
  durationSeconds: 300, // 5 minutes
  remainingSeconds: 300,
  endTime: null,
  isRunning: false,
  isCompleted: false,
  label: '5m Timer',
};

export const DEFAULT_STOPWATCH: StopwatchState = {
  accumulatedMs: 0,
  startTime: null,
  isRunning: false,
  laps: [],
};

/**
 * Loads alarms with safe schema validation.
 */
export function loadAlarms(): AlarmItem[] {
  try {
    const raw = localStorage.getItem(ALARMS_STORAGE_KEY);
    if (!raw) return DEFAULT_ALARMS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ALARMS;

    const validated: AlarmItem[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.time === 'string' &&
        /^\d{2}:\d{2}$/.test(item.time)
      ) {
        validated.push({
          id: item.id,
          time: item.time,
          label: typeof item.label === 'string' ? item.label.slice(0, 40) : 'Alarm',
          enabled: Boolean(item.enabled),
          days: Array.isArray(item.days)
            ? item.days.filter((d: unknown) => typeof d === 'number' && d >= 0 && d <= 6)
            : [],
          snoozedUntil:
            typeof item.snoozedUntil === 'number' && item.snoozedUntil > Date.now()
              ? item.snoozedUntil
              : null,
          lastTriggeredDate:
            typeof item.lastTriggeredDate === 'string' ? item.lastTriggeredDate : undefined,
        });
      }
    }
    return validated;
  } catch {
    return DEFAULT_ALARMS;
  }
}

export function saveAlarms(alarms: AlarmItem[]) {
  try {
    localStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
  } catch (err) {
    console.warn('ClockDock: failed to persist alarms', err);
  }
}

/**
 * Loads countdown timer state, recalculating remaining duration if suspended across reload.
 */
export function loadTimerState(): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return DEFAULT_TIMER;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_TIMER;

    const durationSeconds =
      typeof parsed.durationSeconds === 'number' && parsed.durationSeconds > 0
        ? parsed.durationSeconds
        : 300;

    let remainingSeconds =
      typeof parsed.remainingSeconds === 'number' && parsed.remainingSeconds >= 0
        ? parsed.remainingSeconds
        : durationSeconds;

    let isRunning = Boolean(parsed.isRunning);
    let isCompleted = Boolean(parsed.isCompleted);
    let endTime = typeof parsed.endTime === 'number' ? parsed.endTime : null;

    // If it was running when saved, reconstruct remaining time accurately from endTime
    if (isRunning && endTime) {
      const now = Date.now();
      if (now >= endTime) {
        remainingSeconds = 0;
        isRunning = false;
        isCompleted = true;
        endTime = null;
      } else {
        remainingSeconds = Math.ceil((endTime - now) / 1000);
      }
    }

    return {
      durationSeconds,
      remainingSeconds,
      endTime,
      isRunning,
      isCompleted,
      label: typeof parsed.label === 'string' ? parsed.label.slice(0, 30) : 'Timer',
    };
  } catch {
    return DEFAULT_TIMER;
  }
}

export function saveTimerState(timer: TimerState) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
  } catch (err) {
    console.warn('ClockDock: failed to persist timer', err);
  }
}

/**
 * Loads stopwatch state, preserving accumulated time across page reloads.
 */
export function loadStopwatchState(): StopwatchState {
  try {
    const raw = localStorage.getItem(STOPWATCH_STORAGE_KEY);
    if (!raw) return DEFAULT_STOPWATCH;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_STOPWATCH;

    let accumulatedMs =
      typeof parsed.accumulatedMs === 'number' && parsed.accumulatedMs >= 0
        ? parsed.accumulatedMs
        : 0;

    let startTime = typeof parsed.startTime === 'number' ? parsed.startTime : null;
    let isRunning = Boolean(parsed.isRunning);

    // If it was running across reload, catch up accumulated time using epoch difference
    if (isRunning && startTime) {
      const delta = Date.now() - startTime;
      if (delta > 0) {
        accumulatedMs += delta;
      }
      startTime = Date.now();
    }

    const laps = Array.isArray(parsed.laps)
      ? parsed.laps.filter(
          (l: unknown) =>
            l &&
            typeof l === 'object' &&
            typeof (l as { lapNumber: unknown }).lapNumber === 'number' &&
            typeof (l as { overallTimeMs: unknown }).overallTimeMs === 'number' &&
            typeof (l as { lapTimeMs: unknown }).lapTimeMs === 'number'
        )
      : [];

    return {
      accumulatedMs,
      startTime,
      isRunning,
      laps,
    };
  } catch {
    return DEFAULT_STOPWATCH;
  }
}

export function saveStopwatchState(stopwatch: StopwatchState) {
  try {
    localStorage.setItem(STOPWATCH_STORAGE_KEY, JSON.stringify(stopwatch));
  } catch (err) {
    console.warn('ClockDock: failed to persist stopwatch', err);
  }
}

// --------------------------------------------------------------------------
// Phase 4: Weather Cache Persistence (Dedicated Independent Storage)
// --------------------------------------------------------------------------

const WEATHER_CACHE_KEY = 'clockdock_weather_cache_v1';

export function loadWeatherCache(): WeatherData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.temperatureCelsius === 'number' &&
      typeof parsed.condition === 'string' &&
      typeof parsed.conditionCode === 'string' &&
      typeof parsed.locationName === 'string' &&
      typeof parsed.fetchedAt === 'number'
    ) {
      const now = Date.now();
      const isStale = now - parsed.fetchedAt > 30 * 60 * 1000; // >30m considered stale

      return {
        temperatureCelsius: parsed.temperatureCelsius,
        condition: parsed.condition,
        conditionCode: parsed.conditionCode,
        tempHighCelsius:
          typeof parsed.tempHighCelsius === 'number' ? parsed.tempHighCelsius : undefined,
        tempLowCelsius:
          typeof parsed.tempLowCelsius === 'number' ? parsed.tempLowCelsius : undefined,
        locationName: parsed.locationName,
        fetchedAt: parsed.fetchedAt,
        isStale,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveWeatherCache(weather: WeatherData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weather));
  } catch (err) {
    console.warn('ClockDock: failed to persist weather cache', err);
  }
}
