import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface MatrixMinimalProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const MatrixMinimal: React.FC<MatrixMinimalProps> = ({
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
  const hoursStr = hoursNum.toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div
      onClick={onCycleColor}
      className="relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 font-mono-geo transition-all duration-500"
    >
      {/* Top Monospaced Inscription */}
      {showDate && (
        <div className="absolute top-6 sm:top-10 md:top-14 flex items-center gap-2">
          <div
            className="px-3.5 py-1 rounded border backdrop-blur-md"
            style={{
              borderColor: `${color.primary}35`,
              backgroundColor: 'rgba(5, 5, 5, 0.6)',
            }}
          >
            <span
              className="text-xs sm:text-sm font-bold tracking-[0.25em]"
              style={{
                color: color.primary,
                textShadow: `0 0 10px ${color.dimGlow}`,
              }}
            >
              [{dayOfWeek}] {dateFormatted}
            </span>
          </div>
        </div>
      )}

      {/* MATRIX MONOSPACE DIGITS */}
      <div className="flex items-center justify-center leading-none tracking-tight">
        <span
          className="font-black text-[27vw] sm:text-[24vw] md:text-[22vw] transition-colors duration-500"
          style={{
            color: color.primary,
            textShadow: `0 0 20px ${color.glow}, 0 0 45px ${color.dimGlow}`,
          }}
        >
          {hoursStr}
        </span>

        {/* Square Phosphor Colon */}
        <div className="flex flex-col justify-center items-center gap-4 sm:gap-6 mx-2 sm:mx-4">
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 12px ${color.primary}`,
            }}
          />
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 12px ${color.primary}`,
            }}
          />
        </div>

        <span
          className="font-black text-[27vw] sm:text-[24vw] md:text-[22vw] transition-colors duration-500"
          style={{
            color: color.primary,
            textShadow: `0 0 20px ${color.glow}, 0 0 45px ${color.dimGlow}`,
          }}
        >
          {minutesStr}
        </span>
      </div>

      {/* Bottom Footer: Seconds & AM/PM */}
      <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 flex items-center gap-4">
        {!is24Hour && (
          <span
            className="text-xs sm:text-sm font-bold tracking-[0.2em] px-2.5 py-0.5 rounded border"
            style={{
              borderColor: `${color.primary}35`,
              backgroundColor: `${color.primary}10`,
              color: color.primary,
            }}
          >
            {ampm}
          </span>
        )}

        {showSeconds && (
          <span
            className="text-xs sm:text-sm font-bold tracking-[0.2em] px-2.5 py-0.5 rounded border"
            style={{
              borderColor: `${color.secondary}35`,
              backgroundColor: `${color.secondary}10`,
              color: color.secondary,
            }}
          >
            SEC:{secondsStr}
          </span>
        )}
      </div>
    </div>
  );
};
