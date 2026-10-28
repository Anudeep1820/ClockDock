import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface MinimalAnalogProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const MinimalAnalog: React.FC<MinimalAnalogProps> = ({
  time,
  color,
  typography,
  showDate,
  showSeconds,
  onCycleColor,
}) => {
  // Sub-second precision for butter-smooth sweeping second hand
  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  const dateDay = time.getDate();
  const dayName = time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 select-none cursor-pointer ${typography.className}`}
    >
      {/* Clock Dial Container */}
      <div
        className="relative w-[75vw] h-[75vw] max-w-[340px] max-h-[340px] sm:max-w-[420px] sm:max-h-[420px] md:max-w-[480px] md:max-h-[480px] rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl"
        style={{
          background: 'radial-gradient(circle at 50% 45%, #18181c 0%, #0d0d10 65%, #050507 100%)',
          border: `1.5px solid ${color.primary}35`,
          boxShadow: `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 40px ${color.dimGlow}, inset 0 1px 1px rgba(255,255,255,0.15)`,
        }}
      >
        {/* Cardinal Hour Numbers: 12, 3, 6, 9 */}
        <span
          className="absolute top-5 sm:top-7 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: color.primary }}
        >
          12
        </span>
        <span
          className="absolute right-6 sm:right-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: color.primary }}
        >
          3
        </span>
        <span
          className="absolute bottom-5 sm:bottom-7 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: color.primary }}
        >
          6
        </span>
        <span
          className="absolute left-6 sm:left-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: color.primary }}
        >
          9
        </span>

        {/* 60 Radial Tick Marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isFiveMin = i % 5 === 0;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 pointer-events-none"
              style={{ transform: `rotate(${i * 6}deg)` }}
            >
              <div
                className="w-full rounded-full transition-colors duration-300"
                style={{
                  height: isFiveMin ? '12px' : '5px',
                  width: isFiveMin ? '2.5px' : '1px',
                  backgroundColor: isFiveMin ? color.primary : `${color.secondary}35`,
                }}
              />
            </div>
          );
        })}

        {/* Date Complication Window at 3 o'clock */}
        {showDate && (
          <div
            className="absolute right-14 sm:right-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md border backdrop-blur-md shadow-inner"
            style={{
              borderColor: `${color.primary}30`,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
          >
            <span
              className="text-[9px] sm:text-[11px] font-bold tracking-wider"
              style={{ color: color.secondary }}
            >
              {dayName}
            </span>
            <span
              className="text-xs sm:text-sm font-black font-mono"
              style={{ color: color.primary }}
            >
              {dateDay}
            </span>
          </div>
        )}

        {/* Hour Hand */}
        <div
          className="absolute w-2 sm:w-2.5 rounded-full transition-transform z-10"
          style={{
            height: '28%',
            top: '22%',
            left: 'calc(50% - 4px)',
            transformOrigin: '50% 100%',
            transform: `rotate(${hourDeg}deg)`,
            backgroundColor: color.primary,
            boxShadow: '0 4px 10px rgba(0,0,0,0.7)',
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-1.5 sm:w-2 rounded-full transition-transform z-10"
          style={{
            height: '38%',
            top: '12%',
            left: 'calc(50% - 3px)',
            transformOrigin: '50% 100%',
            transform: `rotate(${minuteDeg}deg)`,
            backgroundColor: color.secondary,
            boxShadow: '0 4px 10px rgba(0,0,0,0.7)',
          }}
        />

        {/* Continuous Sweeping Second Hand (Optional) */}
        {showSeconds && (
          <div
            className="absolute w-[1.5px] sm:w-[2px] transition-transform z-20"
            style={{
              height: '47%',
              top: '8%',
              left: 'calc(50% - 1px)',
              transformOrigin: '50% 89%',
              transform: `rotate(${secondDeg}deg)`,
              backgroundColor: color.primary,
              boxShadow: `0 0 10px ${color.glow}`,
            }}
          >
            {/* Counterbalance lollipop dot */}
            <div
              className="w-2.5 h-2.5 rounded-full -left-[4px] absolute top-6"
              style={{
                backgroundColor: color.primary,
                boxShadow: `0 0 8px ${color.glow}`,
              }}
            />
          </div>
        )}

        {/* Center Cap Nut */}
        <div
          className="absolute w-4 h-4 rounded-full z-30 shadow-md border-2 border-black"
          style={{
            backgroundColor: color.primary,
          }}
        />
      </div>
    </div>
  );
};
