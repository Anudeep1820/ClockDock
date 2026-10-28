export type ClockFaceId =
  | 'standby-digital'
  | 'minimal-analog'
  | 'retro-flip'
  | 'ambient-glow';

export type BackgroundThemeId =
  | 'oled-black'
  | 'midnight-blue'
  | 'deep-purple'
  | 'forest-green'
  | 'sunset-gradient'
  | 'warm-ember'
  | 'aurora';

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

export interface BackgroundTheme {
  id: BackgroundThemeId;
  name: string;
  className: string;
  style: React.CSSProperties;
  previewGradient: string;
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

export interface ClockSettings {
  face: ClockFaceId;
  bgTheme: BackgroundThemeId;
  clockColor: ClockColorId;
  fontStyle: TypographyStyleId;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  dimmer: number; // 0.15 to 1.0
  forcedLandscape: boolean;
}
