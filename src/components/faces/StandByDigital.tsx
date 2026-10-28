import React from 'react';
import { ClockColor, TypographyStyle, NumeralSize, GlowStrength } from '../../types';

interface StandByDigitalProps {
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

export const StandByDigital: React.FC<StandByDigitalProps> = ({
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

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

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
      ? `0 0 65px ${color.glow}, 0 20px 40px rgba(0,0,0,0.9)`
      : `0 0 40px ${color.glow}, 0 15px 30px rgba(0,0,0,0.8)`;

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 transition-all duration-500 ${typography.className}`}
    >
      {/* Date Header Badge */}
      {showDate && (
        <div className="absolute top-5 sm:top-8 md:top-12 flex items-center gap-2.5 transition-all">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
            style={{
              borderColor: `${color.primary}30`,
              backgroundColor: `${color.primary}10`,
            }}
          >
            <span
              className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-widest"
              style={{ color: color.primary }}
            >
              {dayOfWeek} • {dateFormatted}
            </span>
          </div>

          {!is24Hour && (
            <span
              className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2 py-1 rounded-md border"
              style={{
                borderColor: `${color.secondary}30`,
                backgroundColor: `${color.secondary}12`,
                color: color.secondary,
              }}
            >
              {ampm}
            </span>
          )}
        </div>
      )}

      {/* GIANT DUAL-TONE DIGITS (Readable from across bedroom) */}
      <div className="flex items-center justify-center leading-none tracking-tighter">
        {/* Hours (Primary Accent) */}
        <span
          className={`font-black ${fontSizeClass} drop-shadow-2xl transition-all duration-500`}
          style={{
            color: color.primary,
            textShadow: glowShadow,
          }}
        >
          {hoursStr}
        </span>

        {/* Separator Breathing Dots */}
        <div className="flex flex-col justify-center items-center gap-[2.8vw] sm:gap-[2.2vw] mx-[1.6vw] sm:mx-[2vw]">
          <span
            className="w-[2.8vw] h-[2.8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full animate-pulse transition-all duration-500"
            style={{
              backgroundColor: color.primary,
              boxShadow: glowStrength !== 'off' ? `0 0 20px ${color.primary}` : 'none',
            }}
          />
          <span
            className="w-[2.8vw] h-[2.8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full animate-pulse transition-all duration-500"
            style={{
              backgroundColor: color.primary,
              boxShadow: glowStrength !== 'off' ? `0 0 20px ${color.primary}` : 'none',
            }}
          />
        </div>

        {/* Minutes (Secondary Subtle Accent) */}
        <span
          className={`font-black ${fontSizeClass} drop-shadow-2xl transition-all duration-500`}
          style={{
            color: color.secondary,
            textShadow: glowShadow,
          }}
        >
          {minutesStr}
        </span>

        {/* Optional Clean Seconds Indicator */}
        {showSeconds && (
          <div className="flex flex-col justify-end self-end mb-[2.5vw] ml-[1.5vw]">
            <span
              className="font-mono text-[5vw] sm:text-[4vw] md:text-[3.5vw] font-bold tracking-tight opacity-75"
              style={{ color: color.primary }}
            >
              {secondsStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
