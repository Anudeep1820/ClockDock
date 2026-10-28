import React from 'react';
import { WidgetType, ColorPalette } from '../types';
import { MusicWidget } from './widgets/MusicWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { SleepSoundsWidget } from './widgets/SleepSoundsWidget';
import { BatteryWidget } from './widgets/BatteryWidget';
import { ClockAnalog } from './ClockAnalog';
import { ArrowLeftRight, Settings2 } from 'lucide-react';

interface DualWidgetStandbyProps {
  time: Date;
  palette: ColorPalette;
  leftWidget: WidgetType;
  rightWidget: WidgetType;
  nightMode?: boolean;
  nightHex?: string;
  is24Hour?: boolean;
  bassPulse?: number;
  onAudioBeat?: (bass: number) => void;
  onOpenWidgetPicker: (slot: 'left' | 'right') => void;
  onSwapWidgets: () => void;
}

export const DualWidgetStandby: React.FC<DualWidgetStandbyProps> = ({
  time,
  palette,
  leftWidget,
  rightWidget,
  nightMode = false,
  nightHex = '#ef4444',
  is24Hour = false,
  bassPulse = 0,
  onAudioBeat,
  onOpenWidgetPicker,
  onSwapWidgets,
}) => {
  const renderWidget = (type: WidgetType, slot: 'left' | 'right') => {
    switch (type) {
      case 'clock-digital': {
        let hoursNum = time.getHours();
        if (!is24Hour) {
          hoursNum = hoursNum % 12 || 12;
        }
        const hours = hoursNum.toString();
        const minutes = time.getMinutes().toString().padStart(2, '0');
        const dayStr = time.toLocaleDateString(undefined, { weekday: 'long' });
        const dateStr = time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        return (
          <div
            onClick={() => onOpenWidgetPicker(slot)}
            className="group relative flex flex-col justify-between w-full h-full p-4 sm:p-6 rounded-3xl backdrop-blur-xl border select-none cursor-pointer transition-all duration-300 hover:border-white/30"
            style={{
              backgroundColor: nightMode ? `${nightHex}10` : 'rgba(18, 18, 22, 0.75)',
              borderColor: nightMode ? `${nightHex}35` : 'rgba(255, 255, 255, 0.1)',
              boxShadow: nightMode
                ? `0 15px 35px ${nightHex}15`
                : '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md"
                style={{
                  borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
                  color: nightMode ? nightHex : '#ffffff',
                }}
              >
                {dayStr} • {dateStr}
              </span>
              <Settings2 className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div
              className="flex items-center justify-center my-auto transition-transform duration-75"
              style={{ transform: `scale(${1.0 + (bassPulse || 0) * 0.05})` }}
            >
              <span
                className="font-display-digits text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight"
                style={{
                  color: nightMode ? nightHex : palette.hours,
                  textShadow: nightMode ? `0 0 30px ${nightHex}50` : undefined,
                }}
              >
                {hours}
              </span>
              <span
                className="text-5xl sm:text-6xl font-black mx-1 animate-pulse"
                style={{ color: nightMode ? nightHex : palette.accent }}
              >
                :
              </span>
              <span
                className="font-display-digits text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight"
                style={{
                  color: nightMode ? nightHex : palette.minutes,
                  textShadow: nightMode ? `0 0 30px ${nightHex}50` : undefined,
                }}
              >
                {minutes}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Tap to change widget</span>
              <span className="font-mono">{time.getSeconds().toString().padStart(2, '0')}s</span>
            </div>
          </div>
        );
      }
      case 'clock-analog':
        return (
          <div
            onClick={() => onOpenWidgetPicker(slot)}
            className="group relative flex items-center justify-center w-full h-full p-2 rounded-3xl backdrop-blur-xl border select-none cursor-pointer transition-all hover:border-white/30"
            style={{
              backgroundColor: nightMode ? `${nightHex}10` : 'rgba(18, 18, 22, 0.75)',
              borderColor: nightMode ? `${nightHex}35` : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <ClockAnalog time={time} nightMode={nightMode} nightHex={nightHex} />
          </div>
        );
      case 'music':
        return (
          <MusicWidget
            nightMode={nightMode}
            nightHex={nightHex}
            onAudioBeat={onAudioBeat}
          />
        );
      case 'calendar':
        return <CalendarWidget nightMode={nightMode} nightHex={nightHex} />;
      case 'weather':
        return <WeatherWidget nightMode={nightMode} nightHex={nightHex} />;
      case 'sleep-sounds':
        return <SleepSoundsWidget nightMode={nightMode} nightHex={nightHex} />;
      case 'battery':
        return <BatteryWidget nightMode={nightMode} nightHex={nightHex} />;
      default:
        return (
          <MusicWidget
            nightMode={nightMode}
            nightHex={nightHex}
            onAudioBeat={onAudioBeat}
          />
        );
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 w-full h-full max-w-6xl mx-auto p-4 sm:p-8">
      {/* Left Slot */}
      <div className="w-full md:w-1/2 h-[42vh] md:h-[62vh] min-h-[260px] flex">
        {renderWidget(leftWidget, 'left')}
      </div>

      {/* Middle Swap Button */}
      <button
        onClick={onSwapWidgets}
        className="p-2 sm:p-2.5 rounded-full bg-zinc-900 border border-zinc-700/80 shadow-lg text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all z-20 shrink-0"
        title="Swap Left and Right Widgets"
      >
        <ArrowLeftRight className="w-4 h-4" />
      </button>

      {/* Right Slot */}
      <div className="w-full md:w-1/2 h-[42vh] md:h-[62vh] min-h-[260px] flex">
        {renderWidget(rightWidget, 'right')}
      </div>
    </div>
  );
};
