import React, { useState } from 'react';
import { Achievement } from '../types/game';
import { 
  Trophy, Award, CheckCircle2, DollarSign, 
  Flame, Skull, Crosshair, Shield, Zap, Snowflake, 
  Orbit, Wrench, Coins, Crown, Target
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AchievementsViewerProps {
  achievements: Achievement[];
  onClaimAchievement: (achievementId: string) => void;
}

export const AchievementsViewer: React.FC<AchievementsViewerProps> = ({
  achievements,
  onClaimAchievement
}) => {
  const [filter, setFilter] = useState<'all' | 'combat' | 'boss' | 'survival' | 'arsenal'>('all');

  const filtered = achievements.filter(a => filter === 'all' || a.category === filter);
  const totalCompleted = achievements.filter(a => a.completed).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-4 h-4 text-rose-400" />;
      case 'Skull': return <Skull className="w-4 h-4 text-red-500" />;
      case 'Crosshair': return <Crosshair className="w-4 h-4 text-sky-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'Award': return <Award className="w-4 h-4 text-purple-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Crown': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-cyan-300" />;
      case 'Orbit': return <Orbit className="w-4 h-4 text-violet-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-teal-400" />;
      case 'Coins': return <Coins className="w-4 h-4 text-yellow-500" />;
      default: return <Trophy className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Overview Progress Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              Tiến Độ Mở Khóa Danh Hiệu
            </div>
            <div className="text-[11px] text-neutral-400">
              Đã hoàn thành <strong className="text-amber-400">{totalCompleted}</strong> / {achievements.length} Thành tựu
            </div>
          </div>
        </div>

        <div className="w-28 sm:w-36 flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            {Math.round((totalCompleted / (achievements.length || 1)) * 100)}%
          </span>
          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
              style={{ width: `${(totalCompleted / (achievements.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'Tất Cả' },
          { id: 'combat', label: 'Chiến Đấu' },
          { id: 'boss', label: 'Săn Trùm' },
          { id: 'survival', label: 'Sinh Tồn' },
          { id: 'arsenal', label: 'Kho Vũ Khí' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playEmptyClick();
              setFilter(tab.id as any);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 text-xs ${
              filter === tab.id
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievement Cards List */}
      <div className="space-y-2 overflow-y-auto max-h-[380px] sm:max-h-[420px] pr-1 custom-scrollbar">
        {filtered.map(item => {
          const percent = Math.min(100, Math.round((item.progress / item.maxProgress) * 100));

          return (
            <div 
              key={item.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                item.completed && !item.claimed
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                  : item.claimed
                  ? 'bg-neutral-950/60 border-neutral-800/80 opacity-70'
                  : 'bg-neutral-900/50 border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  item.completed 
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-400' 
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                }`}>
                  {getIcon(item.icon)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.titleVi}
                    </span>
                    {item.completed && !item.claimed && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-black animate-bounce">
                        SẴN SÀNG
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {item.descVi}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2 w-full sm:max-w-xs">
                    <div className="h-1.5 flex-1 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          item.completed ? 'bg-amber-400' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold shrink-0">
                      {item.progress}/{item.maxProgress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reward and Claim Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/50">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-yellow-400 bg-neutral-950/80 px-2 py-1 rounded-lg border border-neutral-800">
                  <DollarSign className="w-3.5 h-3.5 text-yellow-500" />
                  +{item.rewardGold}
                </div>

                {item.claimed ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-3 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã Nhận
                  </div>
                ) : item.completed ? (
                  <button
                    onClick={() => {
                      soundManager.playMissionComplete();
                      onClaimAchievement(item.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all shadow-md active:scale-95 animate-pulse"
                  >
                    NHẬN THƯỞNG
                  </button>
                ) : (
                  <div className="text-[11px] text-neutral-500 font-bold px-2 py-1">
                    Chưa Đạt
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
