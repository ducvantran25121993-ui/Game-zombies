import React, { useRef, useEffect, useState } from 'react';
import { PlayerStats, Zombie, DropItem } from '../types/game';
import { Compass, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

interface MiniMapRadarProps {
  player: PlayerStats;
  zombies: Zombie[];
  drops: DropItem[];
  mapWidth?: number;
  mapHeight?: number;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = ({
  player,
  zombies,
  drops,
  mapWidth = 2600,
  mapHeight = 2000
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const sweepAngleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMinimized) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
      ctx.fillRect(0, 0, w, h);

      // Tactical Grid Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Range rings
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Sweeping radar beam
      sweepAngleRef.current = (sweepAngleRef.current + 0.04) % (Math.PI * 2);
      const sweep = sweepAngleRef.current;
      const beamGrad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w * 0.5);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.arc(w / 2, h / 2, w * 0.48, sweep - 0.4, sweep);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // Scale factors
      const sx = w / mapWidth;
      const sy = h / mapHeight;

      // 1. Draw Drops (Gold = Amber, Medkit = Green)
      drops.forEach(d => {
        const dx = d.x * sx;
        const dy = d.y * sy;
        ctx.fillStyle = d.type === 'medkit' ? '#10b981' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Regular Zombies (Red micro dots)
      let livingCount = 0;
      zombies.forEach(z => {
        if (z.hp <= 0) return;
        livingCount++;
        const zx = z.x * sx;
        const zy = z.y * sy;

        if (z.isBoss) {
          // Boss: Large pulsing crimson dot with warning circle
          const pulse = (Math.sin(performance.now() * 0.008) + 1) * 2;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(zx, zy, 4 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(zx, zy, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(zx, zy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(zx, zy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw Player (Cyan Dot with direction pointer)
      const px = player.x * sx;
      const py = player.y * sy;

      // Player pulse ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Player center
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Direction cone / pointer
      const ptrDist = 6;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(player.angle) * ptrDist, py + Math.sin(player.angle) * ptrDist);
      ctx.stroke();

      // Border outline
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, w - 2, h - 2);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [player.x, player.y, player.angle, zombies, drops, isMinimized, mapWidth, mapHeight]);

  return (
    <div className="flex flex-col items-end gap-1 select-none pointer-events-auto">
      <div className="relative rounded-xl overflow-hidden border border-sky-500/50 shadow-[0_0_15px_rgba(2,132,199,0.3)] bg-neutral-950/90 backdrop-blur-md">
        {/* Radar Header */}
        <div className="flex items-center justify-between px-2 py-0.5 bg-neutral-900/90 border-b border-sky-500/30 text-[8px] text-sky-400 font-mono font-bold">
          <span className="flex items-center gap-1">
            <Compass className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '8s' }} />
            RADAR GPS
          </span>
          <button
            onClick={() => setIsMinimized(prev => !prev)}
            className="p-0.5 hover:text-white transition-colors"
            title={isMinimized ? 'Mở rộng Radar' : 'Thu nhỏ Radar'}
          >
            {isMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
          </button>
        </div>

        {/* Canvas or Minimized Pill */}
        {!isMinimized ? (
          <div className="relative w-[88px] h-[68px] sm:w-[104px] sm:h-[80px]">
            <canvas
              ref={canvasRef}
              width={104}
              height={80}
              className="w-full h-full block"
            />
            {/* Cardinal markers */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-sky-400/70 pointer-events-none">N</span>
            {/* Threat indicator */}
            <div className="absolute bottom-0.5 left-1 text-[7px] font-mono text-amber-400/90 pointer-events-none">
              ⚠️ {zombies.filter(z => z.hp > 0).length}
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsMinimized(false)}
            className="px-2 py-1 text-[8px] font-mono text-sky-400 cursor-pointer flex items-center gap-1"
          >
            <span>[BẬT RADAR]</span>
          </div>
        )}
      </div>
    </div>
  );
};
