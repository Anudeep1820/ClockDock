import React from 'react';
import { ColorPalette } from '../types';

interface ClockBigBoldProps {
  time: Date;
  palette: ColorPalette;
  is24Hour?: boolean;
  nightMode?: boolean;
  nightHex?: string;
  onCyclePalette?: () => void;
}

export const ClockBigBold: React.FC<ClockBigBoldProps> = ({
  time,
  palette,
  is24Hour = false,
  nightMode = false,
  nightHex = '#ef4444',
  onCyclePalette,
}) => {
  let hoursNum = time.getHours();
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hoursStr = hoursNum.toString();
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const hoursColor = nightMode ? nightHex : palette.hours;
  const minutesColor = nightMode ? nightHex : palette.minutes;

  const dayOfWeek = time.toLocaleDateString(undefined, { weekday: 'long' });
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onCyclePalette}
      className="relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 group"
    >
      {/* Date & Day Header badge */}
      <div className="absolute top-4 sm:top-8 flex items-center gap-3">
        <span
          className="text-xs sm:text-sm font-semibold tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-md transition-colors"
          style={{
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255, 255, 255, 0.08)',
            color: nightMode ? nightHex : '#e2e8f0',
            border: `1px solid ${nightMode ? `${nightHex}30` : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          {dayOfWeek} • {dateFormatted}
        </span>
        {!is24Hour && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded tracking-widest uppercase"
            style={{
              color: nightMode ? nightHex : palette.accent,
              backgroundColor: nightMode ? `${nightHex}20` : 'rgba(0,0,0,0.5)',
            }}
          >
            {ampm}
          </span>
        )}
      </div>

      {/* GIANT ACROSS-THE-ROOM DIGITS */}
      <div className="flex items-center justify-center leading-none tracking-tighter">
        {/* Hours */}
        <span
          className="font-display-digits text-[26vw] sm:text-[24vw] md:text-[23vw] font-black transition-colors duration-500 drop-shadow-2xl"
          style={{
            color: hoursColor,
            textShadow: nightMode
              ? `0 0 40px ${nightHex}60, 0 0 80px ${nightHex}30`
              : '0 15px 40px rgba(0,0,0,0.6)',
          }}
        >
          {hoursStr}
        </span>

        {/* Separator Dots (soft pulse) */}
        <div className="flex flex-col justify-center items-center gap-[2.5vw] sm:gap-[2.2vw] mx-[1.5vw]">
          <span
            className="w-[3.5vw] h-[3.5vw] rounded-full animate-pulse transition-colors duration-500"
            style={{
              backgroundColor: nightMode ? nightHex : palette.accent,
              boxShadow: nightMode ? `0 0 20px ${nightHex}` : `0 0 15px ${palette.accent}`,
            }}
          />
          <span
            className="w-[3.5vw] h-[3.5vw] rounded-full animate-pulse transition-colors duration-500"
            style={{
              backgroundColor: nightMode ? nightHex : palette.accent,
              boxShadow: nightMode ? `0 0 20px ${nightHex}` : `0 0 15px ${palette.accent}`,
            }}
          />
        </div>

        {/* Minutes */}
        <span
          className="font-display-digits text-[26vw] sm:text-[24vw] md:text-[23vw] font-black transition-colors duration-500 drop-shadow-2xl"
          style={{
            color: minutesColor,
            textShadow: nightMode
              ? `0 0 40px ${nightHex}60, 0 0 80px ${nightHex}30`
              : '0 15px 40px rgba(0,0,0,0.6)',
          }}
        >
          {minutesStr}
        </span>
      </div>

      {/* Seconds Bar / Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 flex items-center gap-3">
        <div className="w-32 sm:w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(time.getSeconds() / 59) * 100}%`,
              backgroundColor: nightMode ? nightHex : palette.accent,
              boxShadow: `0 0 10px ${nightMode ? nightHex : palette.accent}`,
            }}
          />
        </div>
        <span
          className="font-mono text-xs sm:text-sm font-semibold tracking-wider"
          style={{ color: nightMode ? nightHex : '#94a3b8' }}
        >
          :{secondsStr}
        </span>
      </div>

      {/* Subtle tap hint */}
      <span className="absolute bottom-2 text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Tap clock to switch color palette
      </span>
    </div>
  );
};
