import React from 'react';

interface ClockRetroFlipProps {
  time: Date;
  nightMode?: boolean;
  nightHex?: string;
  is24Hour?: boolean;
}

const FlipTile: React.FC<{
  val: string;
  label: string;
  nightMode?: boolean;
  nightHex?: string;
}> = ({ val, label, nightMode, nightHex = '#ef4444' }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-24 sm:w-36 md:w-48 h-32 sm:h-48 md:h-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          boxShadow: nightMode
            ? `0 10px 30px -10px ${nightHex}40, inset 0 1px 0 rgba(255,255,255,0.05)`
            : '0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Horizontal center split hinge */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/80 z-20 shadow-sm" />
        <div className="absolute top-1/2 -left-2 w-4 h-3 rounded-full bg-zinc-800 border border-zinc-700 z-30 transform -translate-y-1/2" />
        <div className="absolute top-1/2 -right-2 w-4 h-3 rounded-full bg-zinc-800 border border-zinc-700 z-30 transform -translate-y-1/2" />

        {/* Top half subtle gradient highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Digit */}
        <span
          className="font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight"
          style={{
            color: nightMode ? nightHex : '#ffffff',
            textShadow: nightMode ? `0 0 25px ${nightHex}60` : '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {val}
        </span>
      </div>
      <span
        className="mt-3 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500"
        style={{ color: nightMode ? `${nightHex}90` : undefined }}
      >
        {label}
      </span>
    </div>
  );
};

export const ClockRetroFlip: React.FC<ClockRetroFlipProps> = ({
  time,
  nightMode = false,
  nightHex = '#ef4444',
  is24Hour = false,
}) => {
  let hoursNum = time.getHours();
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hours = hoursNum.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
      <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
        <FlipTile val={hours} label="Hours" nightMode={nightMode} nightHex={nightHex} />
        <span
          className="text-4xl sm:text-6xl font-bold text-zinc-700 pb-8"
          style={{ color: nightMode ? `${nightHex}60` : undefined }}
        >
          :
        </span>
        <FlipTile val={minutes} label="Minutes" nightMode={nightMode} nightHex={nightHex} />
        <span
          className="text-4xl sm:text-6xl font-bold text-zinc-700 pb-8"
          style={{ color: nightMode ? `${nightHex}60` : undefined }}
        >
          :
        </span>
        <FlipTile val={seconds} label="Seconds" nightMode={nightMode} nightHex={nightHex} />
      </div>

      <div className="mt-8 text-center">
        <p
          className="text-xs sm:text-sm font-medium tracking-widest uppercase text-zinc-500"
          style={{ color: nightMode ? `${nightHex}80` : undefined }}
        >
          {time.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};
