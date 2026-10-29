import {
  UserPreset,
  ClockFaceId,
  BackgroundThemeId,
  ClockColorId,
  TypographyStyleId,
  NumeralSize,
  NumeralSpacing,
  ClockAlignment,
  GlowStrength,
  ShadowIntensity,
  TransitionStyle,
  AnimationSpeed,
  EffectIntensity,
  ParticleDensity,
} from '../types';

export const VALID_FACES: ClockFaceId[] = [
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

export const VALID_BG_THEMES: BackgroundThemeId[] = [
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

export const VALID_CLOCK_COLORS: ClockColorId[] = [
  'warm-white',
  'crimson',
  'sunset-amber',
  'electric-cyan',
  'mint',
  'lavender',
  'golden-amber',
];

export const VALID_TYPOGRAPHY: TypographyStyleId[] = [
  'modern',
  'mono',
  'grotesk',
  'cyber',
  'serif',
];

export const VALID_NUMERAL_SIZES: NumeralSize[] = ['standard', 'large', 'xlarge'];
export const VALID_NUMERAL_SPACINGS: NumeralSpacing[] = ['tight', 'normal', 'wide'];
export const VALID_ALIGNMENTS: ClockAlignment[] = ['center', 'top', 'bottom'];
export const VALID_GLOW: GlowStrength[] = ['off', 'subtle', 'vibrant'];
export const VALID_SHADOW: ShadowIntensity[] = ['none', 'soft', 'deep'];
export const VALID_TRANSITIONS: TransitionStyle[] = ['smooth', 'slide', 'scale', 'minimal'];
export const VALID_SPEEDS: AnimationSpeed[] = ['slow', 'normal', 'fast'];
export const VALID_INTENSITIES: EffectIntensity[] = ['low', 'medium', 'high'];
export const VALID_DENSITIES: ParticleDensity[] = ['low', 'medium', 'high'];

// Sanitize string to prevent any script or HTML injection
export function sanitizeString(val: unknown, maxLen = 40): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/["'\\]/g, '')     // Strip special escape characters
    .trim()
    .slice(0, maxLen);
}

/**
 * Validates a single preset object against the strict ClockDock schema.
 * Rejects unsupported types and applies sensible defaults for missing optional values.
 */
export function validatePreset(raw: unknown): { success: true; preset: UserPreset } | { success: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, error: 'Preset must be a valid JSON object' };
  }

  const obj = raw as Record<string, unknown>;

  // Validate Name
  const rawName = sanitizeString(obj.name, 40);
  const name = rawName || 'Custom Preset';

  // Validate Clock Face (required)
  if (!obj.face || !VALID_FACES.includes(obj.face as ClockFaceId)) {
    return {
      success: false,
      error: `Invalid or missing clock face: "${String(obj.face)}". Supported faces: ${VALID_FACES.join(', ')}`,
    };
  }
  const face = obj.face as ClockFaceId;

  // Validate Background Theme
  const bgTheme: BackgroundThemeId =
    obj.bgTheme && VALID_BG_THEMES.includes(obj.bgTheme as BackgroundThemeId)
      ? (obj.bgTheme as BackgroundThemeId)
      : 'oled-black';

  // Validate Clock Color
  const clockColor: ClockColorId =
    obj.clockColor && VALID_CLOCK_COLORS.includes(obj.clockColor as ClockColorId)
      ? (obj.clockColor as ClockColorId)
      : 'sunset-amber';

  // Validate Typography
  const fontStyle: TypographyStyleId =
    obj.fontStyle && VALID_TYPOGRAPHY.includes(obj.fontStyle as TypographyStyleId)
      ? (obj.fontStyle as TypographyStyleId)
      : 'modern';

  // Validate Dimmer (number between 0.15 and 1.0)
  let dimmer = typeof obj.dimmer === 'number' ? obj.dimmer : 1.0;
  if (isNaN(dimmer) || dimmer < 0.15 || dimmer > 1.0) {
    dimmer = 1.0;
  }

  // Validate optional properties with safe fallbacks
  const bgSpeed: AnimationSpeed =
    obj.bgSpeed && VALID_SPEEDS.includes(obj.bgSpeed as AnimationSpeed)
      ? (obj.bgSpeed as AnimationSpeed)
      : 'normal';

  const bgIntensity: EffectIntensity =
    obj.bgIntensity && VALID_INTENSITIES.includes(obj.bgIntensity as EffectIntensity)
      ? (obj.bgIntensity as EffectIntensity)
      : 'medium';

  const particleDensity: ParticleDensity =
    obj.particleDensity && VALID_DENSITIES.includes(obj.particleDensity as ParticleDensity)
      ? (obj.particleDensity as ParticleDensity)
      : 'medium';

  const glowStrength: GlowStrength =
    obj.glowStrength && VALID_GLOW.includes(obj.glowStrength as GlowStrength)
      ? (obj.glowStrength as GlowStrength)
      : 'subtle';

  const numeralSize: NumeralSize =
    obj.numeralSize && VALID_NUMERAL_SIZES.includes(obj.numeralSize as NumeralSize)
      ? (obj.numeralSize as NumeralSize)
      : 'large';

  const numeralSpacing: NumeralSpacing =
    obj.numeralSpacing && VALID_NUMERAL_SPACINGS.includes(obj.numeralSpacing as NumeralSpacing)
      ? (obj.numeralSpacing as NumeralSpacing)
      : 'normal';

  const clockAlignment: ClockAlignment =
    obj.clockAlignment && VALID_ALIGNMENTS.includes(obj.clockAlignment as ClockAlignment)
      ? (obj.clockAlignment as ClockAlignment)
      : 'center';

  const shadowIntensity: ShadowIntensity =
    obj.shadowIntensity && VALID_SHADOW.includes(obj.shadowIntensity as ShadowIntensity)
      ? (obj.shadowIntensity as ShadowIntensity)
      : 'soft';

  const transitionStyle: TransitionStyle =
    obj.transitionStyle && VALID_TRANSITIONS.includes(obj.transitionStyle as TransitionStyle)
      ? (obj.transitionStyle as TransitionStyle)
      : 'smooth';

  const showDate = typeof obj.showDate === 'boolean' ? obj.showDate : true;
  const showSeconds = typeof obj.showSeconds === 'boolean' ? obj.showSeconds : false;

  // Safe Hex Colors
  const customClockColor =
    typeof obj.customClockColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(obj.customClockColor)
      ? obj.customClockColor
      : '';

  const customClockColorSecondary =
    typeof obj.customClockColorSecondary === 'string' && /^#[0-9A-Fa-f]{6}$/.test(obj.customClockColorSecondary)
      ? obj.customClockColorSecondary
      : '';

  const preset: UserPreset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    isBuiltIn: false,
    face,
    bgTheme,
    clockColor,
    fontStyle,
    dimmer,
    bgSpeed,
    bgIntensity,
    particleDensity,
    glowStrength,
    numeralSize,
    numeralSpacing,
    clockAlignment,
    shadowIntensity,
    transitionStyle,
    showDate,
    showSeconds,
    customClockColor,
    customClockColorSecondary,
  };

  return { success: true, preset };
}

