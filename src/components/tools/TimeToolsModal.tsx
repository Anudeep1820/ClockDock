import React, { useState, useEffect, useRef } from 'react';
import {
  AlarmItem,
  TimerState,
  StopwatchState,
  StopwatchLap,
  ClockColor,
} from '../../types';
import {
  DAY_NAMES,
  getNextAlarmOccurrence,
  formatNextOccurrence,
  getEarliestUpcomingAlarm,
} from '../../utils/alarms';
import { soundEngine } from '../../utils/audio';
import {
  getNotificationPermission,
  requestNotificationPermission,
  NotificationPermissionState,
} from '../../utils/notifications';
import {
  X,
  Bell,
  Clock,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  VolumeX,
  AlertCircle,
} from 'lucide-react';

interface TimeToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: AlarmItem[];
  onSaveAlarms: (alarms: AlarmItem[]) => void;
  timer: TimerState;
  onUpdateTimer: (partial: Partial<TimerState>) => void;
  stopwatch: StopwatchState;
  onUpdateStopwatch: (partial: Partial<StopwatchState>) => void;
  clockColor: ClockColor;
  is24Hour: boolean;
  onShowToast: (msg: string) => void;
}

type ToolTab = 'alarms' | 'timer' | 'stopwatch';

const QUICK_TIMER_PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '25m (Pomodoro)', seconds: 1500 },
  { label: '30m', seconds: 1800 },
  { label: '45m', seconds: 2700 },
  { label: '1h', seconds: 3600 },
];

