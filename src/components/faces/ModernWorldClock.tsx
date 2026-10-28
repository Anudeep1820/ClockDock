import React from 'react';
import { ClockColor, TypographyStyle } from '../../types';
import { Globe, ArrowRight } from 'lucide-react';

interface ModernWorldClockProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  worldCity: string;
  worldTimezone: string;
  showSecondary: boolean;
  onCycleColor?: () => void;
}

export const ModernWorldClock: React.FC<ModernWorldClockProps> = ({
  time,
  color,
  typography,
  is24Hour,
  showDate,
  showSeconds,
  worldCity,
  worldTimezone,
  showSecondary,
  onCycleColor,
}) => {
  // Local time formatting
  let localHoursNum = time.getHours();
  const localAmpm = localHoursNum >= 12 ? 'PM' : 'AM';
  if (!is24Hour) {
    localHoursNum = localHoursNum % 12 || 12;
  }
  const localHours = localHoursNum.toString();
  const localMinutes = time.getMinutes().toString().padStart(2, '0');
  const localSeconds = time.getSeconds().toString().padStart(2, '0');

  // World City time formatting using native Intl.DateTimeFormat (accurate DST)
  let worldHours = '12';
  let worldMinutes = '00';
  let worldAmpm = 'AM';
  let worldDayStr = '';
  let timeDiffStr = '';

  try {
    const worldFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: worldTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour,
      weekday: 'short',
    });

    const parts = worldFormatter.formatToParts(time);
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '12';
    const minPart = parts.find((p) => p.type === 'minute')?.value || '00';
    const dayPart = parts.find((p) => p.type === 'weekday')?.value || '';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';

    worldHours = hourPart;
    worldMinutes = minPart;
    worldAmpm = dayPeriod;
    worldDayStr = dayPart;

    // Calculate approximate hour difference
    const localUtcHours = time.getUTCHours() + time.getUTCMinutes() / 60;
    // Get target zone hour
    const targetDateStr = time.toLocaleString('en-US', { timeZone: worldTimezone });
    const targetDate = new Date(targetDateStr);
    const localNow = new Date();
    const diffHours = Math.round((targetDate.getTime() - localNow.getTime()) / (1000 * 60 * 60));

    timeDiffStr = diffHours === 0 ? 'Same time' : diffHours > 0 ? `+${diffHours} hrs` : `${diffHours} hrs`;
  } catch (err) {
    console.warn('World clock timezone calculation error:', err);
  }

  const weekday = time.toLocaleDateString(undefined, { weekday: 'long' });
  const dateFormatted = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full select-none cursor-pointer p-4 sm:p-6 transition-all duration-500 ${typography.className}`}
    >
      {/* Date Header Badge */}
      {showDate && (
        <div className="absolute top-6 sm:top-10 md:top-12 flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
            style={{
              borderColor: `${color.primary}30`,
              backgroundColor: `${color.primary}10`,
            }}
          >
            <span
              className="text-xs sm:text-sm font-semibold tracking-wider text-zinc-300"
            >
              Local Time • {weekday}, {dateFormatted}
            </span>
          </div>
        </div>
      )}

      {/* PRIMARY LOCAL CLOCK */}
      <div className="flex items-center justify-center leading-none tracking-tight">
        <span
          className="font-black text-[25vw] sm:text-[22vw] md:text-[19vw] drop-shadow-2xl transition-colors duration-500"
          style={{
            color: color.primary,
            textShadow: `0 0 40px ${color.glow}, 0 20px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {localHours}
        </span>

        {/* Separator Dots */}
        <div className="flex flex-col justify-center items-center gap-4 sm:gap-6 mx-2 sm:mx-4">
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
            textShadow: `0 0 40px ${color.glow}, 0 20px 40px rgba(0,0,0,0.8)`,
          }}
        >
          {localMinutes}
        </span>

        {!is24Hour && (
          <span
            className="text-xs sm:text-base md:text-xl font-bold ml-2 sm:ml-4 tracking-widest uppercase opacity-80"
            style={{ color: color.primary }}
          >
            {localAmpm}
          </span>
        )}
      </div>

      {/* SECONDARY WORLD CLOCK CARD (Configurable World City) */}
      {showSecondary && (
        <div
          className="mt-4 sm:mt-6 flex items-center gap-3 sm:gap-5 px-5 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all"
          style={{
            borderColor: `${color.primary}30`,
            backgroundColor: 'rgba(5, 8, 15, 0.7)',
            boxShadow: `0 15px 35px rgba(0,0,0,0.7), 0 0 25px ${color.dimGlow}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="text-sm sm:text-base font-black tracking-tight text-white">
              {worldCity}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/20" />

          {/* Target Time */}
          <div className="flex items-baseline gap-1.5 font-mono">
            <span
              className="text-lg sm:text-2xl font-black"
              style={{ color: color.primary }}
            >
              {worldHours}:{worldMinutes}
            </span>
            {!is24Hour && (
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">
                {worldAmpm}
              </span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-white/20" />

          {/* Time difference tag */}
          <span className="text-[11px] sm:text-xs font-bold text-sky-300">
            {timeDiffStr}
          </span>
        </div>
      )}

      {/* Seconds counter */}
      {showSeconds && (
        <div className="absolute bottom-4 sm:bottom-8 flex items-center gap-2">
          <span
            className="font-mono text-xs sm:text-sm font-bold tracking-wider text-zinc-400"
          >
            SEC :{localSeconds}
          </span>
        </div>
      )}
    </div>
  );
};
