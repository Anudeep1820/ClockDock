import React, { useState, useEffect, useRef } from 'react';
import { ClockColor, TypographyStyle } from '../../types';

interface FlipCardProps {
  value: string;
  label: string;
  color: ClockColor;
  typography: TypographyStyle;
}

const FlipTile: React.FC<FlipCardProps> = ({ value, label, color, typography }) => {
  const [currentVal, setCurrentVal] = useState(value);
  const [prevVal, setPrevVal] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValRef = useRef(value);

  useEffect(() => {
    if (value !== prevValRef.current) {
      setPrevVal(prevValRef.current);
      setCurrentVal(value);
      setIsFlipping(true);
      prevValRef.current = value;

      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      {/* 3D Mechanical Card Frame */}
      <div className="flip-card-container relative w-20 sm:w-32 md:w-44 lg:w-48 h-28 sm:h-44 md:h-60 lg:h-64 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center select-none">
        {/* Card Background Base */}
        <div
          className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden flex flex-col"
          style={{
            backgroundColor: '#121216',
            boxShadow: `0 20px 40px -10px rgba(0,0,0,0.9), 0 0 30px ${color.dimGlow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
          }}
        >
          {/* Top Half */}
          <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#1c1c22] to-[#141418] border-b border-black/80 flex items-end justify-center">
            <span
              className={`font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none translate-y-1/2 ${typography.className}`}
              style={{
                color: color.primary,
                textShadow: `0 0 25px ${color.glow}`,
              }}
            >
              {currentVal}
            </span>
            {/* Subtle top glare reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Bottom Half */}
          <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-[#0f0f13] to-[#0a0a0d] flex items-start justify-center">
            <span
              className={`font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none -translate-y-1/2 ${typography.className}`}
              style={{
                color: color.primary,
                textShadow: `0 0 25px ${color.glow}`,
              }}
            >
              {currentVal}
            </span>
            {/* Bottom shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Flipping Top-To-Bottom Flap Card Animation */}
        {isFlipping && (
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-gradient-to-b from-[#1c1c22] to-[#141418] border border-white/10 border-b-black origin-bottom animate-[flipTop_0.55s_ease-in-out_forwards] z-20 pointer-events-none flex items-end justify-center"
            style={{
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            }}
          >
            <span
              className={`font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none translate-y-1/2 ${typography.className}`}
              style={{ color: color.primary }}
            >
              {prevVal}
            </span>
          </div>
        )}

        {/* Center Hinge Divider Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-[2.5px] bg-black/95 z-30 shadow-md" />

        {/* Mechanical Hinge Brackets on Left & Right */}
        <div className="absolute top-1/2 -left-2 w-3.5 h-4.5 rounded-full bg-zinc-800 border border-zinc-700 z-40 transform -translate-y-1/2 shadow-lg" />
        <div className="absolute top-1/2 -right-2 w-3.5 h-4.5 rounded-full bg-zinc-800 border border-zinc-700 z-40 transform -translate-y-1/2 shadow-lg" />
      </div>

      {/* Understated Card Label */}
      <span
        className="mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
        style={{ color: `${color.secondary}80` }}
      >
        {label}
      </span>
    </div>
  );
};

interface RetroFlipProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  is24Hour: boolean;
  showDate: boolean;
  showSeconds: boolean;
  onCycleColor?: () => void;
}

export const RetroFlip: React.FC<RetroFlipProps> = ({
  time,
  color,
  typography,
  is24Hour,
  showDate,
  showSeconds,
  onCycleColor,
}) => {
  let hoursNum = time.getHours();
  if (!is24Hour) {
    hoursNum = hoursNum % 12 || 12;
  }
  const hours = hoursNum.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const fullDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      onClick={onCycleColor}
      className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 select-none cursor-pointer"
    >
      {/* Flip Tiles Row */}
      <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
        <FlipTile
          value={hours}
          label="Hours"
          color={color}
          typography={typography}
        />

        <div className="flex flex-col gap-3 pb-8">
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg"
            style={{ backgroundColor: color.primary }}
          />
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg"
            style={{ backgroundColor: color.primary }}
          />
        </div>

        <FlipTile
          value={minutes}
          label="Minutes"
          color={color}
          typography={typography}
        />

        {showSeconds && (
          <>
            <div className="flex flex-col gap-3 pb-8">
              <span
                className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg"
                style={{ backgroundColor: color.primary }}
              />
              <span
                className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg"
                style={{ backgroundColor: color.primary }}
              />
            </div>
            <FlipTile
              value={seconds}
              label="Seconds"
              color={color}
              typography={typography}
            />
          </>
        )}
      </div>

      {/* Date Complication */}
      {showDate && (
        <div className="mt-8 text-center">
          <p
            className={`text-xs sm:text-sm font-semibold tracking-widest uppercase ${typography.className}`}
            style={{ color: `${color.secondary}90` }}
          >
            {fullDate}
          </p>
        </div>
      )}
    </div>
  );
};
