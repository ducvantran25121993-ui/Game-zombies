import React, { useState, useEffect } from 'react';
import { GameDifficulty, GameMode, HighScoreRecord, MapEnvironmentId } from '../types/game';
import { 
  Skull, Play, Trophy, Shield, Zap, Crosshair, 
  Flame, HelpCircle, Radio, Award, ChevronRight, Check,
  UserCheck, Sparkles, Heart, Footprints, MapPin, Building2,
  Biohazard, AlertTriangle, Ghost, SunMedium, Cpu, Layers
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { WARRIOR_CLASSES, WARRIOR_HERO_BANNER, WarriorClass } from '../data/warriors';
import { MAP_ENVIRONMENTS } from '../data/maps';

interface StartScreenProps {
  onStartGame: (difficulty: GameDifficulty, mode: GameMode, warriorId: string, mapId: MapEnvironmentId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedWarriorId: string;
  onSelectWarrior: (id: string) => void;
  selectedMapId: MapEnvironmentId;
  onSelectMap: (id: MapEnvironmentId) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  selectedWarriorId,
  onSelectWarrior,
  selectedMapId,
  onSelectMap
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [mode, setMode] = useState<GameMode>('survival');
  const [activeTab, setActiveTab] = useState<'play' | 'warriors' | 'maps' | 'leaderboard' | 'guide'>('play');
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

  const activeWarrior = WARRIOR_CLASSES.find(w => w.id === selectedWarriorId) || WARRIOR_CLASSES[0];
  const activeMap = MAP_ENVIRONMENTS.find(m => m.id === selectedMapId) || MAP_ENVIRONMENTS[0];

  return (
    <div className="relative w-full h-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-3 md:p-6 overflow-x-hidden text-neutral-200 select-none">
      
      {/* BACKGROUND ATMOSPHERIC GLOW & PARTICLES */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.14)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* TOP HEADER CONTROLS */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={onToggleMute}
          className="p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 backdrop-blur-md transition-all shadow-xl flex items-center gap-2 text-xs font-bold"
        >
          <Radio className={`w-4 h-4 ${isMuted ? 'text-neutral-500' : 'text-emerald-400 animate-pulse'}`} />
          <span>{isMuted ? 'Âm thanh: TẮT' : 'Âm thanh: BẬT'}</span>
        </button>
      </div>

      {/* MAIN CONTAINER CARD */}
      <div className="relative z-10 w-full max-w-4xl max-h-[96vh] landscape:max-h-[92vh] overflow-y-auto bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 sm:p-5 md:p-8 landscape:p-4 shadow-2xl backdrop-blur-xl flex flex-col items-center my-auto">
        
        {/* HERO BANNER SECTION WITH EPIC WARRIOR GRAPHICS */}
        <div className="relative w-full h-28 sm:h-36 md:h-48 landscape:h-28 rounded-2xl overflow-hidden border border-neutral-800 mb-4 sm:mb-6 landscape:mb-3 shadow-inner group">
          <img 
            src={WARRIOR_HERO_BANNER} 
            alt="Zombie Apocalypse Warrior Hero" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex flex-col justify-end p-3 sm:p-4 md:p-6 landscape:p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase shadow-md">
                TACTICAL SPEC-OPS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900/80 text-[9px] sm:text-[10px] font-bold text-amber-400 border border-amber-500/30">
                SURVIVOR CORPS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl landscape:text-2xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-amber-400 drop-shadow-[0_2px_12px_rgba(239,68,68,0.4)]">
              ZOMBIE APOCALYPSE
            </h1>
            <p className="text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-wider text-neutral-300">
              SURVIVAL STRIKE • CHIẾN DỊCH DIỆT QUÁI SINH TỒN
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex w-full border-b border-neutral-800 mb-4 sm:mb-6 landscape:mb-3 gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'play'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Play className="w-4 h-4" /> XUẤT TRẬN
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'maps'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <MapPin className="w-4 h-4" /> BỐI CẢNH ({MAP_ENVIRONMENTS.length})
          </button>
          <button
            onClick={() => setActiveTab('warriors')}
            className={`flex-1 min-w-[125px] py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'warriors'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" /> CHIẾN BINH ({WARRIOR_CLASSES.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <Trophy className="w-4 h-4" /> KỶ LỤC
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> CÁCH CHƠI
          </button>
        </div>

        {/* TAB 1: PLAY CONFIGURATION & ACTIVE WARRIOR SUMMARY */}
        {activeTab === 'play' && (
          <div className="w-full space-y-5">
            {/* DUAL PREVIEW SUMMARY CARDS: WARRIOR & BATTLEFIELD ENVIRONMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* CURRENT SELECTED WARRIOR CARD */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg shrink-0">
                    <img 
                      src={activeWarrior.avatar} 
                      alt={activeWarrior.nameVi}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 px-1 py-0.2 bg-amber-500 text-[8px] font-black text-neutral-950 rounded-tl">
                      {activeWarrior.codename}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm">{activeWarrior.nameVi}</h3>
                    </div>
                    <span className="text-[10px] text-sky-400 font-semibold block">
                      {activeWarrior.titleVi}
                    </span>
                    <p className="text-[11px] text-amber-400/90 font-medium">
                      ✨ {activeWarrior.bonusDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('warriors')}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all border border-neutral-700 shrink-0"
                >
                  Đổi
                </button>
              </div>

              {/* CURRENT SELECTED MAP ENVIRONMENT CARD */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border-2 border-sky-500/60 shadow-lg flex flex-col items-center justify-center shrink-0">
                    {selectedMapId === 'rooftop' && <Building2 className="w-7 h-7 text-sky-400" />}
                    {selectedMapId === 'street' && <Crosshair className="w-7 h-7 text-amber-400" />}
                    {selectedMapId === 'bunker' && <Biohazard className="w-7 h-7 text-emerald-400" />}
                    {selectedMapId === 'hospital' && <Skull className="w-7 h-7 text-rose-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm">{activeMap.nameVi}</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-500/30">
                        {activeMap.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {activeMap.subtitleVi}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('maps')}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all border border-neutral-700 shrink-0"
                >
                  Đổi
                </button>
              </div>
            </div>

            {/* QUICK BATTLEFIELD ENVIRONMENT PICKER */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> CHỌN BỐI CẢNH CHIẾN TRƯỜNG:
                </label>
                <span className="text-[11px] text-neutral-500">Đầy đủ họa tiết, không để lộ mảng đen viền</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {MAP_ENVIRONMENTS.map((map) => {
                  const isSelected = selectedMapId === map.id;
                  return (
                    <button
                      key={map.id}
                      type="button"
                      onClick={() => onSelectMap(map.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-neutral-800 border-sky-400 text-white shadow-lg shadow-sky-500/20'
                          : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{map.nameVi}</span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
                      </div>
                      <span className="text-[10px] text-sky-300/80 block mt-1 line-clamp-1">{map.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GAME MODE SELECTION */}
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                CHẾ ĐỘ CHƠI:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('survival')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    mode === 'survival'
                      ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-500/10'
                      : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span className="flex items-center gap-1.5">
                      <Skull className="w-4 h-4 text-red-500" /> Từng Đợt Sinh Tồn
                    </span>
                    {mode === 'survival' && <Check className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Chiến đấu qua từng Wave, đối đầu Trùm Đột Biến mỗi 5 Wave và nâng cấp kho vũ khí.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('endless')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    mode === 'endless'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm text-white">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" /> Cơn Ác Mộng Vô Tận
                    </span>
                    {mode === 'endless' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Zombie tràn ngập liên tục không ngừng nghỉ. Thử thách giới hạn sinh tồn của bạn!
                  </p>
                </button>
              </div>
            </div>

            {/* DIFFICULTY SELECTION */}
            <div>
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                ĐỘ KHÓ CHIẾN TRƯỜNG:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'easy' as GameDifficulty, label: 'Dễ (Tân Binh)', desc: 'Máu quái -30%, rơi vàng nhiều', color: 'emerald' },
                  { id: 'normal' as GameDifficulty, label: 'Tiêu Chuẩn', desc: 'Trải nghiệm cân bằng nhất', color: 'amber' },
                  { id: 'hard' as GameDifficulty, label: 'Kỳ Cựu (Khó)', desc: 'Quái nhanh và đông hơn', color: 'rose' },
                  { id: 'nightmare' as GameDifficulty, label: 'Ác Mộng (Cực Khó)', desc: 'Sát thương quái x2, quái bạo nộ', color: 'red' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      difficulty === item.id
                        ? 'bg-neutral-800 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white flex items-center justify-between">
                      <span>{item.label}</span>
                      {difficulty === item.id && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* START BUTTON */}
            <button
              onClick={() => {
                soundManager.playEmptyClick();
                soundManager.startMusic();
                onStartGame(difficulty, mode, selectedWarriorId, selectedMapId);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base uppercase tracking-widest shadow-2xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 group"
            >
              <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              XUẤT TRẬN: {activeWarrior.nameVi.toUpperCase()} @ {activeMap.nameVi.toUpperCase()}
            </button>
          </div>
        )}

        {/* TAB 2: DETAILED MAP ENVIRONMENT SELECTOR */}
        {activeTab === 'maps' && (
          <div className="w-full space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" /> 8 BỐI CẢNH CHIẾN TRƯỜNG & KHÔNG GIAN
              </h3>
              <p className="text-xs text-neutral-400">Chọn bối cảnh xuất phát điểm — qua mỗi vòng bối cảnh sẽ tự động chuyển đổi sang vùng đất mới!</p>
            </div>

            {/* Dynamic Map Rotation Announcement Banner */}
            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center gap-3 text-xs text-sky-200">
              <div className="p-2 rounded-xl bg-sky-900/60 border border-sky-400/40 text-sky-300 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sky-300 font-bold block">TỰ ĐỘNG CHUYỂN ĐỔI BỐI CẢNH MỖI VÒNG:</strong>
                Sau khi vượt qua mỗi đợt sóng Zombie & Boss, toàn bộ không gian bản đồ và chướng ngại vật sẽ xoay vòng sang bối cảnh tiếp theo theo chu trình 8 chiến trường!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MAP_ENVIRONMENTS.map((map) => {
                const isSelected = selectedMapId === map.id;
                return (
                  <div
                    key={map.id}
                    onClick={() => onSelectMap(map.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-800/90 border-sky-400 shadow-xl shadow-sky-500/10 ring-2 ring-sky-400/40'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div>
                      {/* Map Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="p-2.5 rounded-xl bg-neutral-900 border"
                            style={{ borderColor: `${map.themeColor}60` }}
                          >
                            {map.id === 'rooftop' && <Building2 className="w-6 h-6 text-sky-400" />}
                            {map.id === 'street' && <Crosshair className="w-6 h-6 text-amber-400" />}
                            {map.id === 'bunker' && <Biohazard className="w-6 h-6 text-emerald-400" />}
                            {map.id === 'hospital' && <Skull className="w-6 h-6 text-rose-400" />}
                            {map.id === 'graveyard' && <Ghost className="w-6 h-6 text-purple-400" />}
                            {map.id === 'desert_outpost' && <SunMedium className="w-6 h-6 text-yellow-400" />}
                            {map.id === 'cyber_facility' && <Cpu className="w-6 h-6 text-cyan-400" />}
                            {map.id === 'volcanic_core' && <Flame className="w-6 h-6 text-red-500" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base">{map.nameVi}</h4>
                            <span className="text-[10px] text-sky-400 font-mono font-bold">{map.codename}</span>
                          </div>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded-full bg-neutral-900 text-[10px] font-bold border"
                          style={{ color: map.accentColor, borderColor: `${map.themeColor}50` }}
                        >
                          {map.badge}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 font-medium mb-1.5">{map.subtitleVi}</p>
                      <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">{map.descVi}</p>

                      {/* Hazards Info */}
                      <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] flex items-start gap-2 text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <strong>Đặc điểm môi trường:</strong> {map.hazardsVi}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMap(map.id);
                        setActiveTab('play');
                      }}
                      className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500 text-neutral-950 font-black'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      {isSelected ? 'ĐÃ CHỌN BỐI CẢNH NÀY' : 'CHỌN BỐI CẢNH NÀY'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: WARRIOR SPECIALIZATIONS & CHARACTER SHOWCASE */}
        {activeTab === 'warriors' && (
          <div className="w-full space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" /> BIỆT ĐỘI CHIẾN BINH ĐẶC NHIỆM
              </h3>
              <p className="text-xs text-neutral-400">Chọn phong cách và chiến binh phù hợp nhất cho lối đánh của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WARRIOR_CLASSES.map((warrior) => {
                const isSelected = selectedWarriorId === warrior.id;
                return (
                  <div
                    key={warrior.id}
                    onClick={() => onSelectWarrior(warrior.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div>
                      {/* Avatar Image with Tactical Frame */}
                      <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 border border-neutral-700 shadow-md">
                        <img 
                          src={warrior.avatar} 
                          alt={warrior.nameVi}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-md text-[10px] font-black text-amber-400 border border-amber-500/30">
                          {warrior.codename}
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" /> ĐANG CHỌN
                          </div>
                        )}
                      </div>

                      {/* Name & Title */}
                      <h4 className="font-bold text-white text-base">{warrior.nameVi}</h4>
                      <span className="text-[11px] text-sky-400 font-semibold block mb-2">{warrior.titleVi}</span>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{warrior.descriptionVi}</p>

                      {/* Perk Stats Grid */}
                      <div className="space-y-1.5 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800 text-[11px]">
                        <div className="flex justify-between items-center text-neutral-300">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Sinh Lực:</span>
                          <span className="font-mono font-bold text-red-400">{Math.round(100 * warrior.perks.hpMultiplier)} HP</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-300">
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-sky-400" /> Giáp Trợ Lực:</span>
                          <span className="font-mono font-bold text-sky-400">{Math.round(50 * warrior.perks.armorMultiplier)} Giáp</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-300">
                          <span className="flex items-center gap-1"><Footprints className="w-3 h-3 text-emerald-400" /> Tốc Độ Cơ Động:</span>
                          <span className="font-mono font-bold text-emerald-400">+{Math.round((warrior.perks.speedMultiplier - 1) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Tactical Perk Highlight */}
                    <div className="mt-3 pt-2 border-t border-neutral-800">
                      <div className="text-[11px] font-bold text-amber-400">
                        ⚡ Đặc Quyền: <span className="text-neutral-300 font-normal">{warrior.bonusDesc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWarrior(warrior.id);
                          setActiveTab('play');
                        }}
                        className={`w-full mt-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 font-black'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        {isSelected ? 'ĐÃ CHỌN CHIẾN BINH NÀY' : 'CHỌN XUẤT TRẬN'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="w-full space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> BẢNG VÀNG KỶ LỤC CHIẾN TÍCH
            </h3>
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                Chưa có kỷ lục nào được ghi nhận. Hãy trở thành người đầu tiên vượt qua các đợt Zombie!
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {leaderboard.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono ${
                        idx === 0 ? 'bg-amber-500 text-neutral-950 font-black' :
                        idx === 1 ? 'bg-neutral-300 text-neutral-950' :
                        idx === 2 ? 'bg-amber-800 text-white' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <span className="text-[10px] text-neutral-500">{item.date} • {item.difficulty.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-amber-400 font-bold">{item.score} Điểm</div>
                      <div className="text-[10px] text-neutral-400">{item.kills} Quái • Đợt {item.wave}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HOW TO PLAY */}
        {activeTab === 'guide' && (
          <div className="w-full space-y-4 text-xs text-neutral-300 bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-2">ĐIỀU KHIỂN TRÊN MÁY TÍNH:</h4>
                <ul className="space-y-1.5 text-neutral-400">
                  <li>• <strong className="text-white">W, A, S, D</strong> hoặc <strong className="text-white">Mũi tên</strong>: Di chuyển</li>
                  <li>• <strong className="text-white">Chuột trái</strong>: Bắn súng</li>
                  <li>• <strong className="text-white">SPACE (Phím cách)</strong>: Lướt nhanh né quái</li>
                  <li>• <strong className="text-white">Phím R</strong>: Nạp đạn</li>
                  <li>• <strong className="text-white">Phím G hoặc E</strong>: Ném lựu đạn nổ lan</li>
                  <li>• <strong className="text-white">Phím 1-7 hoặc Lăn chuột</strong>: Đổi vũ khí</li>
                  <li>• <strong className="text-white">Phím B</strong>: Mở Cửa Hàng vũ khí & nâng cấp</li>
                  <li>• <strong className="text-white">Phím ESC / P</strong>: Tạm dừng game</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-amber-400 uppercase mb-2">ĐIỀU KHIỂN TRÊN ĐIỆN THOẠI:</h4>
                <ul className="space-y-1.5 text-neutral-400">
                  <li>• <strong className="text-white">Cần gạt ảo bên trái</strong>: Di chuyển 360 độ</li>
                  <li>• <strong className="text-white">Cần gạt ảo bên phải</strong>: Ngắm & Bắn tự động</li>
                  <li>• <strong className="text-white">Các nút bấm nhanh</strong>: Lướt né, Nạp đạn, Ném lựu và Chuyển súng</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-neutral-400">
              💡 <strong>MẸO SINH TỒN:</strong> Hãy bắn vào các thùng phuy màu đỏ khi lũ zombie bám đông để kích nổ diện rộng! Nhặt các hòm tiếp tế rơi ra như Túi máu, Hòm đạn, Bom Nuke hạt nhân và Trụ súng để sống sót lâu nhất!
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