/**
 * Parses and validates an imported JSON string containing a single preset or list of presets.
 */
export function parseImportedPresets(
  jsonText: string
): { success: true; presets: UserPreset[] } | { success: false; error: string } {
  // Reject oversized payloads (limit 64KB)
  if (!jsonText || jsonText.length > 65536) {
    return { success: false, error: 'Import payload exceeds maximum size limit (64 KB)' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { success: false, error: 'Invalid JSON format. Please ensure data is well-formed JSON.' };
  }

  const rawList = Array.isArray(parsed) ? parsed : [parsed];
  if (rawList.length === 0) {
    return { success: false, error: 'Import JSON contains no presets.' };
  }

  if (rawList.length > 30) {
    return { success: false, error: 'Cannot import more than 30 presets at once.' };
  }

  const validatedList: UserPreset[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const res = validatePreset(rawList[i]);
    if (!res.success) {
      return {
        success: false,
        error: `Preset #${i + 1} validation failed: ${res.error}`,
      };
    }
    validatedList.push(res.preset);
  }

  return { success: true, presets: validatedList };
}

/**
 * Triggers a browser file download of preset(s) as formatted JSON.
 */
export function downloadPresetsAsJson(presets: UserPreset | UserPreset[], filename = 'clockdock-preset.json') {
  if (typeof window === 'undefined') return;

  const jsonStr = JSON.stringify(presets, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
