import React, { useEffect, useRef } from 'react';
import {
  BackgroundThemeId,
  AnimationSpeed,
  EffectIntensity,
  ParticleDensity,
  ClockColor,
  GlowStrength,
} from '../types';

interface BackgroundStudioProps {
  themeId: BackgroundThemeId;
  isAnimated: boolean;
  speed: AnimationSpeed;
  intensity: EffectIntensity;
  particleDensity: ParticleDensity;
  blur: boolean;
  customColor: string;
  customColorSecondary?: string;
  clockColor: ClockColor;
  glowStrength?: GlowStrength;
  bgBrightness?: number;
  reduceMotion?: boolean;
}

export const BackgroundStudio: React.FC<BackgroundStudioProps> = ({
  themeId,
  isAnimated,
  speed,
  intensity,
  particleDensity,
  blur,
  customColor,
  customColorSecondary = '#160d2b',
  clockColor,
  glowStrength = 'subtle',
  bgBrightness = 1.0,
  reduceMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If user has reduceMotion enabled, suppress animation
  const effectiveAnimated = isAnimated && !reduceMotion;

  // Speed factor multipliers
  const speedMultiplier =
    speed === 'slow' ? 0.35 : speed === 'fast' ? 1.8 : 1.0;

  // Intensity opacity factor
  const opacityFactor =
    intensity === 'low' ? 0.3 : intensity === 'high' ? 0.95 : 0.65;

  // Glow strength multiplier
  const glowMultiplier =
    glowStrength === 'off' ? 0 : glowStrength === 'vibrant' ? 1.25 : 0.75;

  // Particle count
  const particleCount =
    particleDensity === 'low' ? 24 : particleDensity === 'high' ? 90 : 50;

  // HTML5 Canvas animation loop for Particle & Cosmic Night styles
  useEffect(() => {
    if (themeId !== 'cosmic-night' && themeId !== 'ambient-particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles
    interface Particle {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedX: number;
      speedY: number;
      color: string;
      twinkleSpeed: number;
    }

    const particles: Particle[] = [];
    const colors =
      themeId === 'cosmic-night'
        ? ['#ffffff', '#e0e7ff', '#c7d2fe', '#fef08a']
        : ['#ffffff', '#67e8f9', '#a7f3d0', '#fbcfe8'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (themeId === 'cosmic-night' ? 1.8 : 3.0) + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4 * speedMultiplier,
        speedY:
          (Math.random() - 0.5) * 0.4 * speedMultiplier -
          (themeId === 'ambient-particles' ? 0.3 : 0),
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.02 * speedMultiplier + 0.005,
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      if (document.hidden) {
        // Pause animation when tab or window is hidden to save battery & CPU
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (effectiveAnimated) {
          p.x += p.speedX;
          p.y += p.speedY;

          // Twinkle effect
          p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
          p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));

          // Screen wrap
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * opacityFactor;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.radius * 3;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (!document.hidden && isRunning) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeId, effectiveAnimated, speedMultiplier, opacityFactor, particleCount]);

  // Animation duration style based on speed
  const animDuration =
    speed === 'slow' ? '28s' : speed === 'fast' ? '9s' : '18s';

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-all duration-700 ${
        blur ? 'backdrop-blur-md' : ''
      }`}
      style={{
        filter: `brightness(${bgBrightness})`,
      }}
    >
      {/* 1. OLED Pure Black */}
      {themeId === 'oled-black' && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* 2. Aurora Borealis (Ethereal flowing ribbons) */}
      {themeId === 'aurora-borealis' && (
        <div className="absolute inset-0 bg-[#020d11]">
          <div
            className={`absolute -inset-[50%] filter blur-[80px] ${
              effectiveAnimated ? 'animate-[spin_var(--dur)_linear_infinite]' : ''
            }`}
            style={
              {
                '--dur': animDuration,
                opacity: opacityFactor,
                background:
                  'radial-gradient(ellipse at 30% 40%, rgba(16, 185, 129, 0.45) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6, 182, 212, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.35) 0%, transparent 60%)',
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* 3. Liquid Gradient (Organic color mesh) */}
      {themeId === 'liquid-gradient' && (
        <div className="absolute inset-0 bg-[#090314]">
          <div
            className={`absolute -inset-[40%] filter blur-[90px] ${
              effectiveAnimated ? 'animate-[spin_var(--dur)_linear_infinite]' : ''
            }`}
            style={
              {
                '--dur': animDuration,
                opacity: opacityFactor,
                background:
                  'conic-gradient(from 180deg at 50% 50%, #4c1d95, #0e7490, #be185d, #047857, #4c1d95)',
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* 4. Cosmic Night (Twinkling space stars) */}
      {themeId === 'cosmic-night' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#020208] via-[#070817] to-[#02020a]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      )}

      {/* 5. Ambient Particles (Floating light dust) */}
      {themeId === 'ambient-particles' && (
        <div className="absolute inset-0 bg-[#060609]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      )}

      {/* 6. Sunset Horizon (Warm dusk twilight) */}
      {themeId === 'sunset-horizon' && (
        <div className="absolute inset-0 bg-[#12030d]">
          <div
            className="absolute inset-0"
            style={{
              opacity: opacityFactor,
              background:
                'linear-gradient(180deg, #1c051a 0%, #3b0d26 35%, #581c15 65%, #2a0b12 85%, #0d0208 100%)',
            }}
          />
          {effectiveAnimated && (
            <div
              className="absolute inset-0 animate-pulseGlow filter blur-3xl opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 80%, #f97316 0%, transparent 60%)',
              }}
            />
          )}
        </div>
      )}

      {/* 7. Deep Ocean (Underwater caustics & teal ribbons) */}
      {themeId === 'deep-ocean' && (
        <div className="absolute inset-0 bg-[#010914]">
          <div
            className={`absolute -inset-[30%] filter blur-[80px] ${
              effectiveAnimated
                ? 'animate-[spin_var(--dur)_ease-in-out_infinite_alternate]'
                : ''
            }`}
            style={
              {
                '--dur': animDuration,
                opacity: opacityFactor,
                background:
                  'radial-gradient(circle at 40% 30%, #082f49 0%, transparent 60%), radial-gradient(circle at 70% 70%, #0369a1 0%, transparent 55%), radial-gradient(circle at 20% 80%, #0e7490 0%, transparent 50%)',
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* 8. Midnight Nebula (Cosmic dust clouds) */}
      {themeId === 'midnight-nebula' && (
        <div className="absolute inset-0 bg-[#0a0212]">
          <div
            className={`absolute -inset-[40%] filter blur-[100px] ${
              effectiveAnimated ? 'animate-[pulseGlow_var(--dur)_ease-in-out_infinite]' : ''
            }`}
            style={
              {
                '--dur': animDuration,
                opacity: opacityFactor,
                background:
                  'radial-gradient(ellipse at 30% 30%, #581c87 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, #3b0764 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #1e1b4b 0%, transparent 60%)',
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* 9. Soft Glow (Coordinated behind clock face) */}
      {themeId === 'soft-glow' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div
            className={`w-[85vw] h-[85vw] max-w-[650px] max-h-[650px] rounded-full filter blur-[110px] ${
              effectiveAnimated ? 'animate-pulseGlow' : ''
            }`}
            style={{
              opacity: opacityFactor * glowMultiplier,
              background: `radial-gradient(circle, ${clockColor.glow} 0%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* 10. Custom Solid or Dual Gradient Color */}
      {themeId === 'custom-color' && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: customColorSecondary
              ? `linear-gradient(135deg, ${customColor} 0%, ${customColorSecondary} 100%)`
              : customColor || '#0a0a14',
          }}
        />
      )}

      {/* Subtle Dark Scrim Overlay to guarantee 100% clock readability at all times */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};
