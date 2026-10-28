import React from 'react';
import { ClockColor, TypographyStyle, NumeralSize, GlowStrength } from '../../types';

interface AmbientGlowProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  numeralSize?: NumeralSize;
  glowStrength?: GlowStrength;
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
  glowStrength = 'subtle',
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

  const glowShadow =
    glowStrength === 'off'
      ? 'none'
      : glowStrength === 'vibrant'
      ? `0 0 60px ${color.glow}, 0 0 100px ${color.glow}`
      : `0 0 35px ${color.glow}, 0 0 70px ${color.dimGlow}`;

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full p-6 select-none cursor-pointer overflow-hidden ${typography.className}`}
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
        <div className="absolute top-6 sm:top-10 flex flex-col items-center gap-1 transition-all z-10">
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
      <div className="relative z-10 flex items-center justify-center tracking-tighter leading-none select-none">
        <span
          className={`font-black ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: glowShadow,
          }}
        >
          {hours}
        </span>

        {/* Floating Ambient Colon */}
        <span
          className={`font-black ${fontSizeClass} mx-[1.5vw] opacity-80 animate-pulse`}
          style={{
            color: color.secondary,
            textShadow: glowShadow,
          }}
        >
          :
        </span>

        <span
          className={`font-black ${fontSizeClass} transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: glowShadow,
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
      <div className="absolute bottom-6 sm:bottom-10 flex items-center gap-2 text-xs text-zinc-500 font-mono tracking-widest z-10">
        <span
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: color.primary }}
        />
        <span>ATMOSPHERE MODE</span>
      </div>
    </div>
  );
};
