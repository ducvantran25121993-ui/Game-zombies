import React from 'react';
import { RoguelikeSkill } from '../types/game';
import { 
  CornerUpRight, Bomb, Zap, Snowflake, HeartPulse, 
  Flame, ChevronsUp, Activity, ShieldAlert, Sparkles, Star, Dog,
  Coins, Crown, Crosshair, ShieldCheck, Gauge, ChevronRight
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SkillDraftModalProps {
  skills: RoguelikeSkill[];
  currentSkills: Record<string, number>;
  playerLevel: number;
  onSelectSkill: (skill: RoguelikeSkill) => void;
}

const RARITY_THEMES = {
  legendary: {
    name: 'HUYỀN THOẠI',
    border: 'border-amber-400/80 hover:border-amber-300',
    bg: 'bg-gradient-to-br from-amber-950/40 via-zinc-900/95 to-zinc-950',
    shadow: 'shadow-[0_0_16px_rgba(245,158,11,0.2)] hover:shadow-[0_0_24px_rgba(245,158,11,0.38)]',
    topLine: 'bg-gradient-to-r from-transparent via-amber-400 to-transparent',
    tag: 'bg-amber-500/25 text-amber-300 border-amber-400/60',
    iconBorder: 'border-amber-400/90',
    iconBg: 'bg-gradient-to-br from-amber-500/25 to-amber-950/70',
    glowBg: 'bg-amber-400',
    btnStyle: 'bg-amber-500/20 border border-amber-400/60 text-amber-300 group-hover:bg-amber-400 group-hover:text-black group-hover:border-amber-300 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]'
  },
  rare: {
    name: 'HIẾM',
    border: 'border-purple-400/80 hover:border-purple-300',
    bg: 'bg-gradient-to-br from-purple-950/40 via-zinc-900/95 to-zinc-950',
    shadow: 'shadow-[0_0_16px_rgba(168,85,247,0.2)] hover:shadow-[0_0_24px_rgba(168,85,247,0.38)]',
    topLine: 'bg-gradient-to-r from-transparent via-purple-400 to-transparent',
    tag: 'bg-purple-500/25 text-purple-300 border-purple-400/60',
    iconBorder: 'border-purple-400/90',
    iconBg: 'bg-gradient-to-br from-purple-500/25 to-purple-950/70',
    glowBg: 'bg-purple-400',
    btnStyle: 'bg-purple-500/20 border border-purple-400/60 text-purple-300 group-hover:bg-purple-400 group-hover:text-black group-hover:border-purple-300 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.5)]'
  },
  common: {
    name: 'PHỔ BIẾN',
    border: 'border-cyan-400/70 hover:border-cyan-300',
    bg: 'bg-gradient-to-br from-cyan-950/40 via-zinc-900/95 to-zinc-950',
    shadow: 'shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:shadow-[0_0_22px_rgba(6,182,212,0.32)]',
    topLine: 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent',
    tag: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60',
    iconBorder: 'border-cyan-400/90',
    iconBg: 'bg-gradient-to-br from-cyan-500/25 to-cyan-950/70',
    glowBg: 'bg-cyan-400',
    btnStyle: 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-cyan-300 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.5)]'
  }
};

const getSkillIcon = (id: string) => {
  switch (id) {
    case 'midas_jackpot':
      return <Coins className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    case 'gold_millionaire':
      return <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.7)]" />;
    case 'orbital_laser':
      return <Crosshair className="w-6 h-6 sm:w-7 sm:h-7 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />;
    case 'titan_berserk':
      return <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />;
    case 'infinite_overdrive':
      return <Gauge className="w-6 h-6 sm:w-7 sm:h-7 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" />;
    case 'k9_war_dog':
      return <Dog className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    case 'chain_lightning':
      return <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.6)]" />;
    case 'adrenaline_rush':
      return <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />;
    case 'explosive_rounds':
      return <Bomb className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    case 'ricochet':
      return <CornerUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />;
    case 'frost_aura':
      return <Snowflake className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]" />;
    case 'vampiric_leech':
      return <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />;
    case 'fire_aura':
      return <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />;
    case 'twin_shot':
      return <ChevronsUp className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />;
    case 'shockwave_armor':
      return <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.6)]" />;
    default:
      return <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />;
  }
};

const getSkillDescription = (skill: RoguelikeSkill, currentLvl: number) => {
  if (skill.id === 'k9_war_dog') {
    if (currentLvl === 0) return '🐕 Triệu hồi K-9 tự động cắn quái (90 ST), tha ngọc EXP & Đạn về cho bạn.';
    if (currentLvl === 1) return '🛡️ K-9 Bọc Thép: +50% tốc độ, cắn lan 2 quái (160 ST), sủa làm chậm quái 35%.';
    return '⚡ Cyber-Hound Tận Thế: Chó máy giật sét chuỗi (240 ST), gom ngọc EXP tầm xa siêu tốc.';
  }
  return skill.descVi;
};

