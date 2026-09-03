import React, { useState } from 'react';
import { Mission, GameRecordStats } from '../types/game';
import { 
  Award, CheckCircle2, ChevronRight, DollarSign, 
  Flame, Skull, Trophy, X, Zap, Target, Crosshair, Shield, Sparkles 
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaimReward: (missionId: string) => void;
  recordStats: GameRecordStats;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaimReward,
  recordStats
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'records'>('missions');

  if (!isOpen) return null;

  const completedUnclaimedCount = missions.filter(m => m.completed && !m.claimed).length;

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-sky-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Skull': return <Skull className="w-5 h-5 text-red-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-indigo-400" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-emerald-400" />;
      default: return <Award className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                THÀNH TÍCH & KỶ LỤC CHIẾN BĂNG
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Hoàn thành nhiệm vụ chiến trường để nhận thưởng Vàng quý giá
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950 px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-4 py-2 text-xs sm:text-sm font-black uppercase rounded-t-xl transition-all relative ${
              activeTab === 'missions'
                ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-500'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>NHIỆM VỤ ({missions.filter(m => m.completed).length}/{missions.length})</span>
            {completedUnclaimedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-600 text-[9px] text-white font-bold animate-pulse">
                {completedUnclaimedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-xs sm:text-sm font-black uppercase rounded-t-xl transition-all relative ${
              activeTab === 'records'
                ? 'bg-neutral-900 text-sky-400 border-t-2 border-sky-500'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>KỶ LỤC CÁ NHÂN</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {activeTab === 'missions' ? (
            missions.map(m => {
              const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    m.claimed
                      ? 'bg-neutral-900/40 border-neutral-800/50 opacity-60'
                      : m.completed
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                      {getMissionIcon(m.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black text-white">{m.titleVi}</h4>
                        {m.claimed && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ĐÃ NHẬN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">{m.descVi}</p>

                      {/* Progress bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-32 sm:w-44 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              m.completed ? 'bg-amber-400' : 'bg-sky-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400">
                          {m.current} / {m.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800/80">
                    <div className="flex items-center gap-1 font-black text-amber-400 text-xs sm:text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{m.rewardGold} Vàng</span>
                    </div>

                    {m.completed && !m.claimed ? (
                      <button
                        onClick={() => onClaimReward(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/30 flex items-center gap-1 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>NHẬN</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-500 font-mono">
                        {m.claimed ? 'HOÀN THÀNH' : `${progressPct}%`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ĐIỂM KỶ LỤC</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
                  {recordStats.highScore.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ĐỢT CAO NHẤT</span>
                <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">
                  Wave {recordStats.maxWave}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TỔNG MẠNG DIỆT</span>
                <span className="text-xl sm:text-2xl font-black text-red-400 font-mono mt-1">
                  {recordStats.totalKills.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TRÙM ĐÃ HẠ</span>
                <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1">
                  {recordStats.totalBossKills}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">VÀNG ĐÃ THU THẬP</span>
                <span className="text-xl sm:text-2xl font-black text-yellow-300 font-mono mt-1">
                  {recordStats.totalGoldEarned.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">TUYỆT KỸ ĐÃ TRIỂN KHAI</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                  {recordStats.ultimatesCast}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Tiến độ và Kỷ lục được tự động lưu vào bộ nhớ máy</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
