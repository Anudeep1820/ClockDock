import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface AmbientGlowProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({
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

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full p-6 select-none cursor-pointer overflow-hidden ${typography.className}`}
    >
      {/* Ambient Breathing Background Radial Halo */}
      <div
        className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none transition-all duration-1000 animate-pulseGlow blur-3xl opacity-35"
        style={{
          background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Atmospheric Day & Period Header */}
      {showDate && (
        <div className="relative z-10 flex flex-col items-center mb-1 sm:mb-3">
          <span
            className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight"
            style={{
              color: color.primary,
              textShadow: `0 0 25px ${color.glow}`,
            }}
          >
            {dayOfWeek}
          </span>
          <span
            className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-75 mt-0.5"
            style={{ color: color.secondary }}
          >
            {timePeriod}
          </span>
        </div>
      )}

      {/* Oversized Luminous Digits */}
      <div className="relative z-10 my-2 sm:my-4 flex items-baseline leading-none">
        <span
          className="font-black text-7xl sm:text-9xl md:text-[12rem] lg:text-[14rem] tracking-tight transition-all duration-500"
          style={{
            color: color.primary,
            textShadow: `0 0 25px ${color.primary}, 0 0 60px ${color.glow}, 0 0 110px ${color.dimGlow}`,
          }}
        >
          {hours}:{minutes}
        </span>

        {!is24Hour && (
          <span
            className="text-xl sm:text-3xl md:text-4xl font-extrabold ml-3 sm:ml-5 uppercase tracking-wider"
            style={{
              color: color.secondary,
              textShadow: `0 0 20px ${color.glow}`,
            }}
          >
            {ampm}
          </span>
        )}
      </div>

      {/* Understated Date & Optional Seconds Pill */}
      <div className="relative z-10 flex items-center gap-3 mt-2 sm:mt-4">
        {showDate && (
          <div
            className="px-5 py-1.5 rounded-full border backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wider shadow-lg"
            style={{
              borderColor: `${color.primary}35`,
              backgroundColor: `${color.primary}12`,
              color: color.primary,
              boxShadow: `0 0 20px ${color.dimGlow}`,
            }}
          >
            {fullDate}
          </div>
        )}

        {showSeconds && (
          <div
            className="px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs sm:text-sm font-mono font-bold tracking-wider"
            style={{
              borderColor: `${color.secondary}35`,
              backgroundColor: `${color.secondary}12`,
              color: color.secondary,
            }}
          >
            :{seconds}
          </div>
        )}
      </div>
    </div>
  );
};
