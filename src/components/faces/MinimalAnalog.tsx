import React from 'react';
import { ClockColor, TypographyStyle, GlowStrength } from '../../types';

interface MinimalAnalogProps {
  time: Date;
  color: ClockColor;
  typography: TypographyStyle;
  showDate: boolean;
  showSeconds: boolean;
  glowStrength?: GlowStrength;
  onCycleColor?: () => void;
}

export const MinimalAnalog: React.FC<MinimalAnalogProps> = ({
  time,
  color,
  typography,
  showDate,
  showSeconds,
  glowStrength = 'subtle',
  onCycleColor,
}) => {
  // Sub-second precision for smooth sweeping second hand
  const ms = time.getMilliseconds();
  const seconds = time.getSeconds() + ms / 1000;
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  const dateDay = time.getDate();
  const dayName = time.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
  const monthName = time.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();

  const glowShadow =
    glowStrength === 'off'
      ? 'none'
      : glowStrength === 'vibrant'
      ? `0 0 35px ${color.glow}`
      : `0 0 18px ${color.dimGlow}`;

  return (
    <div
      onClick={onCycleColor}
      className={`relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 select-none cursor-pointer ${typography.className}`}
    >
      {/* Outer Luxury Chronometer Case & Bezel */}
      <div
        className="relative w-[78vw] h-[78vw] max-w-[340px] max-h-[340px] sm:max-w-[430px] sm:max-h-[430px] md:max-w-[490px] md:max-h-[490px] rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl p-2.5 sm:p-3.5"
        style={{
          background: 'linear-gradient(145deg, #23232b 0%, #101014 50%, #08080a 100%)',
          boxShadow: `0 30px 80px -15px rgba(0,0,0,0.95), 0 0 50px ${color.dimGlow}, inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.8)`,
          border: '1.5px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Inner Watch Dial */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 48%, #16161b 0%, #0d0d10 65%, #050507 100%)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)',
          }}
        >
          {/* Subtle horology crosshair / sub-grid lines */}
          <div className="absolute inset-x-8 top-1/2 h-[0.5px] bg-white/[0.04] pointer-events-none" />
          <div className="absolute inset-y-8 left-1/2 w-[0.5px] bg-white/[0.04] pointer-events-none" />

          {/* Luxury Brand & Chronometer Label */}
          <div className="absolute top-[21%] flex flex-col items-center pointer-events-none">
            <span
              className="text-[9px] sm:text-[10px] tracking-[0.25em] font-bold uppercase"
              style={{ color: `${color.primary}85` }}
            >
              STANDBY
            </span>
            <span className="text-[7px] sm:text-[8px] tracking-[0.18em] text-zinc-500 font-mono mt-0.5">
              CHRONOMETER
            </span>
          </div>

          {/* Cardinal Hour Numbers: 12, 3, 6, 9 */}
          <span
            className="absolute top-4 sm:top-6 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: color.primary, textShadow: glowShadow }}
          >
            12
          </span>
          <span
            className="absolute right-5 sm:right-7 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: color.primary, textShadow: glowShadow }}
          >
            3
          </span>
          <span
            className="absolute bottom-4 sm:bottom-6 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: color.primary, textShadow: glowShadow }}
          >
            6
          </span>
          <span
            className="absolute left-5 sm:left-7 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: color.primary, textShadow: glowShadow }}
          >
            9
          </span>

          {/* 60 Precision Minute & Hour Indices */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHourMarker = i % 5 === 0;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 pointer-events-none"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div
                  className="w-full rounded-full transition-colors duration-300"
                  style={{
                    height: isHourMarker ? '13px' : '5px',
                    width: isHourMarker ? '2.5px' : '1px',
                    backgroundColor: isHourMarker ? color.primary : 'rgba(255,255,255,0.18)',
                    boxShadow: isHourMarker && glowStrength !== 'off' ? `0 0 6px ${color.glow}` : 'none',
                  }}
                />
              </div>
            );
          })}

          {/* Date Complication Window at 3 o'clock */}
          {showDate && (
            <div
              className="absolute right-14 sm:right-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md border backdrop-blur-md shadow-inner"
              style={{
                borderColor: `${color.primary}35`,
                backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-wider"
                style={{ color: color.secondary }}
              >
                {dayName} {monthName}
              </span>
              <span
                className="text-xs sm:text-sm font-black font-mono ml-0.5"
                style={{ color: color.primary }}
              >
                {dateDay}
              </span>
            </div>
          )}

          {/* Hour Hand (Watch-inspired with central lume trench) */}
          <div
            className="absolute w-2.5 sm:w-3 rounded-full transition-transform z-10 flex flex-col items-center justify-start p-0.5"
            style={{
              height: '29%',
              top: '21%',
              left: 'calc(50% - 5px)',
              transformOrigin: '50% 100%',
              transform: `rotate(${hourDeg}deg)`,
              backgroundColor: '#18181f',
              border: `1.5px solid ${color.primary}`,
              boxShadow: '0 6px 14px rgba(0,0,0,0.8)',
            }}
          >
            {/* Luminous Inlay */}
            <div
              className="w-1 h-[65%] rounded-full mt-1"
              style={{
                backgroundColor: color.primary,
                boxShadow: glowStrength !== 'off' ? `0 0 8px ${color.glow}` : 'none',
              }}
            />
          </div>

          {/* Minute Hand (Tapered sword style) */}
          <div
            className="absolute w-2 sm:w-2.5 rounded-full transition-transform z-10 flex flex-col items-center justify-start p-0.5"
            style={{
              height: '40%',
              top: '10%',
              left: 'calc(50% - 4px)',
              transformOrigin: '50% 100%',
              transform: `rotate(${minuteDeg}deg)`,
              backgroundColor: '#18181f',
              border: `1.5px solid ${color.secondary}`,
              boxShadow: '0 6px 14px rgba(0,0,0,0.8)',
            }}
          >
            {/* Luminous Inlay */}
            <div
              className="w-1 h-[70%] rounded-full mt-1"
              style={{
                backgroundColor: color.secondary,
                boxShadow: glowStrength !== 'off' ? `0 0 8px ${color.glow}` : 'none',
              }}
            />
          </div>

          {/* Continuous Sweeping Second Hand (Optional) */}
          {showSeconds && (
            <div
              className="absolute w-[1.5px] sm:w-[2px] transition-transform z-20 pointer-events-none"
              style={{
                height: '48%',
                top: '7%',
                left: 'calc(50% - 1px)',
                transformOrigin: '50% 89.5%',
                transform: `rotate(${secondDeg}deg)`,
                backgroundColor: color.primary,
                boxShadow: glowStrength !== 'off' ? `0 0 10px ${color.glow}` : 'none',
              }}
            >
              {/* Lollipop luminous counterweight */}
              <div
                className="w-2.5 h-2.5 rounded-full -left-[4px] absolute top-6 border border-black"
                style={{
                  backgroundColor: color.primary,
                  boxShadow: glowStrength !== 'off' ? `0 0 8px ${color.glow}` : 'none',
                }}
              />
            </div>
          )}

          {/* Horology Center Cap Hub */}
          <div
            className="absolute w-4 h-4 rounded-full z-30 shadow-lg border-2 border-[#121216]"
            style={{
              background: `radial-gradient(circle, ${color.primary} 40%, #0a0a0d 100%)`,
              boxShadow: `0 0 10px ${color.dimGlow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
