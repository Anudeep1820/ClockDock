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
export type GlowStrength = 'off' | 'subtle' | 'vibrant';

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
}

export interface ClockSettings {
  // Clock Face
  face: ClockFaceId;
  clockColor: ClockColorId;
  fontStyle: TypographyStyleId;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  dimmer: number; // 0.15 to 1.0
  forcedLandscape: boolean;
  numeralSize: NumeralSize;
  glowStrength: GlowStrength;

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

  // Intelligent Night Mode
  nightModeEnabled: boolean;
  nightModeStart: string; // "22:00"
  nightModeEnd: string;   // "07:00"
  nightModeTint: ClockColorId;
  nightModeDimmer: number;
  nightModeSuppressSeconds: boolean;
  nightModeMinimalDate: boolean;
  nightModeManual: boolean | null; // null = follow schedule, true = forced night, false = forced day
}
