import React from 'react';

interface ClockAnalogProps {
  time: Date;
  nightMode?: boolean;
  nightHex?: string;
  size?: number;
}

export const ClockAnalog: React.FC<ClockAnalogProps> = ({
  time,
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  const primaryColor = nightMode ? nightHex : '#ffffff';
  const accentColor = nightMode ? nightHex : '#ef4444'; // Red second hand by default like iconic Swiss railway clock

  const dateDay = time.getDate();
  const dayName = time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-4 select-none">
      <div
        className="relative w-[70vw] h-[70vw] max-w-[340px] max-h-[340px] sm:max-w-[380px] sm:max-h-[380px] md:max-w-[420px] md:max-h-[420px] rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          background: nightMode
            ? '#050505'
            : 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)',
          boxShadow: nightMode
            ? `0 0 50px ${nightHex}25, inset 0 0 30px rgba(0,0,0,0.9)`
            : '0 25px 50px -12px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15)',
          border: `1.5px solid ${nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        {/* Hour Numbers (12, 3, 6, 9) */}
        <span
          className="absolute top-5 text-2xl sm:text-3xl font-black font-mono tracking-tight"
          style={{ color: primaryColor }}
        >
          12
        </span>
        <span
          className="absolute right-6 text-2xl sm:text-3xl font-black font-mono tracking-tight"
          style={{ color: primaryColor }}
        >
          3
        </span>
        <span
          className="absolute bottom-5 text-2xl sm:text-3xl font-black font-mono tracking-tight"
          style={{ color: primaryColor }}
        >
          6
        </span>
        <span
          className="absolute left-6 text-2xl sm:text-3xl font-black font-mono tracking-tight"
          style={{ color: primaryColor }}
        >
          9
        </span>

        {/* 60 Minute / Second Tick Marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isHour = i % 5 === 0;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 pointer-events-none"
              style={{ transform: `rotate(${i * 6}deg)` }}
            >
              <div
                className="w-full rounded-full transition-colors"
                style={{
                  height: isHour ? '12px' : '5px',
                  width: isHour ? '2.5px' : '1px',
                  backgroundColor: isHour
                    ? primaryColor
                    : nightMode
                    ? `${nightHex}40`
                    : 'rgba(255,255,255,0.25)',
                }}
              />
            </div>
          );
        })}

        {/* Date Complication Window at 3 o'clock */}
        <div
          className="absolute right-14 sm:right-16 flex items-center gap-1 px-2 py-0.5 rounded border backdrop-blur-sm"
          style={{
            borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(0,0,0,0.6)',
          }}
        >
          <span
            className="text-[10px] font-bold tracking-wider"
            style={{ color: nightMode ? `${nightHex}90` : '#94a3b8' }}
          >
            {dayName}
          </span>
          <span
            className="text-xs font-black"
            style={{ color: primaryColor }}
          >
            {dateDay}
          </span>
        </div>

        {/* Hour Hand */}
        <div
          className="absolute w-2 rounded-full transition-transform"
          style={{
            height: '28%',
            top: '22%',
            left: 'calc(50% - 4px)',
            transformOrigin: '50% 100%',
            transform: `rotate(${hourDeg}deg)`,
            backgroundColor: primaryColor,
            boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-1.5 rounded-full transition-transform"
          style={{
            height: '38%',
            top: '12%',
            left: 'calc(50% - 3px)',
            transformOrigin: '50% 100%',
            transform: `rotate(${minuteDeg}deg)`,
            backgroundColor: primaryColor,
            boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
          }}
        />

        {/* Sweeping Second Hand with round counterweight */}
        <div
          className="absolute w-[2px] transition-transform"
          style={{
            height: '46%',
            top: '8%',
            left: 'calc(50% - 1px)',
            transformOrigin: '50% 91%',
            transform: `rotate(${secondDeg}deg)`,
            backgroundColor: accentColor,
            boxShadow: nightMode ? `0 0 10px ${nightHex}` : 'none',
          }}
        >
          {/* Lollipop circle near tip */}
          <div
            className="w-2.5 h-2.5 rounded-full -left-[4px] absolute top-6"
            style={{
              backgroundColor: accentColor,
              boxShadow: nightMode ? `0 0 12px ${nightHex}` : 'none',
            }}
          />
        </div>

        {/* Center Cap Nut */}
        <div
          className="absolute w-4 h-4 rounded-full z-30 shadow-md"
          style={{
            backgroundColor: accentColor,
            border: `2px solid ${nightMode ? '#000000' : '#18181b'}`,
          }}
        />
      </div>

      {/* Modern Digital readout below */}
      <div className="mt-5 text-center">
        <span
          className="text-sm font-mono tracking-widest uppercase font-semibold"
          style={{ color: nightMode ? nightHex : '#71717a' }}
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
