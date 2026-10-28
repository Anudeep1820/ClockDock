import React from 'react';

interface ClockNightGlowProps {
  time: Date;
  nightMode?: boolean;
  nightHex?: string;
  is24Hour?: boolean;
}

export const ClockNightGlow: React.FC<ClockNightGlowProps> = ({
  time,
  nightMode = false,
  nightHex = '#ef4444',
  is24Hour = false,
}) => {
  let hoursNum = time.getHours();
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hours = hoursNum.toString();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const dayName = time.toLocaleDateString(undefined, { weekday: 'long' });
  const timePeriod = time.getHours() >= 18 || time.getHours() < 5 ? 'Night' : time.getHours() >= 12 ? 'Afternoon' : 'Morning';
  const fullDate = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const activeColor = nightMode ? nightHex : '#ffffff';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 select-none text-center">
      {/* Subtle night stars in background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full bg-white animate-ping" />
        <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="absolute bottom-[25%] left-[25%] w-1 h-1 rounded-full bg-white animate-pulse" />
        <div className="absolute bottom-[35%] right-[15%] w-1 h-1 rounded-full bg-white animate-ping" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Day & Period */}
        <div className="flex flex-col items-center">
          <span
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: activeColor }}
          >
            {dayName}
          </span>
          <span
            className="text-sm sm:text-lg font-medium tracking-widest uppercase opacity-70 mt-1"
            style={{ color: activeColor }}
          >
            {timePeriod}
          </span>
        </div>

        {/* Massive Soft Digital Time */}
        <div className="my-3 sm:my-6 flex items-baseline">
          <span
            className="font-display-digits text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tight"
            style={{
              color: activeColor,
              textShadow: nightMode
                ? `0 0 40px ${nightHex}70`
                : '0 0 30px rgba(255,255,255,0.2)',
            }}
          >
            {hours}:{minutes}
          </span>
          {!is24Hour && (
            <span
              className="text-lg sm:text-2xl font-bold ml-3 uppercase tracking-wider opacity-80"
              style={{ color: activeColor }}
            >
              {ampm}
            </span>
          )}
        </div>

        {/* Full Date */}
        <div
          className="px-6 py-2 rounded-full border backdrop-blur-md text-sm sm:text-base font-semibold tracking-wider"
          style={{
            borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255,255,255,0.05)',
            color: activeColor,
          }}
        >
          {fullDate}
        </div>
      </div>
    </div>
  );
};
