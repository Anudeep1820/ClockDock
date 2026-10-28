import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface AuroraDigitalProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const AuroraDigital: React.FC<AuroraDigitalProps> = ({
  time,
  color,
  typography,
  is24Hour,
  showDate,
  showSeconds,
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
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 ${typography.className}`}
    >
      {/* Date Header Pill */}
      {showDate && (
        <div className="absolute top-6 sm:top-10 md:top-14 flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-xl shadow-xl"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(5, 10, 15, 0.55)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-zinc-200">
              {weekday} • {dateFormatted}
            </span>
          </div>
        </div>
      )}

      {/* Frosted Floating Glass Card (Guarantees 100% legibility on any animated background) */}
      <div
        className="relative px-6 sm:px-12 py-4 sm:py-8 rounded-3xl border backdrop-blur-2xl transition-all duration-500 shadow-2xl flex items-center justify-center"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.14)',
          backgroundColor: 'rgba(5, 8, 14, 0.65)',
          boxShadow: `0 25px 50px -10px rgba(0,0,0,0.8), 0 0 50px ${color.dimGlow}`,
        }}
      >
        <div className="flex items-center justify-center leading-none tracking-tight">
          <span
            className="font-black text-[25vw] sm:text-[22vw] md:text-[19vw] drop-shadow-2xl transition-colors duration-500"
            style={{
              color: color.primary,
              textShadow: `0 0 40px ${color.glow}`,
            }}
          >
            {hoursStr}
          </span>

          {/* Separator Dots */}
          <div className="flex flex-col justify-center items-center gap-4 sm:gap-6 mx-3 sm:mx-6">
            <span
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"
              style={{
                backgroundColor: color.primary,
                boxShadow: `0 0 16px ${color.primary}`,
              }}
            />
            <span
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse"
              style={{
                backgroundColor: color.primary,
                boxShadow: `0 0 16px ${color.primary}`,
              }}
            />
          </div>

          <span
            className="font-black text-[25vw] sm:text-[22vw] md:text-[19vw] drop-shadow-2xl transition-colors duration-500"
            style={{
              color: color.secondary,
              textShadow: `0 0 40px ${color.glow}`,
            }}
          >
            {minutesStr}
          </span>
        </div>
      </div>

      {/* Seconds / AM-PM indicator */}
      <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 flex items-center gap-3">
        {!is24Hour && (
          <span
            className="text-xs sm:text-sm font-bold tracking-widest uppercase px-3 py-1 rounded-full border backdrop-blur-md"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: color.primary,
            }}
          >
            {ampm}
          </span>
        )}

        {showSeconds && (
          <span
            className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border backdrop-blur-md text-zinc-300"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            :{secondsStr}
          </span>
        )}
      </div>
    </div>
  );
};
