import React from 'react';
import { WeatherData, ClockColor } from '../types';
import { formatTemperature } from '../utils/weather';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  RefreshCw,
  WifiOff,
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  unit: 'celsius' | 'fahrenheit';
  clockColor: ClockColor;
  visible: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRotated?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  unit,
  clockColor,
  visible,
  onRefresh,
  isLoading = false,
  isRotated = false,
}) => {
  if (!weather) return null;

  const renderIcon = () => {
    const iconClass = 'w-4 h-4 shrink-0';
    switch (weather.conditionCode) {
      case 'clear':
        return <Sun className={`${iconClass} text-amber-400`} />;
      case 'partly-cloudy':
        return <CloudSun className={`${iconClass} text-sky-300`} />;
      case 'cloudy':
        return <Cloud className={`${iconClass} text-zinc-300`} />;
      case 'fog':
        return <CloudFog className={`${iconClass} text-zinc-400`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconClass} text-sky-400`} />;
      case 'rain':
      case 'heavy-rain':
        return <CloudRain className={`${iconClass} text-blue-400`} />;
      case 'snow':
        return <Snowflake className={`${iconClass} text-indigo-200`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconClass} text-amber-300`} />;
      default:
        return <Sun className={`${iconClass} text-amber-400`} />;
    }
  };

  const positionClass = isRotated ? 'safe-bottom safe-left' : 'safe-top safe-left';

  return (
    <div
      className={`fixed ${positionClass} z-40 transition-all duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl shadow-xl transition-all hover:bg-black/70 hover:border-white/20 select-none group"
        title={`Weather in ${weather.locationName} (${weather.condition}). Click to refresh.`}
        onClick={onRefresh}
      >
        {/* Weather Icon */}
        <div className="flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* Temperature & Condition */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-xs sm:text-sm font-bold font-mono tracking-tight"
            style={{ color: clockColor.primary }}
          >
            {formatTemperature(weather.temperatureCelsius, unit)}
          </span>

          <span className="text-[11px] font-medium text-zinc-300 hidden sm:inline">
            {weather.condition}
          </span>
        </div>

        {/* Daily High / Low if available */}
        {weather.tempHighCelsius !== undefined && weather.tempLowCelsius !== undefined && (
          <div className="hidden md:flex items-center gap-1 text-[10px] text-zinc-400 font-mono pl-1 border-l border-white/10">
            <span className="text-zinc-300">
              H:{formatTemperature(weather.tempHighCelsius, unit)}
            </span>
            <span className="text-zinc-500">
              L:{formatTemperature(weather.tempLowCelsius, unit)}
            </span>
          </div>
        )}

        {/* City Location */}
        <span className="text-[10px] text-zinc-400 hidden lg:inline max-w-[90px] truncate">
          • {weather.locationName}
        </span>

        {/* Stale / Offline Badge */}
        {weather.isStale && (
          <span
            className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
            title="Showing offline cached forecast"
          >
            <WifiOff className="w-2.5 h-2.5" />
            <span>Cached</span>
          </span>
        )}

        {/* Refresh spinner on hover / loading */}
        {onRefresh && (
          <button
            type="button"
            className={`p-1 rounded-full text-zinc-400 hover:text-white transition-all ${
              isLoading ? 'animate-spin text-white' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label="Refresh weather"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
