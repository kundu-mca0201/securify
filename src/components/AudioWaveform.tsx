import React, { useEffect, useRef } from 'react';
import { speechService } from '../modules/SpeechRecognition';

interface AudioWaveformProps {
  isListening: boolean;
  audioLevel: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isListening, audioLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 48;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;

      const analyser = speechService.getAnalyser();
      let dataArray: any = null;
      if (analyser && isListening) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isListening && dataArray) {
          const index = Math.floor((i / barCount) * (dataArray.length / 2));
          const val = dataArray[index] || 0;
          barHeight = Math.max(4, (val / 255) * (height - 8));
        } else if (isListening) {
          // Fallback simulation wave when listening
          const phase = Date.now() * 0.006 + i * 0.3;
          barHeight = Math.max(4, (Math.sin(phase) * 0.5 + 0.5) * (height * 0.6) * (audioLevel + 0.3));
        } else {
          // Subtle idle ambient ripple
          const idleWave = Math.sin(Date.now() * 0.002 + i * 0.2);
          barHeight = Math.max(3, 4 + idleWave * 3);
        }

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isListening) {
          grad.addColorStop(0, '#00f2fe');
          grad.addColorStop(0.5, '#4facfe');
          grad.addColorStop(1, '#8b5cf6');
        } else {
          grad.addColorStop(0, '#334155');
          grad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = grad;
        ctx.shadowColor = isListening ? '#00f2fe' : 'transparent';
        ctx.shadowBlur = isListening ? 6 : 0;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isListening, audioLevel]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-3">
      <div className="w-full max-w-lg h-14 bg-surface-100/60 rounded-xl p-2 border border-cyan-500/20 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <canvas ref={canvasRef} width={500} height={44} className="w-full h-full" />
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono-cyber text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
          {isListening ? 'VOICE STREAM ACTIVE' : 'MICROPHONE STANDBY'}
        </span>
        <span className="text-slate-600">|</span>
        <span>FREQ: 24.0 kHz</span>
        <span className="text-slate-600">|</span>
        <span>ENCRYPTED LOCAL</span>
      </div>
    </div>
  );
};