export const SkillDraftModal: React.FC<SkillDraftModalProps> = ({
  skills,
  currentSkills,
  playerLevel,
  onSelectSkill
}) => {
  const handlePick = (skill: RoguelikeSkill) => {
    soundManager.playPowerUp();
    onSelectSkill(skill);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[96vh] sm:max-h-[92vh] overflow-y-auto bg-gradient-to-b from-zinc-900/98 via-zinc-950/98 to-black/98 border-2 border-amber-500/50 rounded-2xl p-3 sm:p-5 landscape:p-2.5 shadow-2xl flex flex-col items-center relative">
        {/* Top Glow Ambient Light */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-24 bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.8)]" />

        {/* Level Banner */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10.5px] sm:text-xs font-black uppercase tracking-wider mb-1 landscape:mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>CHIẾN BINH THĂNG CẤP • LEVEL {playerLevel}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Modal Title */}
        <h2 className="text-base sm:text-2xl landscape:text-lg font-black text-white tracking-wide uppercase text-center mb-0.5">
          CHỌN 1 THẺ KỸ NĂNG ĐỈNH CAO
        </h2>
        <p className="text-[10px] sm:text-xs landscape:text-[10px] text-zinc-400 text-center max-w-md mb-2 sm:mb-3.5 landscape:mb-1.5">
          Kỹ năng sẽ lập tức có hiệu lực và kết hợp trực tiếp với hỏa lực hiện tại!
        </p>

        {/* 3 Skill Cards - Sleek Responsive Grid: Horizontal Compact Cards on Mobile, 3-Columns on Desktop/Landscape */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 landscape:grid landscape:grid-cols-3 gap-2 sm:gap-3 landscape:gap-2 w-full">
          {skills.map((skill) => {
            const currentLvl = currentSkills[skill.id] || 0;
            const nextLvl = currentLvl + 1;
            const isNew = currentLvl === 0;
            const rarityTheme = RARITY_THEMES[skill.rarity] || RARITY_THEMES.common;
            const skillDesc = getSkillDescription(skill, currentLvl);

            return (
              <button
                key={skill.id}
                onClick={() => handlePick(skill)}
                className={`group relative w-full rounded-xl border-2 transition-all duration-150 cursor-pointer overflow-hidden text-left
                  ${rarityTheme.border} ${rarityTheme.bg} ${rarityTheme.shadow}
                  hover:scale-[1.01] sm:hover:scale-[1.03] active:scale-[0.98]
                  flex flex-row sm:flex-col landscape:flex-col items-center sm:items-stretch landscape:items-stretch
                  p-2.5 sm:p-3.5 landscape:p-2
                `}
              >
                {/* Glowing Top Hairline */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${rarityTheme.topLine}`} />

                {/* DESKTOP / LANDSCAPE TOP HEADER */}
                <div className="hidden sm:flex landscape:flex items-center justify-between w-full mb-2 landscape:mb-1">
                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border tracking-wider ${rarityTheme.tag}`}>
                    {rarityTheme.name}
                  </span>
                  {isNew ? (
                    <span className="text-[10.5px] font-black text-emerald-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-emerald-400" /> MỚI
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-bold text-amber-300">
                      CẤP {currentLvl} ➔ {nextLvl}
                    </span>
                  )}
                </div>

                {/* ICON BOX */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <div 
                    className={`w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 rounded-xl border-2 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${rarityTheme.iconBorder} ${rarityTheme.iconBg}`}
                  >
                    <div className={`absolute inset-0 rounded-xl blur-md opacity-35 ${rarityTheme.glowBg}`} />
                    <div className="relative z-10">
                      {getSkillIcon(skill.id)}
                    </div>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 min-w-0 px-2.5 sm:px-0 sm:mt-2.5 landscape:mt-1 flex flex-col justify-center sm:items-center landscape:items-center sm:text-center landscape:text-center">
                  {/* Mobile Rarity & Level Badges */}
                  <div className="flex sm:hidden landscape:hidden items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border tracking-wider ${rarityTheme.tag}`}>
                      {rarityTheme.name}
                    </span>
                    {isNew ? (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" /> MỚI
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/35">
                        CẤP {currentLvl} ➔ {nextLvl}
                      </span>
                    )}
                  </div>

                  {/* Skill Title */}
                  <h3 className="text-xs sm:text-sm landscape:text-xs font-black text-white group-hover:text-amber-300 transition-colors leading-snug truncate sm:whitespace-normal landscape:truncate w-full">
                    {skill.nameVi}
                  </h3>

                  {/* Description */}
                  <p className="text-[10px] sm:text-[11px] landscape:text-[9.5px] text-zinc-300 leading-snug mt-0.5 line-clamp-2 sm:line-clamp-3 sm:min-h-[36px] landscape:min-h-0">
                    {skillDesc}
                  </p>
                </div>

                {/* ACTION BUTTON - Compact Pill on Mobile, Full Width on Desktop */}
                <div className={`shrink-0 ml-1.5 flex items-center justify-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black tracking-wider transition-all sm:hidden landscape:hidden ${rarityTheme.btnStyle}`}>
                  <span>CHỌN</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className={`hidden sm:flex landscape:flex w-full py-1.5 rounded-lg text-xs font-black tracking-wider transition-all items-center justify-center gap-1 mt-2.5 landscape:mt-1 ${rarityTheme.btnStyle}`}>
                  <span>CHỌN KỸ NĂNG</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

