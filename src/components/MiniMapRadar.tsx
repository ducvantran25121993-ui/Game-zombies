import React, { useRef, useEffect, useState } from 'react';
import { PlayerStats, Zombie, DropItem } from '../types/game';
import { Compass, Maximize2, Minimize2, X, ArrowLeftRight, RotateCcw, GripHorizontal } from 'lucide-react';

interface MiniMapRadarProps {
  player: PlayerStats;
  zombies: Zombie[];
  drops: DropItem[];
  mapWidth?: number;
  mapHeight?: number;
  onClose?: () => void;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = ({
  player,
  zombies,
  drops,
  mapWidth = 2600,
  mapHeight = 2000,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const sweepAngleRef = useRef(0);

  // Free-drag & Dock positioning
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('zombie_radar_custom_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [dockSide, setDockSide] = useState<'right' | 'left'>(() => {
    try {
      return (localStorage.getItem('zombie_radar_dock_side') as 'right' | 'left') || 'right';
    } catch {
      return 'right';
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; posX: number; posY: number }>({
    clientX: 0,
    clientY: 0,
    posX: 0,
    posY: 0
  });

  // Touch & Mouse Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      const newX = Math.max(6, Math.min(window.innerWidth - 105, dragStartRef.current.posX + dx));
      const newY = Math.max(48, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
      setCustomPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.clientX;
      const dy = touch.clientY - dragStartRef.current.clientY;
      const newX = Math.max(6, Math.min(window.innerWidth - 105, dragStartRef.current.posX + dx));
      const newY = Math.max(48, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
      setCustomPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      setCustomPos(prev => {
        if (prev) {
          try {
            localStorage.setItem('zombie_radar_custom_pos', JSON.stringify(prev));
          } catch {}
        }
        return prev;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      clientX,
      clientY,
      posX: rect.left,
      posY: rect.top
    };
    setIsDragging(true);
  };

  const handleToggleDockSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPos(null);
    try {
      localStorage.removeItem('zombie_radar_custom_pos');
    } catch {}
    const nextSide = dockSide === 'right' ? 'left' : 'right';
    setDockSide(nextSide);
    try {
      localStorage.setItem('zombie_radar_dock_side', nextSide);
    } catch {}
  };

  const handleResetPos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPos(null);
    try {
      localStorage.removeItem('zombie_radar_custom_pos');
    } catch {}
  };

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
    <div
      ref={containerRef}
      style={customPos ? { position: 'fixed', left: `${customPos.x}px`, top: `${customPos.y}px`, zIndex: 30 } : undefined}
      className={!customPos ? (
        dockSide === 'left'
          ? 'fixed top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+158px)] sm:top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+96px)] landscape:top-[38px] left-[max(0.5rem,env(safe-area-inset-left,0px))] sm:left-4 z-30 select-none pointer-events-auto transition-all'
          : 'fixed top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+158px)] sm:top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+96px)] landscape:top-[38px] right-[max(0.5rem,env(safe-area-inset-right,0px))] sm:right-3 z-30 select-none pointer-events-auto transition-all'
      ) : 'select-none pointer-events-auto'}
    >
      <div className="relative rounded-xl overflow-hidden border border-sky-500/50 landscape:border-sky-500/35 shadow-lg shadow-sky-950/40 bg-neutral-950/85 landscape:bg-neutral-950/60 backdrop-blur-md landscape:backdrop-blur-sm">
        {/* Radar Header with Drag & Dock Controls */}
        <div
          className="flex items-center justify-between px-1.5 py-0.5 bg-neutral-900/90 border-b border-sky-500/30 text-[7.5px] sm:text-[8px] text-sky-400 font-mono font-bold gap-1 cursor-grab active:cursor-grabbing active:bg-sky-950/40 select-none touch-none"
          onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          title="Chạm giữ thanh này để kéo Radar đến vị trí tùy ý"
        >
          <div className="flex items-center gap-1 shrink-0">
            <GripHorizontal className="w-2.5 h-2.5 text-sky-400/60" />
            <Compass className="w-2.5 h-2.5 animate-spin text-sky-400" style={{ animationDuration: '8s' }} />
            <span className="text-[7px] sm:text-[7.5px] tracking-wider">RADAR</span>
          </div>

          <div
            className="flex items-center gap-0.5 shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Reset custom dragged pos */}
            {customPos && (
              <button
                onClick={handleResetPos}
                className="p-0.5 hover:text-amber-300 text-neutral-400 transition-colors"
                title="Khôi phục vị trí mặc định"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}

            {/* Switch dock side Left / Right */}
            <button
              onClick={handleToggleDockSide}
              className="p-0.5 hover:text-white text-sky-300 transition-colors"
              title={dockSide === 'right' ? 'Đổi sang góc Trái' : 'Đổi sang góc Phải'}
            >
              <ArrowLeftRight className="w-2.5 h-2.5" />
            </button>

            {/* Minimize / Maximize */}
            <button
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-0.5 hover:text-white transition-colors text-sky-300"
              title={isMinimized ? 'Mở rộng Radar' : 'Thu nhỏ Radar'}
            >
              {isMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
            </button>

            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-0.5 hover:text-red-400 text-sky-400/80 transition-colors"
                title="Ẩn Radar"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Canvas or Minimized Pill */}
        {!isMinimized ? (
          <div className="relative w-[78px] h-[54px] sm:w-[94px] sm:h-[66px] landscape:w-[84px] landscape:h-[58px]">
            <canvas
              ref={canvasRef}
              width={94}
              height={66}
              className="w-full h-full block"
            />
            {/* Cardinal markers */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[6.5px] font-mono text-sky-400/70 pointer-events-none">N</span>
            {/* Threat indicator */}
            <div className="absolute bottom-0.5 left-1 text-[6.5px] sm:text-[7px] font-mono text-amber-400/90 pointer-events-none">
              ⚠️ {zombies.filter(z => z.hp > 0).length}
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsMinimized(false)}
            className="px-1.5 py-0.5 text-[7.5px] font-mono text-sky-300 hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
            title="Chạm để mở rộng Radar"
          >
            <Compass className="w-2.5 h-2.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>⚠️ {zombies.filter(z => z.hp > 0).length}</span>
            <Maximize2 className="w-2 h-2 text-sky-300 ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
};
