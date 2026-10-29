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

interface MatrixMinimalProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  numeralSize?: NumeralSize;
  numeralSpacing?: NumeralSpacing;
  clockAlignment?: ClockAlignment;
  glowStrength?: GlowStrength;
  shadowIntensity?: ShadowIntensity;
  onCycleColor?: () => void;
}

export const MatrixMinimal: React.FC<MatrixMinimalProps> = ({
  time,
  color,
  typography: _typography,
  is24Hour,
  showDate,
  showSeconds,
  numeralSize = 'large',
  numeralSpacing = 'normal',
  clockAlignment = 'center',
  glowStrength = 'subtle',
  shadowIntensity = 'soft',
  onCycleColor,
}) => {
  let hoursNum = time.getHours();
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hoursStr = hoursNum.toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-6xl sm:text-8xl md:text-9xl'
      : numeralSize === 'xlarge'
      ? 'text-8xl sm:text-[11rem] md:text-[13rem]'
      : 'text-7xl sm:text-9xl md:text-[11rem]';

  const letterSpacingStyle =
    numeralSpacing === 'tight' ? '-0.06em' : numeralSpacing === 'wide' ? '0.14em' : '0.04em';

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
      ? `0 0 35px ${color.glow}, 0 0 60px ${color.glow}`
      : `0 0 20px ${color.glow}`;

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
      className={`relative flex flex-col items-center w-full h-full select-none cursor-pointer p-4 sm:p-6 font-mono-geo transition-all duration-500 ${alignmentClass}`}
    >
      {/* Top Monospaced Inscription */}
      {showDate && (
        <div
          className={`flex items-center gap-2 mb-3 ${
            clockAlignment === 'top' ? 'order-first mb-2' : clockAlignment === 'bottom' ? 'mb-4' : 'absolute top-6 sm:top-10 md:top-14'
          }`}
        >
          <div
            className="px-3.5 py-1 rounded border backdrop-blur-md"
            style={{
              borderColor: `${color.primary}35`,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <span
              className="text-xs sm:text-sm font-mono tracking-widest"
              style={{ color: color.primary }}
            >
              [{dayOfWeek} {dateFormatted}]
            </span>
          </div>

          {!is24Hour && (
            <span
              className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border"
              style={{
                borderColor: `${color.secondary}35`,
                color: color.secondary,
              }}
            >
              {ampm}
            </span>
          )}
        </div>
      )}

      {/* Monospaced Precision Digits */}
      <div
        className="flex items-center justify-center font-mono leading-none"
        style={{ letterSpacing: letterSpacingStyle }}
      >
        <span
          className={`font-black ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: combinedShadow,
          }}
        >
          {hoursStr}
        </span>

        <span
          className={`font-black ${fontSizeClass} mx-2 sm:mx-4 opacity-75 animate-pulse`}
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
            color: color.primary,
            textShadow: combinedShadow,
          }}
        >
          {minutesStr}
        </span>

        {/* Optional Seconds */}
        {showSeconds && (
          <div className="ml-3 sm:ml-5 self-end mb-2 sm:mb-4 px-2 py-1 rounded border border-white/10 bg-black/60">
            <span
              className="font-mono text-xl sm:text-3xl font-bold"
              style={{ color: color.secondary }}
            >
              .{secondsStr}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Matrix Monospace Indicators */}
      <div
        className={`flex items-center gap-6 text-[10px] sm:text-xs font-mono text-zinc-500 tracking-widest ${
          clockAlignment === 'bottom' ? 'order-last mt-3' : 'absolute bottom-6 sm:bottom-10'
        }`}
      >
        <span>CH: 01-A</span>
        <span>•</span>
        <span style={{ color: color.primary }}>CLK_RATE: 1000MS</span>
        <span>•</span>
        <span>STATUS: SYNCED</span>
      </div>
    </div>
  );
};
