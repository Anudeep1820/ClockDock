import React from 'react';

interface CalendarWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const today = new Date();
  const dayName = today.toLocaleDateString(undefined, { weekday: 'short' });
  const monthName = today.toLocaleDateString(undefined, { month: 'short' });
  const dayNumber = today.getDate();

  // Mini calendar grid
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const activeColor = nightMode ? nightHex : '#ffffff';

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
      {/* Top Header: Big Date Callout */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest text-rose-500"
            style={{ color: nightMode ? nightHex : '#f43f5e' }}
          >
            {dayName} • {monthName}
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: activeColor }}
          >
            {dayNumber}
          </h2>
        </div>

        {/* Small live badge */}
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
          style={{
            borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
            color: activeColor,
            backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255,255,255,0.05)',
          }}
        >
          {today.getFullYear()}
        </div>
      </div>

      {/* Mini Days Grid */}
      <div className="my-2">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: Math.min(daysInMonth, 28) }).map((_, i) => {
            const day = i + 1;
            const isToday = day === dayNumber;
            return (
              <span
                key={day}
                className={`py-1 rounded-full flex items-center justify-center font-mono text-[11px] ${
                  isToday
                    ? 'font-black text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: isToday
                    ? nightMode
                      ? nightHex
                      : '#ffffff'
                    : 'transparent',
                  color: isToday
                    ? '#000000'
                    : undefined,
                  boxShadow: isToday && nightMode ? `0 0 10px ${nightHex}` : undefined,
                }}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Agenda preview item */}
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs"
        style={{
          borderColor: nightMode ? `${nightHex}30` : 'rgba(255,255,255,0.08)',
          backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255,255,255,0.04)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: nightMode ? nightHex : '#38bdf8' }}
        />
        <div className="truncate">
          <p className="font-semibold text-zinc-200 truncate">Morning Wakeup & Routine</p>
          <p className="text-[10px] text-zinc-400">7:30 AM • Bedside Alarm</p>
        </div>
      </div>
    </div>
  );
};
