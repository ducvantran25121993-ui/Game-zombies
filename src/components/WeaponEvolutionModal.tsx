import React from 'react';
import { WeaponEvolutionConfig } from '../types/game';
import { Zap, Sparkles, Check, Flame, ShieldAlert } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WeaponEvolutionModalProps {
  evolution: WeaponEvolutionConfig;
  onClose: () => void;
}

export const WeaponEvolutionModal: React.FC<WeaponEvolutionModalProps> = ({
  evolution,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-950 border-2 rounded-2xl w-full max-w-md p-5 sm:p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden animate-scale-up"
        style={{ borderColor: evolution.bulletColor }}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -inset-10 opacity-25 blur-3xl pointer-events-none rounded-full"
          style={{ backgroundColor: evolution.bulletColor }}
        />

        {/* Header Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-black/60 text-xs font-black uppercase mb-3"
          style={{ borderColor: evolution.bulletColor, color: evolution.bulletColor }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          TIẾN HÓA THẦN KHÍ THÀNH CÔNG!
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase mb-1">
          {evolution.evolvedNameVi}
        </h2>
        <div className="text-xs text-neutral-400 mb-4 font-mono">
          {evolution.evolvedTitleVi}
        </div>

        {/* Central Weapon Icon & Hologram Box */}
        <div 
          className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center mb-4 relative shadow-lg"
          style={{ borderColor: evolution.bulletColor, backgroundColor: `${evolution.bulletColor}15` }}
        >
          <Zap className="w-12 h-12" style={{ color: evolution.bulletColor }} />
          <span className="absolute -bottom-2 px-2 py-0.5 rounded bg-black border text-[9px] font-black uppercase text-white font-mono"
            style={{ borderColor: evolution.bulletColor }}
          >
            EVOLVED S-TIER
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4 px-2">
          {evolution.descVi}
        </p>

        {/* Stat Highlights */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 mb-5 text-left space-y-1.5">
          <div className="text-[11px] font-black uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Đặc Tính Siêu Cấp Mới:
          </div>
          {evolution.bonusDescVi.map((bonus, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-white">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{bonus}</span>
            </div>
          ))}
        </div>

        {/* Claim / Equip Button */}
        <button
          onClick={() => {
            soundManager.playEmptyClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl font-black text-sm text-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${evolution.bulletColor}, #ffffff)`
          }}
        >
          <Zap className="w-4 h-4 text-black" />
          KÍCH HOẠT HỎA LỰC NGAY
        </button>
      </div>
    </div>
  );
};
