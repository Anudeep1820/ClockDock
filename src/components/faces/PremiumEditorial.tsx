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

interface PremiumEditorialProps {
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

export const PremiumEditorial: React.FC<PremiumEditorialProps> = ({
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
  const hoursStr = hoursNum.toString();
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const weekday = time.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDayYear = time.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-7xl sm:text-9xl md:text-[11rem]'
      : numeralSize === 'xlarge'
      ? 'text-9xl sm:text-[13rem] md:text-[15rem]'
      : 'text-8xl sm:text-[11rem] md:text-[13rem]';

  const letterSpacingStyle =
    numeralSpacing === 'tight' ? '-0.06em' : numeralSpacing === 'wide' ? '0.06em' : '-0.02em';

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
      ? `0 0 50px ${color.glow}`
      : `0 0 25px ${color.dimGlow}`;

  const baseShadow =
    shadowIntensity === 'none'
      ? 'none'
      : shadowIntensity === 'deep'
      ? '0 25px 60px rgba(0,0,0,0.95)'
      : '0 15px 30px rgba(0,0,0,0.7)';

  const combinedShadow = [glowShadow !== 'none' ? glowShadow : '', baseShadow !== 'none' ? baseShadow : '']
    .filter(Boolean)
    .join(', ') || 'none';

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center w-full h-full select-none cursor-pointer p-6 sm:p-10 font-serif-clock transition-all duration-500 ${alignmentClass}`}
    >
      {/* Top Editorial Rule & Masthead Date */}
      {showDate && (
        <div
          className={`flex flex-col items-center gap-1.5 transition-all text-center mb-3 ${
            clockAlignment === 'top' ? 'order-first mb-3' : clockAlignment === 'bottom' ? 'mb-4' : 'absolute top-6 sm:top-10 md:top-14'
          }`}
        >
          <div className="flex items-center gap-3 text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase font-bold text-zinc-300">
            <span>{weekday}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-500" />
            <span>{monthDayYear}</span>
          </div>
          <div className="w-24 sm:w-32 h-[1px] bg-white/20 mt-1" />
        </div>
      )}

      {/* Luxury Editorial Numerals */}
      <div
        className="flex items-baseline justify-center leading-none"
        style={{ letterSpacing: letterSpacingStyle }}
      >
        <span
          className={`font-black italic ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: combinedShadow,
          }}
        >
          {hoursStr}
        </span>

        <span
          className="font-light text-4xl sm:text-6xl md:text-7xl mx-2 sm:mx-4 opacity-50 font-sans"
          style={{ color: color.secondary }}
        >
          /
        </span>

        <span
          className={`font-black italic ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.secondary,
            textShadow: combinedShadow,
          }}
        >
          {minutesStr}
        </span>

        {/* Small Elevated Period or Seconds Tag */}
        <div className="flex flex-col gap-1 ml-3 sm:ml-5 self-center">
          {!is24Hour && (
            <span
              className="text-xs sm:text-sm font-sans font-bold tracking-widest text-zinc-400 uppercase"
              style={{ color: color.primary }}
            >
              {ampm}
            </span>
          )}

          {showSeconds && (
            <span
              className="text-xs sm:text-sm font-mono font-medium text-zinc-500 tracking-wider"
              style={{ color: color.secondary }}
            >
              {secondsStr}s
            </span>
          )}
        </div>
      </div>

      {/* Bottom Editorial Caption */}
      <div
        className={`flex items-center gap-3 text-[11px] sm:text-xs text-zinc-500 font-sans tracking-[0.25em] uppercase ${
          clockAlignment === 'bottom' ? 'order-last mt-3' : 'absolute bottom-6 sm:bottom-10'
        }`}
      >
        <span>VOLUME XXIV</span>
        <span>—</span>
        <span style={{ color: color.primary }}>EDITION LUXE</span>
      </div>
    </div>
  );
};
