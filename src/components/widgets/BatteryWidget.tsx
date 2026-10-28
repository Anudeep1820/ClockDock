import React, { useState, useEffect } from 'react';
import { Zap, BatteryCharging } from 'lucide-react';

interface BatteryWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const [level, setLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(true);

  // Read native Battery API if available
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (type: string, listener: () => void) => void }> })
        .getBattery()
        .then((battery) => {
          setLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          battery.addEventListener('levelchange', () => {
            setLevel(Math.round(battery.level * 100));
          });
          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        })
        .catch(() => {
          // Fallback to 88% default
        });
    }
  }, []);

  const activeColor = nightMode ? nightHex : '#ffffff';
  const greenRing = nightMode ? nightHex : '#22c55e';

  return (
    <div
      className="relative flex flex-col justify-between w-full h-full p-4 sm:p-6 rounded-3xl backdrop-blur-xl border select-none transition-all duration-300"
      style={{
        backgroundColor: nightMode ? `${nightHex}10` : 'rgba(18, 18, 22, 0.75)',
        borderColor: nightMode ? `${nightHex}35` : 'rgba(255, 255, 255, 0.1)',
        boxShadow: nightMode
          ? `0 15px 35px ${nightHex}15`
          : '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest text-emerald-400"
            style={{ color: nightMode ? nightHex : '#22c55e' }}
          >
            Power & Dock Status
          </span>
          <h3
            className="text-lg font-bold tracking-tight mt-0.5"
            style={{ color: activeColor }}
          >
            {isCharging ? 'MagSafe Bedside Dock' : 'On Battery'}
          </h3>
        </div>
        <div
          className="p-2 rounded-xl border flex items-center justify-center"
          style={{
            borderColor: nightMode ? `${nightHex}40` : 'rgba(34, 197, 94, 0.3)',
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(34, 197, 94, 0.15)',
          }}
        >
          <BatteryCharging
            className="w-5 h-5"
            style={{ color: greenRing }}
          />
        </div>
      </div>

      {/* Center Charging Graphic */}
      <div className="flex items-center justify-center gap-6 my-2">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Circular progress */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-zinc-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - level / 100)}
              strokeLinecap="round"
              stroke={greenRing}
              fill="transparent"
              style={{
                filter: `drop-shadow(0 0 10px ${greenRing})`,
                transition: 'stroke-dashoffset 0.6s ease',
              }}
            />
          </svg>

          {/* Centered % */}
          <div className="absolute flex flex-col items-center">
            <span
              className="font-mono text-2xl sm:text-3xl font-black"
              style={{ color: activeColor }}
            >
              {level}%
            </span>
            {isCharging && (
              <Zap
                className="w-3.5 h-3.5 fill-current animate-bounce mt-0.5"
                style={{ color: greenRing }}
              />
            )}
          </div>
        </div>

        {/* Status specs */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-semibold">15W Fast Charge</span>
          </div>
          <span className="text-zinc-500 font-medium">StandBy Always-On: Active</span>
          <span className="text-zinc-500 font-medium">Full charge in ~22 mins</span>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 text-center border-t border-white/10 pt-2.5">
        Optimized Battery Charging for Bedside Sleep Dock
      </div>
    </div>
  );
};
