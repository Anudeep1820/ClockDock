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

interface AmbientGlowProps {
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

export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  time,
  color,
  typography,
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
  const hours = hoursNum.toString();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long' });
  const timePeriod =
    time.getHours() >= 19 || time.getHours() < 5
      ? 'Night'
      : time.getHours() >= 12
      ? 'Afternoon'
      : 'Morning';

  const fullDate = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-[22vw] sm:text-[19vw] md:text-[17vw]'
      : numeralSize === 'xlarge'
      ? 'text-[32vw] sm:text-[28vw] md:text-[26vw]'
      : 'text-[27vw] sm:text-[24vw] md:text-[22vw]';

  const letterSpacingStyle =
    numeralSpacing === 'tight' ? '-0.07em' : numeralSpacing === 'wide' ? '0.04em' : '-0.03em';

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
      ? `0 0 65px ${color.glow}, 0 0 110px ${color.glow}`
      : `0 0 35px ${color.glow}, 0 0 70px ${color.dimGlow}`;

  const baseShadow =
    shadowIntensity === 'none'
      ? 'none'
      : shadowIntensity === 'deep'
      ? '0 25px 50px rgba(0,0,0,0.95)'
      : '0 15px 30px rgba(0,0,0,0.8)';

  const combinedShadow = [glowShadow !== 'none' ? glowShadow : '', baseShadow !== 'none' ? baseShadow : '']
    .filter(Boolean)
    .join(', ') || 'none';

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center w-full h-full p-6 select-none cursor-pointer overflow-hidden transition-all duration-500 ${alignmentClass} ${typography.className}`}
    >
      {/* Ambient Breathing Background Radial Halo */}
      {glowStrength !== 'off' && (
        <div
          className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none transition-all duration-1000 animate-pulseGlow blur-3xl opacity-35"
          style={{
            background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Atmospheric Day & Period Header */}
      {showDate && (
        <div
          className={`flex flex-col items-center gap-1 transition-all z-10 mb-3 ${
            clockAlignment === 'top' ? 'order-first mb-2' : clockAlignment === 'bottom' ? 'mb-4' : 'absolute top-6 sm:top-10'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-xs sm:text-sm font-semibold tracking-wider uppercase opacity-90"
              style={{ color: color.primary }}
            >
              {dayOfWeek} {timePeriod}
            </span>
            {!is24Hour && (
              <span
                className="text-[10px] sm:text-xs font-bold font-mono px-1.5 py-0.5 rounded border border-white/10"
                style={{ color: color.secondary }}
              >
                {ampm}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">
            {fullDate}
          </span>
        </div>
      )}

      {/* Atmospheric Luminous Clock Digits */}
      <div
        className="relative z-10 flex items-center justify-center leading-none select-none"
        style={{ letterSpacing: letterSpacingStyle }}
      >
        <span
          className={`font-black ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: combinedShadow,
          }}
        >
          {hours}
        </span>

        {/* Floating Ambient Colon */}
        <span
          className={`font-black ${fontSizeClass} mx-[1.5vw] opacity-80 animate-pulse`}
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
          {minutes}
        </span>

        {/* Optional Seconds */}
        {showSeconds && (
          <div className="self-end mb-[2.5vw] ml-[1.5vw]">
            <span
              className="text-[5vw] sm:text-[4vw] font-bold font-mono opacity-80"
              style={{ color: color.secondary }}
            >
              {seconds}
            </span>
          </div>
        )}
      </div>

      {/* Subtle Bottom Ambient Baseline */}
      <div
        className={`flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-widest z-10 ${
          clockAlignment === 'bottom' ? 'order-last mt-3' : 'absolute bottom-6 sm:bottom-10'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: color.primary }}
        />
        <span>ATMOSPHERE MODE</span>
      </div>
    </div>
  );
};
