export type ClockFaceId =
  | 'standby-digital'
  | 'minimal-analog'
  | 'retro-flip'
  | 'ambient-glow'
  | 'neon-cyber'
  | 'premium-editorial'
  | 'aurora-digital'
  | 'modern-world'
  | 'matrix-minimal';

export type BackgroundThemeId =
  | 'oled-black'
  | 'aurora-borealis'
  | 'liquid-gradient'
  | 'cosmic-night'
  | 'ambient-particles'
  | 'sunset-horizon'
  | 'deep-ocean'
  | 'midnight-nebula'
  | 'soft-glow'
  | 'custom-color';

export type ClockColorId =
  | 'warm-white'
  | 'crimson'
  | 'sunset-amber'
  | 'electric-cyan'
  | 'mint'
  | 'lavender'
  | 'golden-amber';

export type TypographyStyleId =
  | 'modern'
  | 'mono'
  | 'grotesk'
  | 'cyber'
  | 'serif';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type EffectIntensity = 'low' | 'medium' | 'high';
export type ParticleDensity = 'low' | 'medium' | 'high';
export type NumeralSize = 'standard' | 'large' | 'xlarge';
export type NumeralSpacing = 'tight' | 'normal' | 'wide';
export type ClockAlignment = 'center' | 'top' | 'bottom';
export type GlowStrength = 'off' | 'subtle' | 'vibrant';
export type ShadowIntensity = 'none' | 'soft' | 'deep';
export type TransitionStyle = 'smooth' | 'slide' | 'scale' | 'minimal';
export type SleepScheduleMode = 'daily' | 'weekday_weekend';

export interface BackgroundTheme {
  id: BackgroundThemeId;
  name: string;
  description: string;
  previewGradient: string;
  isAnimated: boolean;
}

export interface ClockColor {
  id: ClockColorId;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  dimGlow: string;
}

export interface TypographyStyle {
  id: TypographyStyleId;
  name: string;
  fontFamily: string;
  className: string;
  sample: string;
}

export interface WorldClockCity {
  city: string;
  timezone: string;
  country: string;
}

export interface UserPreset {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  face: ClockFaceId;
  bgTheme: BackgroundThemeId;
  clockColor: ClockColorId;
  fontStyle: TypographyStyleId;
  dimmer: number;
  bgSpeed?: AnimationSpeed;
  bgIntensity?: EffectIntensity;
  particleDensity?: ParticleDensity;
  glowStrength?: GlowStrength;
  numeralSize?: NumeralSize;
  numeralSpacing?: NumeralSpacing;
  clockAlignment?: ClockAlignment;
  shadowIntensity?: ShadowIntensity;
  showDate?: boolean;
  showSeconds?: boolean;
  customClockColor?: string;
  customClockColorSecondary?: string;
  transitionStyle?: TransitionStyle;
}

export interface SleepManualOverride {
  targetState: boolean; // true = forced sleep mode, false = forced daytime mode
  expiresAt: number;    // timestamp in ms for the next scheduled transition boundary
}

export interface ClockSettings {
  // Daytime Clock Face & Appearance (Phase 2 Design Studio)
  face: ClockFaceId;
  clockColor: ClockColorId;
  customClockColor: string;
  customClockColorSecondary: string;
  fontStyle: TypographyStyleId;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  dimmer: number; // 0.15 to 1.0
  forcedLandscape: boolean;
  numeralSize: NumeralSize;
  numeralSpacing: NumeralSpacing;
  clockAlignment: ClockAlignment;
  glowStrength: GlowStrength;
  shadowIntensity: ShadowIntensity;
  transitionStyle: TransitionStyle;

  // Background Studio
  bgTheme: BackgroundThemeId;
  bgAnimationEnabled: boolean;
  bgSpeed: AnimationSpeed;
  bgIntensity: EffectIntensity;
  particleDensity: ParticleDensity;
  bgBlur: boolean;
  customBgColor: string;
  customBgColorSecondary: string;
  bgBrightness: number;
  reduceMotion: boolean;

  // World Clock settings
  worldClockCity: string;
  worldClockTimezone: string;
  showSecondaryClock: boolean;

  // Adaptive Sleep Mode (Phase 1)
  sleepModeEnabled: boolean;
  sleepScheduleMode: SleepScheduleMode;
  sleepStart: string; // "22:00" (daily)
  sleepEnd: string;   // "07:00" (daily)
  sleepStartWeekday: string; // "22:30"
  sleepEndWeekday: string;   // "06:45"
  sleepStartWeekend: string; // "23:45"
  sleepEndWeekend: string;   // "08:30"
  sleepManualOverride: SleepManualOverride | null;

  // Dedicated Nighttime Appearance (Restores daytime appearance when exiting sleep mode)
  sleepBgTheme: BackgroundThemeId;
  sleepTint: ClockColorId;
  sleepDimmer: number; // 0.15 to 0.70
  sleepHideSeconds: boolean;
  sleepMinimalDate: boolean;
  sleepDisableAnimations: boolean;
  sleepGlowStrength: GlowStrength;

  // Backward compatibility aliases
  nightModeEnabled?: boolean;
  nightModeStart?: string;
  nightModeEnd?: string;
  nightModeTint?: ClockColorId;
  nightModeDimmer?: number;
  nightModeSuppressSeconds?: boolean;
  nightModeMinimalDate?: boolean;
  nightModeManual?: boolean | null;

  // Phase 4: Weather Widget Settings
  showWeather: boolean;
  weatherUnit: 'celsius' | 'fahrenheit';
  weatherCity: string;
  weatherLatitude: number;
  weatherLongitude: number;
  weatherUseGeolocation: boolean;
}

// --------------------------------------------------------------------------
// Phase 3: Time Tools (Alarms, Countdown Timer, Stopwatch)
// --------------------------------------------------------------------------

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM" 24-hour format (e.g. "07:30")
  label: string;
  enabled: boolean;
  days: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat. Empty array [] means one-time alarm.
  snoozedUntil?: number | null; // Epoch timestamp (ms) if snoozed
  lastTriggeredDate?: string; // "YYYY-MM-DD" prevents double trigger within same minute
}

export interface TimerState {
  durationSeconds: number; // Configured total countdown seconds
  remainingSeconds: number; // Current remaining seconds
  endTime: number | null; // Epoch ms when running; null when paused/idle
  isRunning: boolean;
  isCompleted: boolean;
  label?: string;
}

export interface StopwatchLap {
  lapNumber: number;
  overallTimeMs: number;
  lapTimeMs: number;
}

export interface StopwatchState {
  accumulatedMs: number;
  startTime: number | null; // Epoch ms when running
  isRunning: boolean;
  laps: StopwatchLap[];
}

export interface ActiveAlert {
  type: 'alarm' | 'timer';
  id: string;
  title: string;
  subtitle?: string;
  timestamp: number;
  alarmItem?: AlarmItem;
}

// --------------------------------------------------------------------------
// Phase 4: Weather Integration
// --------------------------------------------------------------------------

export type WeatherConditionCode =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherData {
  temperatureCelsius: number;
  condition: string;
  conditionCode: WeatherConditionCode;
  tempHighCelsius?: number;
  tempLowCelsius?: number;
  locationName: string;
  fetchedAt: number; // Epoch ms
  isStale?: boolean;
}

export interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}
