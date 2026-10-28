import React from 'react';
import { ColorPalette } from '../types';
import { MusicWidget } from './widgets/MusicWidget';

interface DualWidgetStandbyProps {
  time: Date;
  palette: ColorPalette;
  nightMode?: boolean;
  nightHex?: string;
  is24Hour?: boolean;
  bassPulse?: number;
}

export const DualWidgetStandby: React.FC<DualWidgetStandbyProps> = ({
  time,
  palette,
  nightMode = false,
  nightHex = '#ef4444',
  is24Hour = false,
  bassPulse = 0,
}) => {
  let hoursNum = time.getHours();
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hours = hoursNum.toString();
  const minutes = time.getMinutes().toString().padStart(2, '0');

  const hoursColor = nightMode ? nightHex : palette.hours;
  const minutesColor = nightMode ? nightHex : palette.minutes;

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-3 sm:p-6 md:p-10 gap-3 md:gap-8 max-w-7xl mx-auto overflow-hidden">
      {/* LEFT PANE: Digital StandBy Clock (Exact match for user screenshot) */}
      <div className="w-full md:w-1/2 h-[45%] md:h-full flex flex-col items-center justify-center select-none">
        <div
          className="flex items-center justify-center leading-none tracking-tighter transition-transform duration-75"
          style={{ transform: `scale(${1.0 + (bassPulse || 0) * 0.05})` }}
        >
          {/* Hours */}
          <span
            className="font-display-digits text-[22vw] md:text-[14vw] font-black drop-shadow-2xl transition-colors duration-500"
            style={{
              color: hoursColor,
              textShadow: nightMode
                ? `0 0 40px ${nightHex}70`
                : '0 15px 40px rgba(0,0,0,0.6)',
            }}
          >
            {hours}
          </span>

          {/* Separator Dots (two soft circles) */}
          <div className="flex flex-col justify-center items-center gap-[2vw] md:gap-[1.2vw] mx-[1.5vw] md:mx-[1vw]">
            <span
              className="w-[2.8vw] h-[2.8vw] md:w-[1.6vw] md:h-[1.6vw] rounded-full animate-pulse transition-colors"
              style={{
                backgroundColor: nightMode ? nightHex : palette.accent,
                boxShadow: nightMode ? `0 0 15px ${nightHex}` : `0 0 10px ${palette.accent}`,
              }}
            />
            <span
              className="w-[2.8vw] h-[2.8vw] md:w-[1.6vw] md:h-[1.6vw] rounded-full animate-pulse transition-colors"
              style={{
                backgroundColor: nightMode ? nightHex : palette.accent,
                boxShadow: nightMode ? `0 0 15px ${nightHex}` : `0 0 10px ${palette.accent}`,
              }}
            />
          </div>

          {/* Minutes */}
          <span
            className="font-display-digits text-[22vw] md:text-[14vw] font-black drop-shadow-2xl transition-colors duration-500"
            style={{
              color: minutesColor,
              textShadow: nightMode
                ? `0 0 40px ${nightHex}70`
                : '0 15px 40px rgba(0,0,0,0.6)',
            }}
          >
            {minutes}
          </span>
        </div>

        {/* Date subtle pill */}
        <div className="mt-2 sm:mt-4">
          <span
            className="text-xs sm:text-sm font-semibold tracking-wider uppercase px-3 py-1 rounded-full border backdrop-blur-md"
            style={{
              borderColor: nightMode ? `${nightHex}35` : 'rgba(255,255,255,0.12)',
              backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255,255,255,0.06)',
              color: nightMode ? nightHex : '#94a3b8',
            }}
          >
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* RIGHT PANE: Clean Music Player (Exact match for screenshot media_1793205103606_1bf7dda2.jpg) */}
      <div className="w-full md:w-1/2 h-[55%] md:h-full flex items-center justify-center">
        <MusicWidget nightMode={nightMode} nightHex={nightHex} />
      </div>
    </div>
  );
};
