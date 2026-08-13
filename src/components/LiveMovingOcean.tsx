import React, { useEffect, useRef } from 'react';

export const LiveMovingOcean: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let step = 0;

    // Ocean Waves parameters in Purple/Pink/Violet theme
    const waves = [
      { amplitude: 55, frequency: 0.006, speed: 0.035, color: 'rgba(244, 114, 182, 0.55)', yOffset: 0.25 },
      { amplitude: 70, frequency: 0.004, speed: 0.025, color: 'rgba(192, 38, 211, 0.6)', yOffset: 0.38 },
      { amplitude: 45, frequency: 0.009, speed: 0.04, color: 'rgba(168, 85, 247, 0.65)', yOffset: 0.52 },
      { amplitude: 80, frequency: 0.003, speed: 0.02, color: 'rgba(126, 34, 206, 0.75)', yOffset: 0.65 },
      { amplitude: 90, frequency: 0.002, speed: 0.015, color: 'rgba(88, 28, 135, 0.88)', yOffset: 0.78 },
    ];

    // Bubbles/shimmer points in the water
    const particles: Array<{ x: number; y: number; radius: number; speed: number; alpha: number; isPink: boolean }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.8 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        isPink: Math.random() > 0.5,
      });
    }

    const render = () => {
      step += 1;

      // 1. Deep Purple & Pink Ocean Gradient Base
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#13021e'); // Deep night violet
      gradient.addColorStop(0.3, '#2a0845'); // Rich purple ocean
      gradient.addColorStop(0.65, '#4a0e4e'); // Magenta plum depth
      gradient.addColorStop(1, '#0f0117'); // Deep sea bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Live Moving Waves
      waves.forEach((wave) => {
        ctx.beginPath();
        const baseHeight = height * wave.yOffset;
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 10) {
          const y = baseHeight + Math.sin(x * wave.frequency + step * wave.speed) * wave.amplitude + Math.cos(x * 0.003 + step * 0.01) * 15;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      // 3. Render Shimmering Water Caustics / Bubbles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(step * 0.02 + p.y * 0.01) * 0.5;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isPink ? `rgba(244, 114, 182, ${p.alpha})` : `rgba(216, 180, 254, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Live Canvas Wave Animation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      {/* Translucent blur overlay for glowing water atmosphere */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/10" />
    </div>
  );
};
