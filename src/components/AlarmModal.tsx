import React, { useState } from 'react';
import { Bell, Plus, Trash2, X, Volume2 } from 'lucide-react';
import { AlarmItem } from '../types';
import { soundEngine } from '../utils/audio';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: AlarmItem[];
  onToggleAlarm: (id: string) => void;
  onAddAlarm: (alarm: AlarmItem) => void;
  onDeleteAlarm: (id: string) => void;
  nightMode?: boolean;
  nightHex?: string;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onToggleAlarm,
  onAddAlarm,
  onDeleteAlarm,
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const [newTime, setNewTime] = useState('07:30');
  const [newLabel, setNewLabel] = useState('Morning Wakeup');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    onAddAlarm({
      id: Date.now().toString(),
      time: newTime,
      label: newLabel || 'Alarm',
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });
    setNewLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-md rounded-3xl border p-6 shadow-2xl flex flex-col"
        style={{
          backgroundColor: '#0f0f13',
          borderColor: nightMode ? `${nightHex}40` : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border"
              style={{
                borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.15)',
                backgroundColor: nightMode ? `${nightHex}15` : 'rgba(255,255,255,0.05)',
              }}
            >
              <Bell className="w-5 h-5" style={{ color: nightMode ? nightHex : '#f43f5e' }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Bedside Alarms</h2>
              <p className="text-xs text-zinc-400">Gentle chimes to start your day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Alarms */}
        <div className="my-4 flex flex-col gap-2.5 max-h-56 overflow-y-auto no-scrollbar">
          {alarms.length === 0 ? (
            <p className="text-center text-xs text-zinc-500 py-6">No alarms set yet</p>
          ) : (
            alarms.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border bg-zinc-900/60 border-zinc-800/80"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-white">{a.time}</span>
                  <p className="text-xs text-zinc-400">{a.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => soundEngine.playAlarmChime()}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Preview Chime"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleAlarm(a.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      a.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        a.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => onDeleteAlarm(a.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Alarm Form */}
        <form onSubmit={handleCreate} className="pt-3 border-t border-zinc-800 flex flex-col gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Set New Alarm</span>
          <div className="flex gap-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-base font-bold text-white focus:outline-none focus:border-white w-32"
            />
            <input
              type="text"
              placeholder="Label (e.g. Wake Up)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-white hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Alarm
          </button>
        </form>
      </div>
    </div>
  );
};
