import {
  BackgroundTheme,
  BackgroundThemeId,
  ClockColor,
  ClockColorId,
  TypographyStyle,
  TypographyStyleId,
  ClockFaceId,
  WorldClockCity,
} from '../types';

export const CLOCK_FACES: {
  id: ClockFaceId;
  name: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: 'standby-digital',
    name: 'StandBy Digital',
    subtitle: 'Dual-tone bold display inspired by iPhone StandBy',
    badge: 'Classic',
  },
  {
    id: 'minimal-analog',
    name: 'Minimal Analog',
    subtitle: 'Bauhaus chronometer with continuous sweep seconds',
    badge: 'Analog',
  },
  {
    id: 'retro-flip',
    name: 'Retro Flip',
    subtitle: 'Split-flap mechanical cards with 3D tactile depth',
    badge: 'Vintage',
  },
  {
    id: 'ambient-glow',
    name: 'Ambient Glow',
    subtitle: 'Atmospheric luminescent typography for dark rooms',
    badge: 'Atmosphere',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    subtitle: 'Futuristic glowing numerals with dual-layer neon borders',
    badge: 'Cyber',
  },
  {
    id: 'premium-editorial',
    name: 'Premium Editorial',
    subtitle: 'High-horology typography inspired by luxury watchmakers',
    badge: 'Luxury',
  },
  {
    id: 'aurora-digital',
    name: 'Aurora Digital',
    subtitle: 'Floating frosted-glass digits over atmospheric light',
    badge: 'Modern',
  },
  {
    id: 'modern-world',
    name: 'Modern World Clock',
    subtitle: 'Local time with secondary companion world clock',
    badge: 'World',
  },
  {
    id: 'matrix-minimal',
    name: 'Matrix Minimal',
    subtitle: 'Monospaced phosphor numerals with digital column indicators',
    badge: 'Mono',
  },
];

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    id: 'oled-black',
    name: 'OLED Pure Black',
    description: 'Zero light emission, 100% distraction-free for bedside sleep',
    previewGradient: 'linear-gradient(135deg, #000000 0%, #080808 100%)',
    isAnimated: false,
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Softly flowing northern-light ribbons with teal, green, and violet',
    previewGradient: 'linear-gradient(135deg, #021a1a 0%, #0d3d38 50%, #15092a 100%)',
    isAnimated: true,
  },
  {
    id: 'liquid-gradient',
    name: 'Liquid Gradient',
    description: 'Smooth organic color mesh drifting continuously',
    previewGradient: 'linear-gradient(135deg, #1b0a2a 0%, #0c1a30 50%, #2a0b1c 100%)',
    isAnimated: true,
  },
  {
    id: 'cosmic-night',
    name: 'Cosmic Night',
    description: 'Gently twinkling stars against deep space indigo',
    previewGradient: 'linear-gradient(135deg, #04040d 0%, #0a0b1a 50%, #060212 100%)',
    isAnimated: true,
  },
  {
    id: 'ambient-particles',
    name: 'Ambient Particles',
    description: 'Floating luminous dust particles drifting slowly in 3D',
    previewGradient: 'linear-gradient(135deg, #09090d 0%, #12121a 50%, #07070a 100%)',
    isAnimated: true,
  },
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    description: 'Layered dusk twilight gradients in amber, coral, and violet',
    previewGradient: 'linear-gradient(135deg, #2b0b18 0%, #3d1410 50%, #14051a 100%)',
    isAnimated: true,
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Flowing underwater abyssal caustics in cyan and navy blue',
    previewGradient: 'linear-gradient(135deg, #020b17 0%, #061d36 50%, #01060f 100%)',
    isAnimated: true,
  },
  {
    id: 'midnight-nebula',
    name: 'Midnight Nebula',
    description: 'Atmospheric cosmic dust clouds with deep plum and violet depth',
    previewGradient: 'linear-gradient(135deg, #13031f 0%, #260838 50%, #090110 100%)',
    isAnimated: true,
  },
  {
    id: 'soft-glow',
    name: 'Soft Glow',
    description: 'Restrained radial aura breathing behind the clock face',
    previewGradient: 'radial-gradient(circle, #222230 0%, #09090c 80%)',
    isAnimated: true,
  },
  {
    id: 'custom-color',
    name: 'Custom Solid Color',
    description: 'Select your personal custom solid or gradient background hue',
    previewGradient: 'linear-gradient(135deg, #181822 0%, #0e0e14 100%)',
    isAnimated: false,
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
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    className: 'font-modern',
    sample: '12:00',
  },
  {
    id: 'mono',
    name: 'Mono Geometry',
    fontFamily: "'DM Mono', 'Space Mono', ui-monospace, SFMono-Regular, monospace",
    className: 'font-mono-geo',
    sample: '12:00',
  },
  {
    id: 'grotesk',
    name: 'Space Grotesk',
    fontFamily: "'Space Grotesk', -apple-system, sans-serif",
    className: 'font-grotesk',
    sample: '12:00',
  },
  {
    id: 'cyber',
    name: 'Futuristic Cyber',
    fontFamily: "'Chakra Petch', -apple-system, sans-serif",
    className: 'font-cyber',
    sample: '12:00',
  },
  {
    id: 'serif',
    name: 'Editorial Serif',
    fontFamily: "'Playfair Display', Georgia, Cambria, 'Times New Roman', serif",
    className: 'font-serif-clock',
    sample: '12:00',
  },
];

export const WORLD_CITIES: WorldClockCity[] = [
  { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { city: 'London', timezone: 'Europe/London', country: 'United Kingdom' },
  { city: 'New York', timezone: 'America/New_York', country: 'United States' },
  { city: 'Paris', timezone: 'Europe/Paris', country: 'France' },
  { city: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  { city: 'Dubai', timezone: 'Asia/Dubai', country: 'United Arab Emirates' },
  { city: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'United States' },
  { city: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
  { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
  { city: 'UTC / GMT', timezone: 'UTC', country: 'Universal' },
];

export function getTheme(id: BackgroundThemeId): BackgroundTheme {
  return BACKGROUND_THEMES.find((t) => t.id === id) || BACKGROUND_THEMES[0];
}

export function getColor(
  id: ClockColorId,
  customPrimary?: string,
  customSecondary?: string
): ClockColor {
  const base = CLOCK_COLORS.find((c) => c.id === id) || CLOCK_COLORS[0];
  if (customPrimary && /^#[0-9A-Fa-f]{6}$/.test(customPrimary)) {
    return {
      id: base.id,
      name: 'Custom',
      primary: customPrimary,
      secondary: customSecondary && /^#[0-9A-Fa-f]{6}$/.test(customSecondary) ? customSecondary : base.secondary,
      glow: `${customPrimary}80`,
      dimGlow: `${customPrimary}33`,
    };
  }
  return base;
}

export function getTypography(id: TypographyStyleId): TypographyStyle {
  return TYPOGRAPHY_STYLES.find((t) => t.id === id) || TYPOGRAPHY_STYLES[0];
}
