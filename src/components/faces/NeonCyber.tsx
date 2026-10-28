import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface NeonCyberProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const NeonCyber: React.FC<NeonCyberProps> = ({
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
    day: 'numeric',
  }).toUpperCase();

  return (
    <div
      onClick={onCycleColor}
      className="relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 transition-all duration-500 font-cyber"
    >
      {/* Top Cyber Status Bar */}
      {showDate && (
        <div className="absolute top-5 sm:top-8 md:top-12 flex items-center gap-2 sm:gap-3 transition-all">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-sm border backdrop-blur-md shadow-lg -skew-x-12"
            style={{
              borderColor: `${color.primary}45`,
              backgroundColor: `${color.primary}12`,
              boxShadow: `0 0 15px ${color.dimGlow}`,
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
                boxShadow: `0 0 10px ${color.dimGlow}`,
              }}
            >
              <span className="inline-block skew-x-12">{ampm}</span>
            </span>
          )}
        </div>
      )}

      {/* OVERSIZED FUTURISTIC NUMERALS */}
      <div className="flex items-center justify-center leading-none tracking-tight -skew-x-6">
        {/* Hours Digit Box */}
        <div
          className="relative px-3 sm:px-6 py-2 sm:py-4 rounded-xl border backdrop-blur-md transition-all duration-500"
          style={{
            borderColor: `${color.primary}50`,
            backgroundColor: 'rgba(5, 5, 10, 0.45)',
            boxShadow: `0 0 35px ${color.dimGlow}, inset 0 0 20px ${color.dimGlow}`,
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
            className="font-black text-[24vw] sm:text-[22vw] md:text-[20vw] drop-shadow-2xl transition-colors duration-500"
            style={{
              color: color.primary,
              textShadow: `0 0 30px ${color.glow}, 0 0 60px ${color.dimGlow}`,
              WebkitTextStroke: `1px ${color.primary}60`,
            }}
          >
            {hoursStr}
          </span>
        </div>

        {/* Cyber Neon Separator Colon */}
        <div className="flex flex-col justify-center items-center gap-3 sm:gap-5 mx-2 sm:mx-4">
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rotate-45 animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 15px ${color.primary}`,
            }}
          />
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rotate-45 animate-pulse"
            style={{
              backgroundColor: color.primary,
              boxShadow: `0 0 15px ${color.primary}`,
            }}
          />
        </div>

        {/* Minutes Digit Box */}
        <div
          className="relative px-3 sm:px-6 py-2 sm:py-4 rounded-xl border backdrop-blur-md transition-all duration-500"
          style={{
            borderColor: `${color.secondary}50`,
            backgroundColor: 'rgba(5, 5, 10, 0.45)',
            boxShadow: `0 0 35px ${color.dimGlow}, inset 0 0 20px ${color.dimGlow}`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2"
            style={{ borderColor: color.secondary }}
          />
          <div
            className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2"
            style={{ borderColor: color.secondary }}
          />
          <span
            className="font-black text-[24vw] sm:text-[22vw] md:text-[20vw] drop-shadow-2xl transition-colors duration-500"
            style={{
              color: color.secondary,
              textShadow: `0 0 30px ${color.glow}, 0 0 60px ${color.dimGlow}`,
              WebkitTextStroke: `1px ${color.secondary}60`,
            }}
          >
            {minutesStr}
          </span>
        </div>
      </div>

      {/* Cyber Seconds Bar */}
      {showSeconds && (
        <div className="absolute bottom-6 sm:bottom-10 md:bottom-12 flex items-center gap-3 -skew-x-6">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-sm border"
            style={{
              borderColor: `${color.primary}35`,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <span
              className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase"
              style={{ color: color.primary }}
            >
              SYNC : {secondsStr}S
            </span>
          </div>
          <div className="w-24 sm:w-36 h-1.5 rounded-sm bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${(time.getSeconds() / 59) * 100}%`,
                backgroundColor: color.primary,
                boxShadow: `0 0 10px ${color.primary}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
