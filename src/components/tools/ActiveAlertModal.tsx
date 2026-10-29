import React, { useEffect } from 'react';
import { ActiveAlert, ClockColor } from '../../types';
import { Bell, Timer, Check, Volume2 } from 'lucide-react';

interface ActiveAlertModalProps {
  alert: ActiveAlert | null;
  onDismiss: () => void;
  onSnooze?: () => void;
  clockColor: ClockColor;
}

export const ActiveAlertModal: React.FC<ActiveAlertModalProps> = ({
  alert,
  onDismiss,
  onSnooze,
  clockColor,
}) => {
  useEffect(() => {
    if (!alert) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onDismiss();
      } else if ((e.key === 's' || e.key === 'S') && onSnooze) {
        e.preventDefault();
        onSnooze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alert, onDismiss, onSnooze]);

  if (!alert) return null;

  const isAlarm = alert.type === 'alarm';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fadeIn"
    >
      <div className="relative flex flex-col items-center max-w-sm w-full p-8 rounded-3xl border border-white/20 bg-zinc-950/95 shadow-[0_0_80px_rgba(0,0,0,0.9)] text-center overflow-hidden">
        {/* Pulsing ambient glow ring behind icon */}
        <div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"
          style={{ backgroundColor: clockColor.primary }}
        />

        {/* Pulsing alert icon */}
        <div
          className="relative p-5 rounded-3xl border border-white/15 bg-white/10 shadow-2xl mb-5 animate-bounce"
          style={{
            color: clockColor.primary,
            boxShadow: `0 0 40px ${clockColor.glow}`,
          }}
        >
          {isAlarm ? <Bell className="w-10 h-10" /> : <Timer className="w-10 h-10" />}
        </div>

        {/* Title & subtitle */}
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAlarm ? 'Alarm Ringing' : 'Timer Complete'}</span>
        </span>

        <h2
          id="alert-modal-title"
          className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight mb-2"
        >
          {alert.title}
        </h2>

        {alert.subtitle && (
          <p className="text-sm text-zinc-400 mb-8 max-w-xs">
            {alert.subtitle}
          </p>
        )}

        {/* Actions: Dismiss & Snooze */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {isAlarm && onSnooze && (
            <button
              onClick={onSnooze}
              className="w-full py-3.5 px-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all shadow-lg active:scale-95"
            >
              Snooze (+9 min)
            </button>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold text-sm shadow-2xl hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Dismiss</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 mt-4">
          Press Space or Enter to dismiss {isAlarm ? '• S to snooze' : ''}
        </p>
      </div>
    </div>
  );
};
