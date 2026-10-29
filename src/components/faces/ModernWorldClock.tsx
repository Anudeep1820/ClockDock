import React from 'react';
import {
  ClockColor,
  TypographyStyle,
  NumeralSize,
  NumeralSpacing,
  ClockAlignment,
  GlowStrength,
  ShadowIntensity,
} from '../../types';
import { Globe, ArrowRight } from 'lucide-react';

interface ModernWorldClockProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  worldCity: string;
  worldTimezone: string;
  showSecondary: boolean;
  numeralSize?: NumeralSize;
  numeralSpacing?: NumeralSpacing;
  clockAlignment?: ClockAlignment;
  glowStrength?: GlowStrength;
  shadowIntensity?: ShadowIntensity;
  onCycleColor?: () => void;
}

export const ModernWorldClock: React.FC<ModernWorldClockProps> = ({
  time,
  color,
  typography,
  is24Hour,
  showDate,
  showSeconds,
  worldCity,
  worldTimezone,
  showSecondary,
  numeralSize = 'large',
  numeralSpacing = 'normal',
  clockAlignment = 'center',
  glowStrength = 'subtle',
  shadowIntensity = 'soft',
  onCycleColor,
}) => {
  // Local time formatting
  let localHoursNum = time.getHours();
  const localAmpm = localHoursNum >= 12 ? 'PM' : 'AM';
  if (!is24Hour) {
    localHoursNum = localHoursNum % 12 || 12;
  }
  const localHours = localHoursNum.toString();
  const localMinutes = time.getMinutes().toString().padStart(2, '0');
  const localSeconds = time.getSeconds().toString().padStart(2, '0');

  // World City time formatting using native Intl.DateTimeFormat (accurate DST)
  let worldHours = '12';
  let worldMinutes = '00';
  let worldAmpm = 'AM';
  let worldDayStr = '';
  let timeDiffStr = '';

  try {
    const worldFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: worldTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour,
      weekday: 'short',
    });

    const parts = worldFormatter.formatToParts(time);
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '12';
    const minPart = parts.find((p) => p.type === 'minute')?.value || '00';
    const dayPeriodPart = parts.find((p) => p.type === 'dayPeriod')?.value || '';
    const weekdayPart = parts.find((p) => p.type === 'weekday')?.value || '';

    worldHours = hourPart;
    worldMinutes = minPart;
    worldAmpm = dayPeriodPart;
    worldDayStr = weekdayPart;

    // Time difference calculation in hours
    // Calculate remote UTC offset by formatting current time in remote timezone
    const remoteIsoStr = time.toLocaleString('en-US', { timeZone: worldTimezone });
    const remoteDate = new Date(remoteIsoStr);
    const diffHours = Math.round((remoteDate.getTime() - time.getTime()) / (1000 * 60 * 60));
    if (diffHours === 0) {
      timeDiffStr = 'Same time';
    } else if (diffHours > 0) {
      timeDiffStr = `+${diffHours} HRS`;
    } else {
      timeDiffStr = `${diffHours} HRS`;
    }
  } catch {
    worldHours = localHours;
    worldMinutes = localMinutes;
    timeDiffStr = 'Local';
  }

  const localDayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long' });
  const localDateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-6xl sm:text-7xl md:text-8xl'
      : numeralSize === 'xlarge'
      ? 'text-8xl sm:text-9xl md:text-[10.5rem]'
      : 'text-7xl sm:text-8xl md:text-9xl';

  const letterSpacingStyle =
    numeralSpacing === 'tight' ? '-0.06em' : numeralSpacing === 'wide' ? '0.04em' : '-0.02em';

  const alignmentClass =
    clockAlignment === 'top'
      ? 'justify-start pt-14 sm:pt-20'
      : clockAlignment === 'bottom'
      ? 'justify-end pb-16 sm:pb-24'
      : 'justify-center';

  const glowShadow =
    glowStrength === 'off'
      ? 'none'
      : glowStrength === 'vibrant'
      ? `0 0 45px ${color.glow}`
      : `0 0 25px ${color.dimGlow}`;

  const baseShadow =
    shadowIntensity === 'none'
      ? 'none'
      : shadowIntensity === 'deep'
      ? '0 20px 40px rgba(0,0,0,0.9)'
      : '0 10px 20px rgba(0,0,0,0.7)';

  const combinedShadow = [glowShadow !== 'none' ? glowShadow : '', baseShadow !== 'none' ? baseShadow : '']
    .filter(Boolean)
    .join(', ') || 'none';

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center w-full h-full p-4 sm:p-6 select-none cursor-pointer transition-all duration-500 ${alignmentClass} ${typography.className}`}
    >
      {/* Primary Local Clock Section */}
      <div className="flex flex-col items-center justify-center">
        {/* Local City & Date Header */}
        {showDate && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs sm:text-sm font-bold tracking-wider uppercase"
              style={{ color: color.primary }}
            >
              LOCAL • {localDayOfWeek}, {localDateFormatted}
            </span>
            {!is24Hour && (
              <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                {localAmpm}
              </span>
            )}
          </div>
        )}

        {/* Primary Local Digits */}
        <div
          className="flex items-center justify-center leading-none"
          style={{ letterSpacing: letterSpacingStyle }}
        >
          <span
            className={`font-black ${fontSizeClass} transition-all duration-500`}
            style={{
              color: color.primary,
              textShadow: combinedShadow,
            }}
          >
            {localHours}
          </span>

          <span
            className={`font-black ${fontSizeClass} mx-2 sm:mx-3 opacity-75 animate-pulse`}
            style={{
              color: color.secondary,
              textShadow: combinedShadow,
            }}
          >
            :
          </span>

          <span
            className={`font-black ${fontSizeClass} transition-all duration-500`}
            style={{
              color: color.secondary,
              textShadow: combinedShadow,
            }}
          >
            {localMinutes}
          </span>

          {/* Local Seconds Pill */}
          {showSeconds && (
            <div className="ml-3 sm:ml-4 self-end mb-2 sm:mb-4 px-2 py-1 rounded-xl bg-white/10 border border-white/15">
              <span
                className="font-mono text-base sm:text-xl font-bold"
                style={{ color: color.primary }}
              >
                {localSeconds}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Companion World City Clock Pill */}
      {showSecondary && (
        <div
          className="mt-6 sm:mt-10 px-5 py-3 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl flex items-center gap-4 shadow-xl transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-wide">{worldCity}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {worldDayStr} • {timeDiffStr}
              </span>
            </div>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />

          {/* Secondary City Time */}
          <div className="flex items-baseline gap-1 font-mono font-bold">
            <span className="text-xl sm:text-2xl text-white">{worldHours}</span>
            <span className="text-xl sm:text-2xl text-sky-400">:</span>
            <span className="text-xl sm:text-2xl text-white">{worldMinutes}</span>
            {!is24Hour && worldAmpm && (
              <span className="text-[10px] text-zinc-400 ml-1">{worldAmpm}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
