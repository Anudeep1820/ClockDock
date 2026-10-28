import React from 'react';
import { WidgetType } from '../types';
import {
  Clock,
  Music,
  Calendar,
  CloudSun,
  Headphones,
  Battery,
  X,
  Compass,
} from 'lucide-react';

interface WidgetPickerModalProps {
  isOpen: boolean;
  activeSlot: 'left' | 'right' | null;
  currentLeft: WidgetType;
  currentRight: WidgetType;
  onSelectWidget: (slot: 'left' | 'right', type: WidgetType) => void;
  onClose: () => void;
  nightMode?: boolean;
  nightHex?: string;
}

export const WidgetPickerModal: React.FC<WidgetPickerModalProps> = ({
  isOpen,
  activeSlot,
  currentLeft,
  currentRight,
  onSelectWidget,
  onClose,
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  if (!isOpen || !activeSlot) return null;

  const currentType = activeSlot === 'left' ? currentLeft : currentRight;

  const availableWidgets: {
    type: WidgetType;
    title: string;
    description: string;
    icon: React.ElementType;
    badge: string;
  }[] = [
    {
      type: 'clock-digital',
      title: 'Digital Clock',
      description: 'Clean big hours & minutes with date',
      icon: Clock,
      badge: 'Clock',
    },
    {
      type: 'clock-analog',
      title: 'Analog Swiss Dial',
      description: 'Sweeping chronometer with date complication',
      icon: Compass,
      badge: 'Clock',
    },
    {
      type: 'music',
      title: 'Music Player',
      description: 'Track artwork, controls & live visualizer',
      icon: Music,
      badge: 'Audio',
    },
    {
      type: 'calendar',
      title: 'Calendar & Agenda',
      description: 'Big day number, monthly grid & alarms',
      icon: Calendar,
      badge: 'Planner',
    },
    {
      type: 'weather',
      title: 'Bedside Weather',
      description: 'Temperature, 5-hour forecast & humidity',
      icon: CloudSun,
      badge: 'Weather',
    },
    {
      type: 'sleep-sounds',
      title: 'Sleep Sound Machine',
      description: 'Rain, ocean waves & campfire white noise',
      icon: Headphones,
      badge: 'Rest',
    },
    {
      type: 'battery',
      title: 'Charging & Power Dock',
      description: 'MagSafe charging indicator & battery level',
      icon: Battery,
      badge: 'System',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border p-6 shadow-2xl flex flex-col no-scrollbar"
        style={{
          backgroundColor: '#0f0f13',
          borderColor: nightMode ? `${nightHex}40` : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span
              className="text-[11px] font-bold uppercase tracking-wider text-rose-500"
              style={{ color: nightMode ? nightHex : '#f43f5e' }}
            >
              Customizing {activeSlot.toUpperCase()} Slot
            </span>
            <h2 className="text-xl font-black text-white">Pair Any Two Widgets</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {availableWidgets.map((item) => {
            const Icon = item.icon;
            const isSelected = item.type === currentType;
            return (
              <button
                key={item.type}
                onClick={() => {
                  onSelectWidget(activeSlot, item.type);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-white bg-white/10 shadow-lg scale-[1.01]'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700'
                }`}
                style={{
                  borderColor: isSelected && nightMode ? nightHex : undefined,
                  boxShadow: isSelected && nightMode ? `0 0 15px ${nightHex}30` : undefined,
                }}
              >
                <div
                  className="p-2.5 rounded-xl border shrink-0 mt-0.5"
                  style={{
                    backgroundColor: isSelected
                      ? nightMode
                        ? `${nightHex}25`
                        : 'rgba(255,255,255,0.15)'
                      : 'rgba(255,255,255,0.05)',
                    borderColor: isSelected
                      ? nightMode
                        ? nightHex
                        : 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isSelected && nightMode ? nightHex : '#ffffff' }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{item.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-500">
          Tip: You can pair a Clock on the left with Music, Weather or Sleep Sounds on the right.
        </p>
      </div>
    </div>
  );
};
