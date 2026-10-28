import React from 'react';
import { NIGHT_TINTS } from '../utils/themes';
import { NightTint } from '../types';
import { Moon, SunMedium } from 'lucide-react';

interface NightModeOverlayProps {
  nightMode: boolean;
  activeTint: NightTint;
  onSelectTint: (tint: NightTint) => void;
  onToggleNightMode: () => void;
  dimLevel: number; // 0.1 to 1.0
  onChangeDim: (val: number) => void;
}

export const NightModeOverlay: React.FC<NightModeOverlayProps> = ({
  nightMode,
  activeTint,
  onSelectTint,
  onToggleNightMode,
  dimLevel,
  onChangeDim,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dimmer Slider & Night Mode Toggle */}
      <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-xl">
        <button
          onClick={onToggleNightMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            nightMode
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Night Mode {nightMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Screen Brightness Dimmer */}
        <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
          <SunMedium className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="range"
            min="0.15"
            max="1"
            step="0.05"
            value={dimLevel}
            onChange={(e) => onChangeDim(parseFloat(e.target.value))}
            className="w-20 sm:w-28 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            title="Screen Dimmer"
          />
          <span className="text-[10px] font-mono text-zinc-400 w-7">
            {Math.round(dimLevel * 100)}%
          </span>
        </div>
      </div>

      {/* TINT COLOR DOTS (Only shown or highlighted when night mode is on or for quick pick) */}
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 shadow-2xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline">
          Night Tint
        </span>
        {NIGHT_TINTS.map((t) => {
          const isSelected = activeTint === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                onSelectTint(t.id);
                if (!nightMode) onToggleNightMode();
              }}
              className={`relative rounded-full transition-all duration-300 ${
                isSelected
                  ? 'w-6 h-6 ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                  : 'w-4 h-4 opacity-75 hover:opacity-100 hover:scale-110'
              }`}
              style={{
                backgroundColor: t.hex,
                boxShadow: isSelected ? `0 0 12px ${t.hex}` : 'none',
              }}
              title={`${t.name} — ${t.label}`}
            />
          );
        })}
      </div>
    </div>
  );
};
