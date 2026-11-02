import React, { useEffect, useRef } from 'react';
import { VoiceStatus } from '../modules/models';

interface AiAssistantOrbProps {
  status: VoiceStatus;
  audioLevel: number;
  onClickToggle: () => void;
}

export const AiAssistantOrb: React.FC<AiAssistantOrbProps> = ({
  status,
  audioLevel,
  onClickToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle1 = 0;
    let angle2 = 0;
    let angle3 = 0;
    let pulse = 0;

    // Particles system
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 220,
      y: (Math.random() - 0.5) * 220,
      size: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 85 + 20,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Animation speeds and energy depending on status
      let rotSpeed = 0.015;
      let targetGlow = 0.5;
      let primaryColor = '#00f2fe';
      let secondaryColor = '#8b5cf6';
      let outerColor = 'rgba(0, 242, 254, 0.15)';

      if (status === 'listening') {
        rotSpeed = 0.035;
        targetGlow = 0.8 + audioLevel * 0.5;
        primaryColor = '#00f0ff';
        secondaryColor = '#3b82f6';
        outerColor = `rgba(0, 240, 255, ${0.25 + audioLevel * 0.4})`;
      } else if (status === 'processing') {
        rotSpeed = 0.06;
        targetGlow = 0.9;
        primaryColor = '#a855f7';
        secondaryColor = '#ec4899';
        outerColor = 'rgba(168, 85, 247, 0.3)';
      } else if (status === 'speaking') {
        rotSpeed = 0.025;
        targetGlow = 0.85;
        primaryColor = '#06b6d4';
        secondaryColor = '#10b981';
        outerColor = 'rgba(6, 182, 212, 0.35)';
      } else if (status === 'error') {
        rotSpeed = 0.01;
        targetGlow = 0.6;
        primaryColor = '#f43f5e';
        secondaryColor = '#fb7185';
        outerColor = 'rgba(244, 63, 94, 0.3)';
      }

      angle1 += rotSpeed;
      angle2 -= rotSpeed * 1.3;
      angle3 += rotSpeed * 0.7;
      pulse += 0.04;

      const dynamicRadius = 65 + Math.sin(pulse) * 4 + audioLevel * 25;

      // 1. Ambient outer volumetric glow
      const outerGlowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, dynamicRadius * 1.9);
      outerGlowGrad.addColorStop(0, outerColor);
      outerGlowGrad.addColorStop(0.5, outerColor.replace(/[\d.]+\)$/, '0.08)'));
      outerGlowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 1.9, 0, Math.PI * 2);
      ctx.fill();

      // 2. Swirling glowing particles
      particles.forEach((p) => {
        p.angle += p.speed * (status === 'processing' ? 2.5 : 1);
        const px = cx + Math.cos(p.angle) * (p.dist + Math.sin(pulse + p.dist) * 6);
        const py = cy + Math.sin(p.angle) * (p.dist + Math.sin(pulse + p.dist) * 6);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = p.alpha * targetGlow;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // 3. Outer Technological Rotating Ring 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle1);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = primaryColor;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius + 22, 0, Math.PI * 1.4);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius + 22, Math.PI * 1.6, Math.PI * 1.95);
      ctx.stroke();
      ctx.restore();

      // 4. Middle Scanning Ring 2 (Dashed Counter-rotating)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle2);
      ctx.setLineDash([8, 14, 2, 10]);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = secondaryColor;
      ctx.shadowColor = secondaryColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, dynamicRadius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 5. Inner Core Sphere with 3D Shader gradient
      const coreGrad = ctx.createRadialGradient(
        cx - dynamicRadius * 0.3,
        cy - dynamicRadius * 0.3,
        dynamicRadius * 0.1,
        cx,
        cy,
        dynamicRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, primaryColor);
      coreGrad.addColorStop(0.7, secondaryColor);
      coreGrad.addColorStop(1, '#030712');

      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 24 * targetGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      // 6. Central Core Energy Iris
      const irisGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, dynamicRadius * 0.45);
      irisGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      irisGrad.addColorStop(0.5, primaryColor);
      irisGrad.addColorStop(1, 'rgba(11, 17, 32, 0)');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 7. Audio wave arcs if listening or speaking
      if (status === 'listening' || status === 'speaking') {
        const waveCount = 8;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        for (let i = 0; i < waveCount; i++) {
          const wAngle = (i / waveCount) * Math.PI * 2 + angle3;
          const len = (dynamicRadius + 32) + Math.sin(pulse * 3 + i) * 15 * (audioLevel + 0.3);
          const x1 = cx + Math.cos(wAngle) * (dynamicRadius + 26);
          const y1 = cy + Math.sin(wAngle) * (dynamicRadius + 26);
          const x2 = cx + Math.cos(wAngle) * len;
          const y2 = cy + Math.sin(wAngle) * len;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status, audioLevel]);

  return (
    <div
      onClick={onClickToggle}
      className="relative flex items-center justify-center cursor-pointer group"
      title={status === 'listening' ? 'Click to stop listening' : 'Click to activate voice assistant'}
    >
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] transition-transform duration-300 group-hover:scale-105"
      />
      {/* Central cyber pulse ring backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-36 h-36 rounded-full border border-cyan-500/20 transition-all duration-500 ${
            status === 'listening'
              ? 'animate-ping border-cyan-400/40'
              : status === 'processing'
              ? 'animate-spin border-purple-400/40'
              : 'opacity-40'
          }`}
        />
      </div>
    </div>
  );
};
