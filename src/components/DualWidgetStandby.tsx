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
  isLandscape?: boolean;
}

export const DualWidgetStandby: React.FC<DualWidgetStandbyProps> = ({
  time,
  palette,
  nightMode = false,
  nightHex = '#ef4444',
  is24Hour = false,
  bassPulse = 0,
  isLandscape = true,
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
    <div
      className={`w-full h-full flex items-center justify-between overflow-hidden transition-all duration-300 ${
        isLandscape
          ? 'flex-row px-4 sm:px-8 py-2' // STRICTLY BESIDE EACH OTHER IN LANDSCAPE
          : 'flex-col py-6 px-3'         // Stacked in portrait
      }`}
    >
      {/* LEFT WIDGET: Giant Readable StandBy Clock */}
      <div
        className={`flex flex-col items-center justify-center select-none ${
          isLandscape
            ? 'w-1/2 h-full border-r border-white/5 pr-3 sm:pr-6'
            : 'w-full h-[45%] border-b border-white/5 pb-2'
        }`}
      >
        <div
          className="flex items-center justify-center leading-none tracking-tighter transition-transform duration-75"
          style={{ transform: `scale(${1.0 + (bassPulse || 0) * 0.05})` }}
        >
          {/* Hours */}
          <span
            className={`font-display-digits font-black drop-shadow-2xl transition-colors duration-500 ${
              isLandscape
                ? 'text-[15vw] sm:text-[14vw] md:text-[12vw]'
                : 'text-[24vw]'
            }`}
            style={{
              color: hoursColor,
              textShadow: nightMode
                ? `0 0 40px ${nightHex}70`
                : '0 15px 40px rgba(0,0,0,0.6)',
            }}
          >
            {hours}
          </span>

          {/* Separator Dots */}
          <div
            className={`flex flex-col justify-center items-center ${
              isLandscape ? 'gap-[1.2vw] mx-[1vw]' : 'gap-[2vw] mx-[1.5vw]'
            }`}
          >
            <span
              className={`rounded-full animate-pulse transition-colors ${
                isLandscape ? 'w-[1.6vw] h-[1.6vw]' : 'w-[2.8vw] h-[2.8vw]'
              }`}
              style={{
                backgroundColor: nightMode ? nightHex : palette.accent,
                boxShadow: nightMode ? `0 0 15px ${nightHex}` : `0 0 10px ${palette.accent}`,
              }}
            />
            <span
              className={`rounded-full animate-pulse transition-colors ${
                isLandscape ? 'w-[1.6vw] h-[1.6vw]' : 'w-[2.8vw] h-[2.8vw]'
              }`}
              style={{
                backgroundColor: nightMode ? nightHex : palette.accent,
                boxShadow: nightMode ? `0 0 15px ${nightHex}` : `0 0 10px ${palette.accent}`,
              }}
            />
          </div>

          {/* Minutes */}
          <span
            className={`font-display-digits font-black drop-shadow-2xl transition-colors duration-500 ${
              isLandscape
                ? 'text-[15vw] sm:text-[14vw] md:text-[12vw]'
                : 'text-[24vw]'
            }`}
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

        {/* Date Pill below clock */}
        <div className="mt-2 sm:mt-3">
          <span
            className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border backdrop-blur-md"
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

      {/* RIGHT WIDGET: Music Player with Album Art & Controls (Strictly Beside Clock) */}
      <div
        className={`flex items-center justify-center ${
          isLandscape ? 'w-1/2 h-full pl-3 sm:pl-6' : 'w-full h-[55%] pt-2'
        }`}
      >
        <MusicWidget nightMode={nightMode} nightHex={nightHex} />
      </div>
    </div>
  );
};
