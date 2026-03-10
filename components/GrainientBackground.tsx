'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export default function GrainientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // We'll create a subtle animated noise effect
    // That gives it a techy, premium grain feel without WebGL overhead
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const isDark = theme === 'dark';
    
    // Config based on theme
    const baseColor = isDark ? [26, 26, 26] : [242, 231, 213]; // #1A1A1A or #F2E7D5
    const highlightColor = isDark ? [40, 40, 45] : [255, 245, 230];
    
    let time = 0;
    
    const render = () => {
      time += 0.003;
      
      const w = canvas.width;
      const h = canvas.height;
      
      // Animate gradient origin slightly with time to give a living, breathing feel
      const ox = w * 0.5 + Math.sin(time) * w * 0.15;
      const oy = h * 0.5 + Math.cos(time * 0.7) * h * 0.1;
      const gradient = ctx.createRadialGradient(ox, oy, 0, w * 0.5, h * 0.5, Math.max(w, h));
      
      gradient.addColorStop(0, `rgb(${baseColor.join(',')})`);
      gradient.addColorStop(1, `rgb(${highlightColor.join(',')})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      
      // Apply noise pattern overlay
      // For performance we render noise to an offscreen canvas and tile it or use CSS
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Using a CSS noise overlay over the canvas gradient is often more performant and looks better
  return (
    <div className="fixed inset-0 " style={{ zIndex: -1 }}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      {/* SVG Noise overlay for that premium 'Grainient' feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.8" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