export const TimeToolsModal: React.FC<TimeToolsModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onSaveAlarms,
  timer,
  onUpdateTimer,
  stopwatch,
  onUpdateStopwatch,
  clockColor,
  is24Hour,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('alarms');
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>(
    getNotificationPermission()
  );

  // --------------------------------------------------------------------------
  // Alarm Editing State
  // --------------------------------------------------------------------------
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);
  const [isCreatingAlarm, setIsCreatingAlarm] = useState(false);
  const [alarmFormTime, setAlarmFormTime] = useState('07:30');
  const [alarmFormLabel, setAlarmFormLabel] = useState('Morning StandBy');
  const [alarmFormDays, setAlarmFormDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // --------------------------------------------------------------------------
  // Stopwatch High-Resolution Display State
  // --------------------------------------------------------------------------
  const [stopwatchDisplayMs, setStopwatchDisplayMs] = useState(stopwatch.accumulatedMs);
  const stopwatchAnimFrame = useRef<number | null>(null);

  useEffect(() => {
    if (stopwatch.isRunning && stopwatch.startTime) {
      const update = () => {
        const now = Date.now();
        const currentElapsed = stopwatch.accumulatedMs + (now - (stopwatch.startTime || now));
        setStopwatchDisplayMs(currentElapsed);
        stopwatchAnimFrame.current = requestAnimationFrame(update);
      };
      stopwatchAnimFrame.current = requestAnimationFrame(update);
    } else {
      setStopwatchDisplayMs(stopwatch.accumulatedMs);
    }

    return () => {
      if (stopwatchAnimFrame.current) {
        cancelAnimationFrame(stopwatchAnimFrame.current);
      }
    };
  }, [stopwatch.isRunning, stopwatch.startTime, stopwatch.accumulatedMs]);

  // Request notification permission
  const handleRequestNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      onShowToast('Notifications enabled for alarms & timers');
    } else if (res === 'denied') {
      onShowToast('Notifications blocked in browser settings');
    }
  };

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // Alarms Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddAlarm = () => {
    setAlarmFormTime('07:30');
    setAlarmFormLabel('Morning StandBy');
    setAlarmFormDays([1, 2, 3, 4, 5]);
    setIsCreatingAlarm(true);
    setEditingAlarm(null);
  };

  const handleOpenEditAlarm = (item: AlarmItem) => {
    setAlarmFormTime(item.time);
    setAlarmFormLabel(item.label);
    setAlarmFormDays([...item.days]);
    setEditingAlarm(item);
    setIsCreatingAlarm(false);
  };

  const handleSaveAlarmForm = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanTime = alarmFormTime.trim();
    if (/^\d{1}:\d{2}$/.test(cleanTime)) {
      cleanTime = '0' + cleanTime;
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(cleanTime)) {
      cleanTime = cleanTime.slice(0, 5);
    }

    if (!/^\d{2}:\d{2}$/.test(cleanTime)) {
      onShowToast('Please enter a valid time (HH:MM)');
      return;
    }

    const cleanLabel = alarmFormLabel.trim() || 'Alarm';

    if (editingAlarm) {
      // Update existing alarm
      const updated = alarms.map((a) =>
        a.id === editingAlarm.id
          ? {
              ...a,
              time: cleanTime,
              label: cleanLabel,
              days: alarmFormDays,
              enabled: true,
              snoozedUntil: null,
            }
          : a
      );
      onSaveAlarms(updated);
      onShowToast(`Updated alarm for ${formatTimeDisplay(cleanTime, is24Hour)}`);
    } else {
      // Create new alarm
      const newAlarm: AlarmItem = {
        id: `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: cleanTime,
        label: cleanLabel,
        days: alarmFormDays,
        enabled: true,
      };
      onSaveAlarms([...alarms, newAlarm]);
      onShowToast(`Alarm set for ${formatTimeDisplay(cleanTime, is24Hour)}`);
    }

    setEditingAlarm(null);
    setIsCreatingAlarm(false);
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => {
      if (a.id === id) {
        const nextEnabled = !a.enabled;
        return {
          ...a,
          enabled: nextEnabled,
          snoozedUntil: null,
        };
      }
      return a;
    });
    onSaveAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    onSaveAlarms(updated);
    onShowToast('Alarm deleted');
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (alarmFormDays.includes(dayIndex)) {
      setAlarmFormDays(alarmFormDays.filter((d) => d !== dayIndex));
    } else {
      setAlarmFormDays([...alarmFormDays, dayIndex].sort());
    }
  };

  // --------------------------------------------------------------------------
  // Timer Handlers
  // --------------------------------------------------------------------------
  const handleStartTimer = () => {
    soundEngine.unlockAudio();
    const remaining = timer.remainingSeconds > 0 ? timer.remainingSeconds : timer.durationSeconds;
    const endTime = Date.now() + remaining * 1000;
    onUpdateTimer({
      remainingSeconds: remaining,
      endTime,
      isRunning: true,
      isCompleted: false,
    });
    onShowToast('Timer started');
  };

  const handlePauseTimer = () => {
    if (!timer.isRunning || !timer.endTime) return;
    const now = Date.now();
    const left = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
    onUpdateTimer({
      remainingSeconds: left,
      endTime: null,
      isRunning: false,
    });
    onShowToast('Timer paused');
  };

  const handleResumeTimer = () => {
    soundEngine.unlockAudio();
    const endTime = Date.now() + timer.remainingSeconds * 1000;
    onUpdateTimer({
      endTime,
      isRunning: true,
      isCompleted: false,
    });
  };

  const handleResetTimer = () => {
    onUpdateTimer({
      remainingSeconds: timer.durationSeconds,
      endTime: null,
      isRunning: false,
      isCompleted: false,
    });
    onShowToast('Timer reset');
  };

  const handleSelectTimerPreset = (presetSec: number, label: string) => {
    onUpdateTimer({
      durationSeconds: presetSec,
      remainingSeconds: presetSec,
      endTime: null,
      isRunning: false,
      isCompleted: false,
      label,
    });
  };

  const handleAddTimerMinute = () => {
    const nextRemaining = timer.remainingSeconds + 60;
    const nextDuration = timer.durationSeconds + 60;
    const nextEndTime = timer.endTime ? timer.endTime + 60000 : null;
    onUpdateTimer({
      durationSeconds: nextDuration,
      remainingSeconds: nextRemaining,
      endTime: nextEndTime,
    });
    onShowToast('+1 minute added');
  };

  // --------------------------------------------------------------------------
  // Stopwatch Handlers
  // --------------------------------------------------------------------------
  const handleStartStopwatch = () => {
    soundEngine.unlockAudio();
    soundEngine.playSubtleClick();
    onUpdateStopwatch({
      startTime: Date.now(),
      isRunning: true,
    });
  };

  const handlePauseStopwatch = () => {
    soundEngine.playSubtleClick();
    if (!stopwatch.isRunning || !stopwatch.startTime) return;
    const elapsedNow = stopwatch.accumulatedMs + (Date.now() - stopwatch.startTime);
    onUpdateStopwatch({
      accumulatedMs: elapsedNow,
      startTime: null,
      isRunning: false,
    });
  };

  const handleResetStopwatch = () => {
    soundEngine.playSubtleClick();
    onUpdateStopwatch({
      accumulatedMs: 0,
      startTime: null,
      isRunning: false,
      laps: [],
    });
    setStopwatchDisplayMs(0);
    onShowToast('Stopwatch reset');
  };

  const handleRecordLap = () => {
    soundEngine.playSubtleClick();
    const currentTotal = stopwatch.startTime
      ? stopwatch.accumulatedMs + (Date.now() - stopwatch.startTime)
      : stopwatch.accumulatedMs;

    const previousTotal = stopwatch.laps.length > 0 ? stopwatch.laps[0].overallTimeMs : 0;
    const lapDelta = Math.max(0, currentTotal - previousTotal);

    const newLap: StopwatchLap = {
      lapNumber: stopwatch.laps.length + 1,
      overallTimeMs: currentTotal,
      lapTimeMs: lapDelta,
    };

    onUpdateStopwatch({
      laps: [newLap, ...stopwatch.laps],
    });
  };

  const earliestAlarm = getEarliestUpcomingAlarm(alarms);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ClockDock Time Tools"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border border-white/10 bg-white/5"
              style={{ color: clockColor.primary }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Time Tools
              </h2>
              <p className="text-xs text-zinc-400">
                Alarms, countdown timer & lap stopwatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Permission Pill */}
            {notifPermission !== 'unsupported' && (
              <button
                onClick={handleRequestNotifications}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  notifPermission === 'granted'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : notifPermission === 'denied'
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                }`}
                title={
                  notifPermission === 'granted'
                    ? 'Desktop / mobile notifications enabled'
                    : notifPermission === 'denied'
                    ? 'Notifications denied in browser'
                    : 'Click to enable local notifications'
                }
              >
                {notifPermission === 'granted' ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {notifPermission === 'granted'
                    ? 'Alerts Active'
                    : notifPermission === 'denied'
                    ? 'Alerts Muted'
                    : 'Enable Alerts'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close Time Tools"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION PILLS */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-black/40 border-b border-white/5">
          <button
            onClick={() => {
              setActiveTab('alarms');
              setIsCreatingAlarm(false);
              setEditingAlarm(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'alarms'
                ? 'bg-white/15 text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alarms</span>
            {alarms.some((a) => a.enabled) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'timer'
                ? 'bg-white/15 text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Timer</span>
            {timer.isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'stopwatch'
                ? 'bg-white/15 text-white shadow-md border border-white/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Stopwatch</span>
            {stopwatch.isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ================================================================ */}
          {/* TAB 1: ALARMS                                                    */}
          {/* ================================================================ */}
          {activeTab === 'alarms' && (
            <div className="space-y-5">
              {/* Earliest Alarm Summary Card */}
              {earliestAlarm ? (
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl border border-white/10 bg-black/40"
                      style={{ color: clockColor.primary }}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                        Next Alarm
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {formatTimeDisplay(earliestAlarm.alarm.time, is24Hour)} •{' '}
                        {earliestAlarm.alarm.label}
                      </span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatNextOccurrence(earliestAlarm.nextTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                  <p className="text-xs text-zinc-500">
                    No active alarms. Tap Add Alarm below to schedule one.
                  </p>
                </div>
              )}

              {/* Add / Edit Alarm Inline Form */}
              {(isCreatingAlarm || editingAlarm) ? (
                <form
                  onSubmit={handleSaveAlarmForm}
                  className="p-5 rounded-2xl border border-white/15 bg-zinc-900/90 shadow-2xl space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white">
                      {editingAlarm ? 'Edit Alarm' : 'Set New Alarm'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingAlarm(false);
                        setEditingAlarm(null);
                      }}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                      Alarm Time
                    </label>
                    <input
                      type="time"
                      value={alarmFormTime}
                      onChange={(e) => setAlarmFormTime(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white text-2xl font-mono font-bold focus:outline-none focus:border-white/30 text-center"
                    />
                  </div>

                  {/* Label Input */}
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                      Label
                    </label>
                    <input
                      type="text"
                      maxLength={40}
                      value={alarmFormLabel}
                      onChange={(e) => setAlarmFormLabel(e.target.value)}
                      placeholder="e.g. Morning Wakeup"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white text-sm focus:outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Days Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-zinc-400">
                        Repeat Schedule
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAlarmFormDays([1, 2, 3, 4, 5])}
                          className="text-[11px] text-zinc-400 hover:text-white underline"
                        >
                          Weekdays
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlarmFormDays([0, 6])}
                          className="text-[11px] text-zinc-400 hover:text-white underline"
                        >
                          Weekends
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlarmFormDays([])}
                          className="text-[11px] text-zinc-400 hover:text-white underline"
                        >
                          One-time
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {DAY_NAMES.map((name, idx) => {
                        const isSelected = alarmFormDays.includes(idx);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleDaySelection(idx)}
                            className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-white text-black shadow-md'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      {alarmFormDays.length === 0
                        ? 'One-time alarm: triggers once and automatically disables.'
                        : alarmFormDays.length === 7
                        ? 'Every day'
                        : `Repeats: ${alarmFormDays.map((d) => DAY_NAMES[d]).join(', ')}`}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingAlarm(false);
                        setEditingAlarm(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-white hover:bg-zinc-200 transition-all shadow-lg"
                    >
                      Save Alarm
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={handleOpenAddAlarm}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Alarm</span>
                </button>
              )}

              {/* Alarms List */}
              <div className="space-y-2.5">
                {alarms.map((item) => {
                  const nextOccurrence = getNextAlarmOccurrence(item);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.enabled
                          ? 'border-white/15 bg-white/[0.05]'
                          : 'border-white/5 bg-black/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                              {formatTimeDisplay(item.time, is24Hour)}
                            </span>
                            {item.snoozedUntil && item.snoozedUntil > Date.now() && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Snoozed
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-zinc-300 block mt-0.5">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-zinc-500 block mt-1">
                            {item.days.length === 0
                              ? 'One-time'
                              : item.days.length === 7
                              ? 'Every day'
                              : item.days.map((d) => DAY_NAMES[d]).join(', ')}{' '}
                            • {formatNextOccurrence(nextOccurrence)}
                          </span>
                        </div>

                        {/* Controls: Edit, Delete, Toggle */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditAlarm(item)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Edit Alarm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteAlarm(item.id)}
                            className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Delete Alarm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Toggle switch */}
                          <button
                            onClick={() => handleToggleAlarm(item.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              item.enabled ? 'bg-white' : 'bg-white/20'
                            }`}
                            aria-label={`Toggle alarm for ${item.time}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                                item.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browser limitations note */}
              <div className="p-3.5 rounded-2xl border border-white/5 bg-black/30 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Browser alarms ring reliably while ClockDock is open or running in an active bedside display. If the device sleeps or suspends the browser, overdue alarms within 15 minutes trigger upon wake-up. Keep Screen Always-On active for dependable overnight ringing.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: COUNTDOWN TIMER                                           */}
          {/* ================================================================ */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              {/* Primary Countdown Display */}
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] text-center">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  {timer.label || 'Countdown Timer'}
                </span>

                <div
                  className="text-5xl sm:text-7xl font-mono font-bold tracking-tight text-white mb-4"
                  style={{
                    color: timer.isCompleted
                      ? '#f43f5e'
                      : timer.isRunning
                      ? clockColor.primary
                      : '#ffffff',
                    textShadow: timer.isRunning
                      ? `0 0 25px ${clockColor.glow}`
                      : 'none',
                  }}
                >
                  {formatSecondsToHms(timer.remainingSeconds)}
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${
                        timer.durationSeconds > 0
                          ? Math.min(
                              100,
                              (timer.remainingSeconds / timer.durationSeconds) * 100
                            )
                          : 0
                      }%`,
                      backgroundColor: timer.isCompleted
                        ? '#f43f5e'
                        : clockColor.primary,
                    }}
                  />
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-3">
                  {!timer.isRunning ? (
                    <button
                      onClick={
                        timer.remainingSeconds < timer.durationSeconds && timer.remainingSeconds > 0
                          ? handleResumeTimer
                          : handleStartTimer
                      }
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{timer.remainingSeconds < timer.durationSeconds ? 'Resume' : 'Start'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseTimer}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 text-black font-bold text-sm shadow-xl hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={handleResetTimer}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleAddTimerMinute}
                    className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
                  >
                    +1 Min
                  </button>
                </div>
              </div>

              {/* Custom Duration Picker (Hours, Minutes, Seconds) */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Custom Duration
                </label>
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex-1 flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={Math.floor(timer.durationSeconds / 3600)}
                      disabled={timer.isRunning}
                      onChange={(e) => {
                        const h = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
                        const m = Math.floor((timer.durationSeconds % 3600) / 60);
                        const s = timer.durationSeconds % 60;
                        const total = Math.max(1, h * 3600 + m * 60 + s);
                        handleSelectTimerPreset(total, `${h > 0 ? h + 'h ' : ''}${m}m`);
                      }}
                      className="w-full text-center py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-white/30 disabled:opacity-40"
                    />
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold mt-1">Hours</span>
                  </div>

                  <span className="text-zinc-600 font-bold text-lg -mt-3">:</span>

                  <div className="flex-1 flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={Math.floor((timer.durationSeconds % 3600) / 60)}
                      disabled={timer.isRunning}
                      onChange={(e) => {
                        const h = Math.floor(timer.durationSeconds / 3600);
                        const m = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                        const s = timer.durationSeconds % 60;
                        const total = Math.max(1, h * 3600 + m * 60 + s);
                        handleSelectTimerPreset(total, `${h > 0 ? h + 'h ' : ''}${m}m`);
                      }}
                      className="w-full text-center py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-white/30 disabled:opacity-40"
                    />
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold mt-1">Minutes</span>
                  </div>

                  <span className="text-zinc-600 font-bold text-lg -mt-3">:</span>

                  <div className="flex-1 flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={timer.durationSeconds % 60}
                      disabled={timer.isRunning}
                      onChange={(e) => {
                        const h = Math.floor(timer.durationSeconds / 3600);
                        const m = Math.floor((timer.durationSeconds % 3600) / 60);
                        const s = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
                        const total = Math.max(1, h * 3600 + m * 60 + s);
                        handleSelectTimerPreset(total, `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
                      }}
                      className="w-full text-center py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-white/30 disabled:opacity-40"
                    />
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold mt-1">Seconds</span>
                  </div>
                </div>
              </div>

              {/* Quick Presets Grid */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
                  Quick Presets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {QUICK_TIMER_PRESETS.map((p) => {
                    const isSelected =
                      timer.durationSeconds === p.seconds && !timer.isRunning;
                    return (
                      <button
                        key={p.label}
                        onClick={() => handleSelectTimerPreset(p.seconds, p.label)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'border-white bg-white text-black shadow-md'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: STOPWATCH & LAP TRACKING                                  */}
          {/* ================================================================ */}
          {activeTab === 'stopwatch' && (
            <div className="space-y-6">
              {/* Primary Stopwatch Display */}
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.03] text-center">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Elapsed Time
                </span>

                <div
                  className="text-5xl sm:text-7xl font-mono font-bold tracking-tight text-white mb-6"
                  style={{
                    color: stopwatch.isRunning ? clockColor.primary : '#ffffff',
                    textShadow: stopwatch.isRunning
                      ? `0 0 25px ${clockColor.glow}`
                      : 'none',
                  }}
                >
                  {formatStopwatchDisplay(stopwatchDisplayMs)}
                </div>

                {/* Primary Stopwatch Actions */}
                <div className="flex items-center gap-3">
                  {!stopwatch.isRunning ? (
                    <button
                      onClick={handleStartStopwatch}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{stopwatch.accumulatedMs > 0 ? 'Resume' : 'Start'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseStopwatch}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 text-black font-bold text-sm shadow-xl hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  {stopwatch.isRunning && (
                    <button
                      onClick={handleRecordLap}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/20 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Lap</span>
                    </button>
                  )}

                  {!stopwatch.isRunning && stopwatch.accumulatedMs > 0 && (
                    <button
                      onClick={handleResetStopwatch}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Laps List */}
              {stopwatch.laps.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Recorded Laps ({stopwatch.laps.length})
                    </span>
                    <button
                      onClick={() => onUpdateStopwatch({ laps: [] })}
                      className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      Clear Laps
                    </button>
                  </div>

                  {(() => {
                    // Identify fastest & slowest lap for visual highlight
                    let minTime = Infinity;
                    let maxTime = -Infinity;
                    if (stopwatch.laps.length >= 2) {
                      for (const l of stopwatch.laps) {
                        if (l.lapTimeMs < minTime) minTime = l.lapTimeMs;
                        if (l.lapTimeMs > maxTime) maxTime = l.lapTimeMs;
                      }
                    }

                    return (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {stopwatch.laps.map((lap) => {
                          const isFastest =
                            stopwatch.laps.length >= 2 && lap.lapTimeMs === minTime;
                          const isSlowest =
                            stopwatch.laps.length >= 2 && lap.lapTimeMs === maxTime;

                          return (
                            <div
                              key={lap.lapNumber}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono ${
                                isFastest
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                  : isSlowest
                                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                  : 'border-white/5 bg-white/[0.02] text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 font-semibold w-12">
                                  Lap {lap.lapNumber}
                                </span>
                                {isFastest && (
                                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Fastest
                                  </span>
                                )}
                                {isSlowest && (
                                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    Slowest
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold">
                                  +{formatStopwatchDisplay(lap.lapTimeMs)}
                                </span>
                                <span className="text-zinc-500 text-xs w-20 text-right">
                                  {formatStopwatchDisplay(lap.overallTimeMs)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper: Format seconds into HH:MM:SS or MM:SS
function formatSecondsToHms(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Helper: Format stopwatch ms into MM:SS.cs (centiseconds) or HH:MM:SS.cs
function formatStopwatchDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const csStr = centiseconds.toString().padStart(2, '0');
  const sStr = seconds.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');

  if (hours > 0) {
    const hStr = hours.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}.${csStr}`;
  }
  return `${mStr}:${sStr}.${csStr}`;
}

// Helper: Format "HH:MM" for 12h or 24h display
function formatTimeDisplay(timeStr: string, is24Hour: boolean): string {
  if (is24Hour) return timeStr;

  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}
