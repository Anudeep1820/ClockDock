import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface StandByDigitalProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const StandByDigital: React.FC<StandByDigitalProps> = ({
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

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 transition-all duration-500 ${typography.className}`}
    >
      {/* Date Header Badge */}
      {showDate && (
        <div className="absolute top-6 sm:top-10 md:top-14 flex items-center gap-2.5 transition-all">
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
          className="font-black text-[28vw] sm:text-[25vw] md:text-[23vw] drop-shadow-2xl transition-colors duration-500"
          style={{
            color: color.primary,
            textShadow: `0 0 45px ${color.glow}, 0 20px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {hoursStr}
        </span>

        {/* Separator Breathing Dots */}
        <div className="flex flex-col justify-center items-center gap-[2.8vw] sm:gap-[2.2vw] mx-[1.6vw] sm:mx-[2vw]">
          <span
            className="w-[3.2vw] h-[3.2vw] sm:w-[2.4vw] sm:h-[2.4vw] rounded-full animate-pulse transition-all duration-500"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 20px ${color.primary}`,
            }}
          />
          <span
            className="w-[3.2vw] h-[3.2vw] sm:w-[2.4vw] sm:h-[2.4vw] rounded-full animate-pulse transition-all duration-500"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 20px ${color.primary}`,
            }}
          />
        </div>

        {/* Minutes (Secondary Softened Tone) */}
        <span
          className="font-black text-[28vw] sm:text-[25vw] md:text-[23vw] drop-shadow-2xl transition-colors duration-500"
          style={{
            color: color.secondary,
            textShadow: `0 0 45px ${color.glow}, 0 20px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {minutesStr}
        </span>
      </div>

      {/* Optional Seconds Display */}
      {showSeconds && (
        <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 flex items-center gap-3">
          <div className="w-32 sm:w-52 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(time.getSeconds() / 59) * 100}%`,
                backgroundColor: color.primary,
                boxShadow: `0 0 10px ${color.primary}`,
              }}
            />
          </div>
          <span
            className="font-mono text-xs sm:text-sm font-bold tracking-wider"
            style={{ color: color.primary }}
          >
            :{secondsStr}
          </span>
        </div>
      )}
    </div>
  );
};
