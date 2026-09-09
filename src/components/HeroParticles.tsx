import React, { useEffect, useRef } from 'react';

export interface HeroParticlesProps {
  effect?: 'none' | 'golden_sparkles' | 'luxury_dust' | 'floating_stars' | 'ambient_glow';
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'normal' | 'fast';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  maxAlpha: number;
  dAlpha: number;
  rotation: number;
  dRotation: number;
  color: string;
  type: 'sparkle' | 'star' | 'dust' | 'orb';
}

export const HeroParticles: React.FC<HeroParticlesProps> = ({
  effect = 'golden_sparkles',
  density = 'medium',
  speed = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!effect || effect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Determine particle count based on density
    const getCount = () => {
      const base = width < 768 ? 20 : 45;
      if (density === 'low') return Math.round(base * 0.5);
      if (density === 'high') return Math.round(base * 1.8);
      return base;
    };

    // Speed multiplier
    const speedMultiplier = speed === 'slow' ? 0.5 : speed === 'fast' ? 1.6 : 1.0;

    // Luxury Golden Palette
    const colors = [
      'rgba(235, 195, 120, ', // Rich Gold
      'rgba(247, 226, 175, ', // Light Champagne
      'rgba(255, 255, 255, ', // Pure Star White
      'rgba(198, 163, 106, ', // Mini Bazaar Gold
      'rgba(229, 216, 201, ', // Sand Gold
    ];

    const particles: Particle[] = [];
    const count = getCount();

    for (let i = 0; i < count; i++) {
      const baseSize =
        effect === 'ambient_glow'
          ? Math.random() * 12 + 6
          : effect === 'luxury_dust'
          ? Math.random() * 2.5 + 1.2
          : Math.random() * 3.5 + 1.5;

      const pType: Particle['type'] =
        effect === 'floating_stars'
          ? 'star'
          : effect === 'ambient_glow'
          ? 'orb'
          : effect === 'luxury_dust'
          ? 'dust'
          : Math.random() > 0.4
          ? 'sparkle'
          : 'star';

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4 * speedMultiplier,
        vy: (-Math.random() * 0.8 - 0.2) * speedMultiplier,
        size: baseSize,
        baseSize,
        alpha: Math.random() * 0.7 + 0.1,
        maxAlpha: Math.random() * 0.6 + 0.3,
        dAlpha: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        rotation: Math.random() * Math.PI * 2,
        dRotation: (Math.random() - 0.5) * 0.04 * speedMultiplier,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: pType,
      });
    }

    const drawStar = (x: number, y: number, radius: number, rot: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const spikes = 4;
      const step = Math.PI / spikes;
      let angle = -Math.PI / 2;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.35;
        const currX = Math.cos(angle) * r;
        const currY = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
        angle += step;
      }
      ctx.closePath();
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowBlur = radius * 2.5;
      ctx.shadowColor = 'rgba(235, 195, 120, 0.7)';
      ctx.fill();
      ctx.restore();
    };

    const drawOrb = (x: number, y: number, radius: number, color: string, alpha: number) => {
      ctx.save();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `${color}${alpha})`);
      gradient.addColorStop(0.5, `${color}${alpha * 0.4})`);
      gradient.addColorStop(1, `${color}0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowBlur = size * 3;
      ctx.shadowColor = 'rgba(247, 226, 175, 0.8)';
      ctx.fill();

      // Cross flare
      if (size > 2.5) {
        ctx.strokeStyle = `${color}${alpha * 0.8})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(x - size * 1.8, y);
        ctx.lineTo(x + size * 1.8, y);
        ctx.moveTo(x, y - size * 1.8);
        ctx.lineTo(x, y + size * 1.8);
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.dRotation;
        p.alpha += p.dAlpha;

        // Twinkle / Breathing alpha
        if (p.alpha >= p.maxAlpha) {
          p.alpha = p.maxAlpha;
          p.dAlpha = -Math.abs(p.dAlpha);
        } else if (p.alpha <= 0.05) {
          p.alpha = 0.05;
          p.dAlpha = Math.abs(p.dAlpha);
        }

        // Loop boundaries
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        // Draw based on type
        if (p.type === 'star') {
          drawStar(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
        } else if (p.type === 'orb') {
          drawOrb(p.x, p.y, p.size, p.color, p.alpha);
        } else {
          drawSparkle(p.x, p.y, p.size, p.color, p.alpha);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [effect, density, speed]);

  if (!effect || effect === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-15"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};
