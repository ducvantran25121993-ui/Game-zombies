import React, { useState, useEffect } from 'react';
import { HighScoreRecord, GameDifficulty } from '../types/game';
import { Skull, RotateCcw, Trophy, Award, DollarSign, Target, Check, Share2, UserCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { WARRIOR_CLASSES } from '../data/warriors';

interface GameOverModalProps {
  score: number;
  kills: number;
  wave: number;
  goldEarned: number;
  difficulty: GameDifficulty;
  onRestart: () => void;
  onGoHome: () => void;
  warriorSkin?: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  kills,
  wave,
  goldEarned,
  difficulty,
  onRestart,
  onGoHome,
  warriorSkin = 'commando'
}) => {
  const warrior = WARRIOR_CLASSES.find(w => w.id === warriorSkin) || WARRIOR_CLASSES[0];
  const [playerName, setPlayerName] = useState(warrior.nameVi);
  const [isSaved, setIsSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<HighScoreRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zombie_high_scores');
      if (saved) {
        setLeaderboard(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveScore = () => {
    if (!playerName.trim() || isSaved) return;
    const newRecord: HighScoreRecord = {
      name: playerName.trim(),
      score,
      kills,
      wave,
      date: new Date().toLocaleDateString('vi-VN'),
      difficulty
    };

    const updated = [...leaderboard, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updated);
    setIsSaved(true);
    try {
      localStorage.setItem('zombie_high_scores', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-lg">
      <div className="bg-neutral-900 border-2 border-red-950/80 rounded-3xl w-full max-w-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        
        {/* Skull Icon */}
        <div className="p-4 bg-red-600/10 border-2 border-red-500/40 rounded-3xl text-red-500 shadow-2xl animate-bounce mb-2">
          <Skull className="w-10 h-10" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-500 tracking-wider">
          BẠN ĐÃ HY SINH!
        </h2>
        <p className="text-xs md:text-sm text-neutral-400 mt-1">
          Hành trình chống lại đại dịch kết thúc ở Đợt {wave}. Hãy tiếp tục chiến đấu để phá vỡ kỷ lục!
        </p>

        {/* Warrior In Memoriam Avatar & Honors */}
        <div className="flex items-center gap-3 bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 my-4 text-left w-full">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-500/70 shrink-0 shadow-md">
            <img 
              src={warrior.avatar} 
              alt={warrior.nameVi}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-red-950/40" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{warrior.nameVi}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-neutral-800 text-amber-400 border border-amber-500/30">
                {warrior.codename}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{warrior.titleVi} • Tác chiến kiên cường tới phút cuối cùng</p>
          </div>
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full my-6">
          <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">ĐIỂM SỐ</span>
            <span className="text-xl md:text-2xl font-black text-white font-mono mt-0.5">{score}</span>
          </div>

          <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">SỐ QUÁI DIỆT</span>
            <span className="text-xl md:text-2xl font-black text-red-400 font-mono mt-0.5">{kills}</span>
          </div>

          <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">ĐỢT VƯỢT QUA</span>
            <span className="text-xl md:text-2xl font-black text-amber-400 font-mono mt-0.5">{wave}</span>
          </div>

          <div className="bg-neutral-950/80 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">VÀNG THU THẬP</span>
            <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono mt-0.5">{goldEarned}</span>
          </div>
        </div>

        {/* SAVE SCORE FORM */}
        {!isSaved ? (
          <div className="w-full bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center gap-2 mb-6">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              maxLength={20}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 w-full"
            />
            <button
              onClick={handleSaveScore}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Trophy className="w-4 h-4" /> LƯU KỶ LỤC
            </button>
          </div>
        ) : (
          <div className="w-full bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-2xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 mb-6">
            <Check className="w-4 h-4" /> Đã lưu thành tích vào Bảng Xếp Hạng!
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onGoHome}
            className="flex-1 py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all"
          >
            TRANG CHỦ
          </button>
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              onRestart();
            }}
            className="flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" /> CHƠI LẠI NGAY
          </button>
        </div>

      </div>
    </div>
  );
};
