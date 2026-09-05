import React, { useState, useEffect, useRef } from 'react';
import { BESTIARY_DATA } from '../data/bestiary';
import { ZombieType, BestiaryEntry } from '../types/game';
import { Skull, AlertTriangle, Shield, Crosshair, Zap, Heart, Flame } from 'lucide-react';

interface BestiaryViewerProps {
  unlockedKills?: Record<string, number>;
}

export const BestiaryViewer: React.FC<BestiaryViewerProps> = ({ unlockedKills = {} }) => {
  const zombieKeys = Object.keys(BESTIARY_DATA) as ZombieType[];
  const [selectedId, setSelectedId] = useState<ZombieType>('walker');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedEntry = BESTIARY_DATA[selectedId];

  // Draw animated monster on the preview canvas
  useEffect(() => {
    let animId: number;
    let frame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      frame += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = selectedEntry.typeCategory === 'boss' ? 42 : 28;
      const bob = Math.sin(frame * 3) * 3;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius + 8, radius * 1.1, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Monster glow aura
      const grad = ctx.createRadialGradient(cx, cy + bob, radius * 0.2, cx, cy + bob, radius * 2);
      grad.addColorStop(0, selectedEntry.iconColor + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Body base
      ctx.fillStyle = selectedEntry.iconColor;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Glowing Eyes
      const eyeOffset = radius * 0.35;
      const eyeR = selectedEntry.typeCategory === 'boss' ? 5 : 3.5;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx - eyeOffset, cy + bob - 4, eyeR, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffset, cy + bob - 4, eyeR, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx - eyeOffset, cy + bob - 4, eyeR * 0.45, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffset, cy + bob - 4, eyeR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Mouth / Fangs
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy + bob + radius * 0.3, radius * 0.4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Claws / Special Features
      if (selectedEntry.typeCategory === 'boss') {
        // Spikes or horns
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(cx - radius * 0.7, cy + bob - radius * 0.6);
        ctx.lineTo(cx - radius * 1.1, cy + bob - radius * 1.3);
        ctx.lineTo(cx - radius * 0.3, cy + bob - radius * 0.9);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + radius * 0.7, cy + bob - radius * 0.6);
        ctx.lineTo(cx + radius * 1.1, cy + bob - radius * 1.3);
        ctx.lineTo(cx + radius * 0.3, cy + bob - radius * 0.9);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedEntry]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Left List of Monsters */}
      <div className="w-full md:w-5/12 flex flex-col gap-1.5 overflow-y-auto max-h-[380px] sm:max-h-[460px] pr-1 custom-scrollbar">
        {zombieKeys.map(key => {
          const entry = BESTIARY_DATA[key];
          const isSelected = selectedId === key;
          const isBoss = entry.typeCategory === 'boss';
          const isElite = entry.typeCategory === 'elite';

          return (
            <button
              key={key}
              onClick={() => setSelectedId(key)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                isSelected 
                  ? 'bg-neutral-800/90 border-red-500 shadow-md scale-[1.01]' 
                  : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0 border border-black/40 shadow"
                  style={{ backgroundColor: entry.iconColor }}
                >
                  <Skull className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    {entry.nameVi}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {isBoss ? '⚠️ TRÙM TẬN THẾ' : isElite ? 'TIỂU ĐỘI TINH ANH' : 'ZOMBIE THÔNG THƯỜNG'}
                  </div>
                </div>
              </div>

              {/* Threat badge */}
              <div className="flex items-center gap-0.5 shrink-0 text-amber-400 text-xs">
                {'★'.repeat(entry.threatLevel)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Detail Card */}
      <div className="w-full md:w-7/12 bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between overflow-y-auto max-h-[460px]">
        <div>
          {/* Top header & Canvas */}
          <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                  selectedEntry.typeCategory === 'boss' 
                    ? 'bg-red-950/80 text-red-400 border-red-700/60' 
                    : selectedEntry.typeCategory === 'elite' 
                    ? 'bg-amber-950/80 text-amber-400 border-amber-700/60' 
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                }`}>
                  {selectedEntry.typeCategory === 'boss' ? 'Trùm Nguy Hiểm Cấp 5' : selectedEntry.typeCategory === 'elite' ? 'Quái Tinh Anh' : 'Quái Phổ Thông'}
                </span>
                <div className="flex text-amber-400 text-xs">
                  {'★'.repeat(selectedEntry.threatLevel)}
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {selectedEntry.nameVi}
              </h3>
            </div>

            {/* Canvas Avatar */}
            <canvas 
              ref={canvasRef} 
              width={100} 
              height={100} 
              className="w-20 h-20 rounded-xl bg-neutral-950/80 border border-neutral-800 shrink-0" 
            />
          </div>

          {/* Lore description */}
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">
            {selectedEntry.descVi}
          </p>

          {/* Attributes Matrix */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-neutral-950/70 border border-neutral-800 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-red-400 font-bold mb-0.5">
                <Heart className="w-3 h-3" /> Máu Gốc
              </div>
              <div className="text-xs sm:text-sm font-black text-white font-mono">
                {selectedEntry.baseHp}
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold mb-0.5">
                <Zap className="w-3 h-3" /> Tốc Độ
              </div>
              <div className="text-xs sm:text-sm font-black text-white font-mono">
                {selectedEntry.baseSpeed.toFixed(1)}x
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400 font-bold mb-0.5">
                <Flame className="w-3 h-3" /> Đòn Đánh
              </div>
              <div className="text-xs sm:text-sm font-black text-white font-mono">
                {selectedEntry.baseDamage} DMG
              </div>
            </div>
          </div>

          {/* Tactics & Weakness */}
          <div className="space-y-2 mb-2">
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Điểm Yếu Tác Chiến:
              </div>
              <div className="text-xs text-neutral-300">
                {selectedEntry.weaknessVi}
              </div>
            </div>

            <div className="bg-sky-950/30 border border-sky-900/50 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1">
                <Crosshair className="w-3.5 h-3.5 shrink-0" />
                Vũ Khí Khắc Chế Khuyên Dùng:
              </div>
              <div className="text-xs text-neutral-300 font-bold">
                {selectedEntry.recommendedWeaponVi}
              </div>
            </div>
          </div>
        </div>

        {/* Footer special ability */}
        <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <span className="truncate">Kỹ năng: <strong className="text-white">{selectedEntry.specialAbilityVi}</strong></span>
        </div>
      </div>
    </div>
  );
};
