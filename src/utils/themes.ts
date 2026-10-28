import {
  BackgroundTheme,
  BackgroundThemeId,
  ClockColor,
  ClockColorId,
  TypographyStyle,
  TypographyStyleId,
  ClockFaceId,
} from '../types';

export const CLOCK_FACES: { id: ClockFaceId; name: string; subtitle: string }[] = [
  {
    id: 'standby-digital',
    name: 'StandBy Digital',
    subtitle: 'Dual-tone bold display inspired by iPhone StandBy',
  },
  {
    id: 'minimal-analog',
    name: 'Minimal Analog',
    subtitle: 'Bauhaus chronometer with continuous sweep seconds',
  },
  {
    id: 'retro-flip',
    name: 'Retro Flip',
    subtitle: 'Split-flap mechanical cards with 3D tactile depth',
  },
  {
    id: 'ambient-glow',
    name: 'Ambient Glow',
    subtitle: 'Atmospheric luminescent typography for dark rooms',
  },
];

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'oled-black',
    name: 'OLED Black',
    className: 'bg-black',
    style: { backgroundColor: '#000000' },
    previewGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    className: 'bg-gradient-to-b from-[#040814] via-[#081226] to-[#03060f]',
    style: {
      background: 'radial-gradient(ellipse at 50% 30%, #0d1e3d 0%, #050b18 60%, #02040a 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #0d1e3d 0%, #050b18 100%)',
  },
  {
    id: 'deep-purple',
    name: 'Deep Purple',
    className: 'bg-gradient-to-b from-[#0e0417] via-[#1a082b] to-[#08020d]',
    style: {
      background: 'radial-gradient(ellipse at 50% 30%, #260c3e 0%, #12041d 60%, #07010a 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #260c3e 0%, #0e0417 100%)',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    className: 'bg-gradient-to-b from-[#031109] via-[#061e11] to-[#020904]',
    style: {
      background: 'radial-gradient(ellipse at 50% 30%, #092c19 0%, #05170d 60%, #020804 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #092c19 0%, #031109 100%)',
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    className: 'bg-gradient-to-b from-[#1f091f] via-[#240b1a] to-[#0d0309]',
    style: {
      background: 'radial-gradient(ellipse at 50% 20%, #3a0d2e 0%, #1c0617 55%, #080207 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #3a0d2e 0%, #160410 100%)',
  },
  {
    id: 'warm-ember',
    name: 'Warm Ember',
    className: 'bg-gradient-to-b from-[#1c0803] via-[#240d04] to-[#0a0301]',
    style: {
      background: 'radial-gradient(ellipse at 50% 25%, #381206 0%, #1a0803 55%, #080201 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #381206 0%, #150502 100%)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    className: 'bg-gradient-to-b from-[#031418] via-[#061f22] to-[#020b0d]',
    style: {
      background: 'radial-gradient(ellipse at 50% 25%, #082d32 0%, #04171a 55%, #010809 100%)',
    },
    previewGradient: 'linear-gradient(135deg, #082d32 0%, #031418 100%)',
  },
];

export const CLOCK_COLORS: ClockColor[] = [
  {
    id: 'warm-white',
    name: 'Warm White',
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    glow: 'rgba(248, 250, 252, 0.4)',
    dimGlow: 'rgba(248, 250, 252, 0.15)',
  },
  {
    id: 'crimson',
    name: 'Crimson Red',
    primary: '#EF4444',
    secondary: '#F87171',
    glow: 'rgba(239, 68, 68, 0.55)',
    dimGlow: 'rgba(239, 68, 68, 0.2)',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    primary: '#F59E0B',
    secondary: '#FDE047',
    glow: 'rgba(245, 158, 11, 0.55)',
    dimGlow: 'rgba(245, 158, 11, 0.2)',
  },
  {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    primary: '#06B6D4',
    secondary: '#67E8F9',
    glow: 'rgba(6, 182, 212, 0.55)',
    dimGlow: 'rgba(6, 182, 212, 0.2)',
  },
  {
    id: 'mint',
    name: 'Mint Green',
    primary: '#10B981',
    secondary: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.55)',
    dimGlow: 'rgba(16, 185, 129, 0.2)',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primary: '#C084FC',
    secondary: '#E879F9',
    glow: 'rgba(192, 132, 252, 0.55)',
    dimGlow: 'rgba(192, 132, 252, 0.2)',
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    primary: '#FBBF24',
    secondary: '#F59E0B',
    glow: 'rgba(251, 191, 36, 0.55)',
    dimGlow: 'rgba(251, 191, 36, 0.2)',
  },
];

export const TYPOGRAPHY_STYLES: TypographyStyle[] = [
  {
    id: 'modern',
    name: 'Modern Sans',
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    className: 'font-modern',
    sample: '12:00',
  },
  {
    id: 'mono',
    name: 'Mono Geometry',
    fontFamily: "'DM Mono', ui-monospace, monospace",
    className: 'font-mono-geo',
    sample: '12:00',
  },
  {
    id: 'grotesk',
    name: 'Space Grotesk',
    fontFamily: "'Space Grotesk', sans-serif",
    className: 'font-grotesk',
    sample: '12:00',
  },
  {
    id: 'cyber',
    name: 'Futuristic Cyber',
    fontFamily: "'Chakra Petch', sans-serif",
    className: 'font-cyber',
    sample: '12:00',
  },
  {
    id: 'serif',
    name: 'Editorial Serif',
    fontFamily: "'Playfair Display', Georgia, serif",
    className: 'font-serif-clock',
    sample: '12:00',
  },
];

export function getTheme(id: BackgroundThemeId): BackgroundTheme {
  return BACKGROUND_THEMES.find((t) => t.id === id) || BACKGROUND_THEMES[0];
}

export function getColor(id: ClockColorId): ClockColor {
  return CLOCK_COLORS.find((c) => c.id === id) || CLOCK_COLORS[0];
}

export function getTypography(id: TypographyStyleId): TypographyStyle {
  return TYPOGRAPHY_STYLES.find((t) => t.id === id) || TYPOGRAPHY_STYLES[0];
}
