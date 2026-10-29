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

interface NeonCyberProps {
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

export const NeonCyber: React.FC<NeonCyberProps> = ({
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
    day: 'numeric',
  }).toUpperCase();

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-5xl sm:text-7xl md:text-8xl'
      : numeralSize === 'xlarge'
      ? 'text-8xl sm:text-9xl md:text-[11rem]'
      : 'text-7xl sm:text-8xl md:text-9xl';

  const letterSpacingStyle =
    numeralSpacing === 'tight' ? '-0.04em' : numeralSpacing === 'wide' ? '0.12em' : '0.04em';

  const alignmentClass =
    clockAlignment === 'top'
      ? 'justify-start pt-14 sm:pt-20'
      : clockAlignment === 'bottom'
      ? 'justify-end pb-16 sm:pb-24'
      : 'justify-center';

  const glowBlur =
    glowStrength === 'off'
      ? 'none'
      : glowStrength === 'vibrant'
      ? `0 0 45px ${color.glow}, 0 0 15px ${color.primary}`
      : `0 0 25px ${color.glow}`;

  const boxShadow =
    shadowIntensity === 'none'
      ? 'none'
      : shadowIntensity === 'deep'
      ? `0 0 45px ${color.dimGlow}, inset 0 0 25px ${color.dimGlow}, 0 20px 40px rgba(0,0,0,0.9)`
      : `0 0 30px ${color.dimGlow}, inset 0 0 15px ${color.dimGlow}`;

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center w-full h-full select-none cursor-pointer p-4 sm:p-6 transition-all duration-500 font-cyber ${alignmentClass}`}
    >
      {/* Top Cyber Status Bar */}
      {showDate && (
        <div
          className={`flex items-center gap-2 sm:gap-3 transition-all mb-3 ${
            clockAlignment === 'top' ? 'order-first mb-3' : clockAlignment === 'bottom' ? 'mb-4' : 'absolute top-5 sm:top-8 md:top-12'
          }`}
        >
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-sm border backdrop-blur-md shadow-lg -skew-x-12"
            style={{
              borderColor: `${color.primary}45`,
              backgroundColor: `${color.primary}12`,
              boxShadow: glowStrength !== 'off' ? `0 0 15px ${color.dimGlow}` : 'none',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: color.primary }}
            />
            <span
              className="text-[10px] sm:text-xs font-bold tracking-widest skew-x-12 uppercase"
              style={{ color: color.primary }}
            >
              SYS.TIME // {dayOfWeek} {dateFormatted}
            </span>
          </div>

          {!is24Hour && (
            <span
              className="text-[9px] sm:text-xs font-black tracking-widest px-2 py-0.5 rounded-sm border -skew-x-12"
              style={{
                borderColor: `${color.secondary}45`,
                backgroundColor: `${color.secondary}15`,
                color: color.secondary,
                boxShadow: glowStrength !== 'off' ? `0 0 10px ${color.dimGlow}` : 'none',
              }}
            >
              <span className="inline-block skew-x-12">{ampm}</span>
            </span>
          )}
        </div>
      )}

      {/* OVERSIZED FUTURISTIC NUMERALS */}
      <div
        className="flex items-center justify-center leading-none tracking-tight -skew-x-6"
        style={{ letterSpacing: letterSpacingStyle }}
      >
        {/* Hours Digit Box */}
        <div
          className="relative px-3 sm:px-6 py-2 sm:py-4 rounded-xl border backdrop-blur-md transition-all duration-500"
          style={{
            borderColor: `${color.primary}50`,
            backgroundColor: 'rgba(5, 5, 10, 0.45)',
            boxShadow,
          }}
        >
          {/* Corner brackets */}
          <div
            className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2"
            style={{ borderColor: color.primary }}
          />
          <div
            className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2"
            style={{ borderColor: color.primary }}
          />

          <span
            className={`font-black ${fontSizeClass} block tracking-widest transition-all duration-500`}
            style={{
              color: color.primary,
              textShadow: glowBlur,
            }}
          >
            {hoursStr}
          </span>
        </div>

        {/* Cyber Neon Delimiter */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mx-2 sm:mx-4">
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-xs animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: glowStrength !== 'off' ? `0 0 14px ${color.primary}` : 'none',
            }}
          />
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-xs animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: glowStrength !== 'off' ? `0 0 14px ${color.primary}` : 'none',
            }}
          />
        </div>

        {/* Minutes Digit Box */}
        <div
          className="relative px-3 sm:px-6 py-2 sm:py-4 rounded-xl border backdrop-blur-md transition-all duration-500"
          style={{
            borderColor: `${color.secondary}50`,
            backgroundColor: 'rgba(5, 5, 10, 0.45)',
            boxShadow,
          }}
        >
          {/* Corner brackets */}
          <div
            className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2"
            style={{ borderColor: color.secondary }}
          />
          <div
            className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2"
            style={{ borderColor: color.secondary }}
          />

          <span
            className={`font-black ${fontSizeClass} block tracking-widest transition-all duration-500`}
            style={{
              color: color.secondary,
              textShadow: glowBlur,
            }}
          >
            {minutesStr}
          </span>
        </div>

        {/* Seconds Counter (Optional) */}
        {showSeconds && (
          <div className="ml-2 sm:ml-4 self-end mb-2 sm:mb-4 px-2 py-1 rounded border border-white/10 bg-black/60">
            <span
              className="text-lg sm:text-2xl md:text-3xl font-mono font-bold tracking-widest"
              style={{
                color: color.primary,
                textShadow: glowStrength !== 'off' ? `0 0 12px ${color.glow}` : 'none',
              }}
            >
              {secondsStr}
            </span>
          </div>
        )}
      </div>

      {/* Cyber Grid status footer */}
      <div
        className={`flex items-center gap-4 text-[9px] sm:text-[10px] text-zinc-500 font-mono tracking-widest ${
          clockAlignment === 'bottom' ? 'order-last mt-3' : 'absolute bottom-5 sm:bottom-8'
        }`}
      >
        <span>CORE // ONLINE</span>
        <span>•</span>
        <span style={{ color: color.primary }}>FPS // 60.0</span>
        <span>•</span>
        <span>HUD // ACTIVE</span>
      </div>
    </div>
  );
};
