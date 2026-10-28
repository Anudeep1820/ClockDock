import React, { useState } from 'react';
import { CloudRain, Waves, Flame, Radio, Volume2, Square } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface SleepSoundsWidgetProps {
  nightMode?: boolean;
  nightHex?: string;
}

export const SleepSoundsWidget: React.FC<SleepSoundsWidgetProps> = ({
  nightMode = false,
  nightHex = '#ef4444',
}) => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.6);

  const sounds = [
    { id: 'rain', name: 'Gentle Rain', icon: CloudRain, play: () => soundEngine.playRain(volume) },
    { id: 'waves', name: 'Ocean Waves', icon: Waves, play: () => soundEngine.playWaves(volume) },
    { id: 'fire', name: 'Campfire', icon: Flame, play: () => soundEngine.playCampfire(volume) },
    { id: 'noise', name: 'White Noise', icon: Radio, play: () => soundEngine.playRain(volume * 0.7) },
  ];

  const handleToggle = (s: typeof sounds[0]) => {
    if (activeSound === s.id) {
      soundEngine.stopAll();
      setActiveSound(null);
    } else {
      s.play();
      setActiveSound(s.id);
    }
  };

  const handleStop = () => {
    soundEngine.stopAll();
    setActiveSound(null);
  };

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
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest text-emerald-400"
            style={{ color: nightMode ? nightHex : '#34d399' }}
          >
            Sleep Machine
          </span>
          <h3
            className="text-lg font-bold tracking-tight mt-0.5"
            style={{ color: activeColor }}
          >
            {activeSound ? `Playing: ${sounds.find((s) => s.id === activeSound)?.name}` : 'Ambient Noise'}
          </h3>
        </div>

        {activeSound && (
          <button
            onClick={handleStop}
            className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border hover:bg-white/10 transition-colors"
            style={{
              borderColor: nightMode ? `${nightHex}40` : 'rgba(255,255,255,0.2)',
              color: activeColor,
            }}
          >
            <Square className="w-3 h-3 fill-current" />
            Stop
          </button>
        )}
      </div>

      {/* Grid of Sound Buttons */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        {sounds.map((s) => {
          const Icon = s.icon;
          const isSelected = activeSound === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleToggle(s)}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                isSelected ? 'scale-[1.02] shadow-lg' : 'hover:bg-white/5 opacity-80'
              }`}
              style={{
                backgroundColor: isSelected
                  ? nightMode
                    ? `${nightHex}30`
                    : 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.3)',
                borderColor: isSelected
                  ? nightMode
                    ? nightHex
                    : '#ffffff'
                  : 'rgba(255,255,255,0.08)',
                color: isSelected ? activeColor : '#94a3b8',
                boxShadow: isSelected && nightMode ? `0 0 15px ${nightHex}40` : undefined,
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold text-left truncate">{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Volume Bar */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <Volume2 className="w-4 h-4 text-zinc-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            soundEngine.setVolume(v);
          }}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <span className="text-[11px] font-mono text-zinc-400 w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
};
