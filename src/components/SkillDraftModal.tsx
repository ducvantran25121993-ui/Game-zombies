import React from 'react';
import { RoguelikeSkill } from '../types/game';
import { 
  CornerUpRight, Bomb, Zap, Snowflake, HeartPulse, 
  Flame, ChevronsUp, Activity, ShieldAlert, Sparkles, Star
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SkillDraftModalProps {
  skills: RoguelikeSkill[];
  currentSkills: Record<string, number>;
  playerLevel: number;
  onSelectSkill: (skill: RoguelikeSkill) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  CornerUpRight: <CornerUpRight className="w-8 h-8" />,
  Bomb: <Bomb className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  Snowflake: <Snowflake className="w-8 h-8" />,
  HeartPulse: <HeartPulse className="w-8 h-8" />,
  Flame: <Flame className="w-8 h-8" />,
  ChevronsUp: <ChevronsUp className="w-8 h-8" />,
  Activity: <Activity className="w-8 h-8" />,
  ShieldAlert: <ShieldAlert className="w-8 h-8" />
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950/95 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-amber-400">
            CHIẾN BINH THĂNG CẤP • LEVEL {playerLevel}
          </span>
          <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white tracking-wider mb-2">
          CHỌN 1 KỸ NĂNG SINH TỒN
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6">
          Kỹ năng sẽ lập tức có hiệu lực và kết hợp trực tiếp với hỏa lực hiện tại của bạn!
        </p>

        {/* 3 Skill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
          {skills.map((skill) => {
            const currentLvl = currentSkills[skill.id] || 0;
            const nextLvl = currentLvl + 1;
            const isNew = currentLvl === 0;

            const rarityBorder = 
              skill.rarity === 'legendary' ? 'border-amber-400 bg-amber-950/30 shadow-amber-500/20' :
              skill.rarity === 'rare' ? 'border-purple-400 bg-purple-950/30 shadow-purple-500/20' :
              'border-cyan-400 bg-cyan-950/30 shadow-cyan-500/20';

            const rarityTag = 
              skill.rarity === 'legendary' ? 'bg-amber-500/25 text-amber-300 border-amber-500/50' :
              skill.rarity === 'rare' ? 'bg-purple-500/25 text-purple-300 border-purple-500/50' :
              'bg-cyan-500/25 text-cyan-300 border-cyan-500/50';

            const rarityName = 
              skill.rarity === 'legendary' ? 'HUYỀN THOẠI' :
              skill.rarity === 'rare' ? 'HIẾM' : 'PHỔ BIẾN';

            return (
              <button
                key={skill.id}
                onClick={() => handlePick(skill)}
                className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 active:scale-95 shadow-lg text-left ${rarityBorder}`}
              >
                {/* Top Rarity Badge */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wider ${rarityTag}`}>
                    {rarityName}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                    {isNew ? (
                      <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-400" /> MỚI
                      </span>
                    ) : (
                      <span className="text-amber-300">CẤP {currentLvl} ➔ {nextLvl}</span>
                    )}
                  </div>
                </div>

                {/* Skill Icon Circle */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-110 shadow-md"
                  style={{ backgroundColor: `${skill.color}25`, borderColor: skill.color, borderWidth: 2 }}
                >
                  {ICON_MAP[skill.icon] || <Zap className="w-8 h-8" />}
                </div>

                {/* Skill Title */}
                <h3 className="text-base sm:text-lg font-black text-white text-center mb-2 tracking-wide group-hover:text-amber-300 transition-colors">
                  {skill.nameVi}
                </h3>

                {/* Skill Description */}
                <p className="text-xs text-zinc-300 text-center leading-relaxed mb-4 min-h-[48px]">
                  {skill.descVi}
                </p>

                {/* Action button look */}
                <div className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-center text-xs font-black text-white tracking-wider group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-colors">
                  CHỌN KỸ NĂNG
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
