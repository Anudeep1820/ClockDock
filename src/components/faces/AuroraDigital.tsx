import React from 'react';
import { ClockColor, TypographyStyle, NumeralSize, GlowStrength } from '../../types';

interface AuroraDigitalProps {
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

export const AuroraDigital: React.FC<AuroraDigitalProps> = ({
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
  const hoursStr = hoursNum.toString();
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const weekday = time.toLocaleDateString(undefined, { weekday: 'long' });
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  const fontSizeClass =
    numeralSize === 'standard'
      ? 'text-6xl sm:text-8xl md:text-9xl'
      : numeralSize === 'xlarge'
      ? 'text-8xl sm:text-[10rem] md:text-[12rem]'
      : 'text-7xl sm:text-9xl md:text-[10rem]';

  const glowBox =
    glowStrength === 'off'
      ? 'none'
      : glowStrength === 'vibrant'
      ? `0 30px 60px -12px rgba(0,0,0,0.8), 0 0 50px ${color.glow}`
      : `0 25px 50px -12px rgba(0,0,0,0.7), 0 0 25px ${color.dimGlow}`;

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 select-none cursor-pointer ${typography.className}`}
    >
      {/* Floating Glassmorphic Aurora Card Container */}
      <div
        className="relative flex flex-col items-center justify-center p-6 sm:p-10 md:p-14 rounded-3xl sm:rounded-[40px] border border-white/15 backdrop-blur-2xl transition-all duration-700"
        style={{
          background: 'rgba(8, 8, 14, 0.45)',
          boxShadow: glowBox,
        }}
      >
        {/* Date Complication Header inside card */}
        {showDate && (
          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <span
              className="text-xs sm:text-sm font-semibold tracking-wide"
              style={{ color: color.primary }}
            >
              {weekday}, {dateFormatted}
            </span>
            {!is24Hour && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                {ampm}
              </span>
            )}
          </div>
        )}

        {/* Large Digits with Soft Gradient Flow */}
        <div className="flex items-center justify-center leading-none tracking-tighter">
          <span
            className={`font-black ${fontSizeClass} transition-all duration-500`}
            style={{
              color: color.primary,
              textShadow: glowStrength !== 'off' ? `0 0 40px ${color.glow}` : 'none',
            }}
          >
            {hoursStr}
          </span>

          <span
            className={`font-black ${fontSizeClass} mx-2 sm:mx-4 opacity-75 animate-pulse`}
            style={{ color: color.secondary }}
          >
            :
          </span>

          <span
            className={`font-black ${fontSizeClass} transition-all duration-500`}
            style={{
              color: color.secondary,
              textShadow: glowStrength !== 'off' ? `0 0 40px ${color.glow}` : 'none',
            }}
          >
            {minutesStr}
          </span>

          {/* Seconds Pill (Optional) */}
          {showSeconds && (
            <div className="ml-3 sm:ml-5 self-end mb-2 sm:mb-4 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
              <span
                className="font-mono text-lg sm:text-2xl font-bold"
                style={{ color: color.primary }}
              >
                {secondsStr}
              </span>
            </div>
          )}
        </div>

        {/* Subtle Atmospheric Light Bar */}
        <div
          className="w-24 sm:w-36 h-1 rounded-full mt-4 sm:mt-6 transition-all duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${color.primary}, transparent)`,
            boxShadow: glowStrength !== 'off' ? `0 0 15px ${color.primary}` : 'none',
          }}
        />
      </div>
    </div>
  );
};
