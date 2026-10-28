import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface PremiumEditorialProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const PremiumEditorial: React.FC<PremiumEditorialProps> = ({
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
  const monthDayYear = time.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onCycleColor}
      className="relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-6 sm:p-10 font-serif-clock"
    >
      {/* Top Editorial Rule & Masthead Date */}
      {showDate && (
        <div className="absolute top-6 sm:top-10 md:top-14 flex flex-col items-center gap-1.5 transition-all text-center">
          <div className="flex items-center gap-3 text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase font-bold text-zinc-300">
            <span>{weekday}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-500" />
            <span>{monthDayYear}</span>
          </div>
          <div
            className="w-20 sm:w-32 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${color.primary}80, transparent)`,
            }}
          />
        </div>
      )}

      {/* LUXURY SERIF CLOCK NUMERALS */}
      <div className="flex items-baseline justify-center leading-none tracking-normal">
        <span
          className="font-normal italic text-[28vw] sm:text-[24vw] md:text-[22vw] drop-shadow-2xl transition-colors duration-500 pr-1"
          style={{
            color: color.primary,
            textShadow: `0 15px 40px rgba(0,0,0,0.8), 0 0 35px ${color.dimGlow}`,
          }}
        >
          {hoursStr}
        </span>

        {/* Elegant Colon Dot */}
        <span
          className="font-light text-[14vw] sm:text-[12vw] md:text-[10vw] mx-1 sm:mx-2 -translate-y-[2vw] transition-colors duration-500 opacity-60"
          style={{ color: color.secondary }}
        >
          :
        </span>

        <span
          className="font-normal text-[28vw] sm:text-[24vw] md:text-[22vw] drop-shadow-2xl transition-colors duration-500"
          style={{
            color: color.secondary,
            textShadow: `0 15px 40px rgba(0,0,0,0.8), 0 0 35px ${color.dimGlow}`,
          }}
        >
          {minutesStr}
        </span>

        {!is24Hour && (
          <span
            className="text-xs sm:text-base md:text-xl font-sans font-bold ml-2 sm:ml-4 tracking-[0.25em] uppercase -translate-y-[8vw] sm:-translate-y-[6vw]"
            style={{ color: color.primary }}
          >
            {ampm}
          </span>
        )}
      </div>

      {/* Bottom Fine Swiss Inscription */}
      <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 flex flex-col items-center gap-1">
        {showSeconds ? (
          <span
            className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: color.secondary }}
          >
            CHRONOGRAPH : {secondsStr}S
          </span>
        ) : (
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.4em] font-sans font-bold uppercase opacity-60 text-zinc-400"
          >
            PRECISION STANDBY
          </span>
        )}
      </div>
    </div>
  );
};
