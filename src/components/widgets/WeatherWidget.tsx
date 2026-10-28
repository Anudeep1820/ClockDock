import React from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const activeColor = nightMode ? nightHex : '#ffffff';

  const hourly = [
    { time: 'Now', temp: '68°', icon: CloudRain },
    { time: '9 PM', temp: '66°', icon: Cloud },
    { time: '11 PM', temp: '63°', icon: Cloud },
    { time: '1 AM', temp: '60°', icon: Cloud },
    { time: '3 AM', temp: '59°', icon: Cloud },
  ];

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
      {/* Top: Location & Current Temp */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest text-sky-400"
            style={{ color: nightMode ? nightHex : '#38bdf8' }}
          >
            San Francisco • Bedside
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className="font-display-digits text-4xl sm:text-5xl font-black"
              style={{ color: activeColor }}
            >
              68°
            </span>
            <span className="text-sm font-semibold text-zinc-400">Light Showers</span>
          </div>
        </div>

        {/* Big Weather Icon */}
        <div
          className="p-3 rounded-2xl border"
          style={{
            borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.1)',
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(56, 189, 248, 0.1)',
          }}
        >
          <CloudRain
            className="w-8 h-8"
            style={{ color: nightMode ? nightHex : '#38bdf8' }}
          />
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="my-2 grid grid-cols-5 gap-2 text-center">
        {hourly.map((h, i) => {
          const IconComponent = h.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center py-2 px-1 rounded-xl border"
              style={{
                borderColor: nightMode ? `${nightHex}25` : 'rgba(255,255,255,0.06)',
                backgroundColor: nightMode ? `${nightHex}10` : 'rgba(255,255,255,0.03)',
              }}
            >
              <span className="text-[10px] font-semibold text-zinc-400">{h.time}</span>
              <IconComponent
                className="w-4 h-4 my-1.5"
                style={{ color: nightMode ? nightHex : '#94a3b8' }}
              />
              <span
                className="text-xs font-bold font-mono"
                style={{ color: activeColor }}
              >
                {h.temp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats bar: Humidity & Wind */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/10 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>Humidity 78%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-emerald-400" />
          <span>Wind 7 mph NW</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Sunrise 6:42 AM</span>
        </div>
      </div>
    </div>
  );
};
