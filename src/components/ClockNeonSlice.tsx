import React from 'react';

interface ClockNeonSliceProps {
  time: Date;
  nightMode?: boolean;
  nightHex?: string;
  is24Hour?: boolean;
}

export const ClockNeonSlice: React.FC<ClockNeonSliceProps> = ({
  time,
  nightMode = false,
  nightHex = '#ec4899',
  is24Hour = true,
}) => {
  let hoursNum = time.getHours();
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hours = hoursNum.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const neonPink = nightMode ? nightHex : '#ec4899';
  const neonCyan = nightMode ? nightHex : '#06b6d4';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Background angled diagonal banner */}
      <div
        className="absolute inset-0 -skew-y-6 transform scale-110 opacity-30 pointer-events-none transition-colors duration-700"
        style={{
          background: `linear-gradient(135deg, ${neonPink}40 0%, transparent 50%, ${neonCyan}30 100%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Massive Angled Typography */}
        <div className="flex items-center -skew-x-6 tracking-tighter">
          <div
            className="px-6 sm:px-10 py-3 sm:py-6 rounded-3xl backdrop-blur-xl border flex items-center justify-center"
            style={{
              backgroundColor: nightMode ? `${nightHex}15` : 'rgba(236, 72, 153, 0.15)',
              borderColor: nightMode ? `${nightHex}40` : 'rgba(236, 72, 153, 0.4)',
              boxShadow: `0 0 40px ${nightMode ? `${nightHex}30` : 'rgba(236, 72, 153, 0.25)'}`,
            }}
          >
            <span
              className="font-cyber font-black text-7xl sm:text-9xl md:text-[11rem] leading-none"
              style={{
                color: neonPink,
                textShadow: `0 0 30px ${neonPink}`,
              }}
            >
              {hours}
            </span>
          </div>

          {/* Angled separator dot */}
          <div className="mx-3 sm:mx-6 flex flex-col gap-4">
            <span
              className="w-4 h-4 rounded-sm rotate-45 animate-ping"
              style={{ backgroundColor: neonCyan, boxShadow: `0 0 20px ${neonCyan}` }}
            />
          </div>

          <div
            className="px-6 sm:px-10 py-3 sm:py-6 rounded-3xl backdrop-blur-xl border flex items-center justify-center"
            style={{
              backgroundColor: nightMode ? `${nightHex}15` : 'rgba(6, 182, 212, 0.15)',
              borderColor: nightMode ? `${nightHex}40` : 'rgba(6, 182, 212, 0.4)',
              boxShadow: `0 0 40px ${nightMode ? `${nightHex}30` : 'rgba(6, 182, 212, 0.25)'}`,
            }}
          >
            <span
              className="font-cyber font-black text-7xl sm:text-9xl md:text-[11rem] leading-none"
              style={{
                color: neonCyan,
                textShadow: `0 0 30px ${neonCyan}`,
              }}
            >
              {minutes}
            </span>
          </div>
        </div>

        {/* Seconds & Date Pill */}
        <div className="mt-8 flex items-center gap-4">
          <div
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase border backdrop-blur-md"
            style={{
              borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
              color: nightMode ? nightHex : '#ffffff',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            SEC : {seconds}
          </div>
          <div
            className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider border backdrop-blur-md text-zinc-300"
            style={{
              borderColor: nightMode ? `${nightHex}30` : 'rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};
