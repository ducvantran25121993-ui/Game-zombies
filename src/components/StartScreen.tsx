import React, { useState, useEffect } from 'react';
import { GameDifficulty, GameMode, HighScoreRecord, MapEnvironmentId } from '../types/game';
import { 
  Skull, Play, Trophy, Shield, Zap, Crosshair, 
  Flame, HelpCircle, Radio, Award, ChevronRight, Check,
  UserCheck, Sparkles, Heart, Footprints, MapPin, Building2,
  Biohazard, AlertTriangle, Ghost, SunMedium, Cpu, Layers,
  Volume2, VolumeX, ShieldAlert, Swords, Smartphone
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { WARRIOR_CLASSES, WARRIOR_HERO_BANNER } from '../data/warriors';
import { MAP_ENVIRONMENTS, BG_APOCALYPSE_IMAGE } from '../data/maps';
import { usePWAInstall } from '../utils/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

interface StartScreenProps {
  onStartGame: (difficulty: GameDifficulty, mode: GameMode, warriorId: string, mapId: MapEnvironmentId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedWarriorId: string;
  onSelectWarrior: (id: string) => void;
  selectedMapId: MapEnvironmentId;
  onSelectMap: (id: MapEnvironmentId) => void;
  onOpenMissions?: () => void;
  unclaimedMissionsCount?: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  selectedWarriorId,
  onSelectWarrior,
  selectedMapId,
  onSelectMap,
  onOpenMissions,
  unclaimedMissionsCount = 0
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [mode, setMode] = useState<GameMode>('survival');
  const [activeTab, setActiveTab] = useState<'play' | 'warriors' | 'maps' | 'leaderboard' | 'guide'>('play');
  const [leaderboard, setLeaderboard] = useState<HighScoreRecord[]>([]);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

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

  const handleLaunchGame = () => {
    soundManager.playEmptyClick();
    soundManager.startMusic();
    onStartGame(difficulty, mode, selectedWarriorId, selectedMapId);
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-2.5 sm:p-4 md:p-6 text-neutral-200 pb-12 sm:pb-16 touch-pan-y">
      
      {/* RICH CINEMATIC GAME BACKGROUND WALLPAPER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src={BG_APOCALYPSE_IMAGE} 
          alt="Apocalypse Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.18)_0%,transparent_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* TOP HEADER BAR */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-red-400 font-mono">
            LIVE // ZOMBIE WARZONE V2.4
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Phone PWA Install Button */}
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              setIsInstallModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-red-500/50 bg-red-950/60 hover:bg-red-900/80 text-red-200 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 group"
            title="Cài đặt game Zombie Strike vào màn hình chính điện thoại"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-400 group-hover:animate-bounce" />
            <span>Cài đặt ĐT</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {onOpenMissions && (
            <button
              onClick={() => {
                soundManager.playEmptyClick();
                onOpenMissions();
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhiệm vụ & Kỷ lục</span>
              {unclaimedMissionsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
                  {unclaimedMissionsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onToggleMute}
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold shadow-md active:scale-95 ${
              isMuted 
                ? 'bg-neutral-900/80 border-neutral-700 text-neutral-400' 
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            <span>{isMuted ? 'Âm thanh: TẮT' : 'Âm thanh: BẬT'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CARD */}
      <div className="relative z-10 w-full max-w-4xl bg-neutral-900/95 border border-neutral-800/90 rounded-3xl p-3.5 sm:p-5 md:p-7 shadow-2xl backdrop-blur-2xl flex flex-col items-center">
        
        {/* HERO BANNER SECTION WITH DIRECT PLAY BUTTON */}
        <div className="relative w-full h-36 sm:h-44 md:h-52 rounded-2xl overflow-hidden border border-neutral-700/80 mb-3.5 sm:mb-4 shadow-2xl group">
          <img 
            src={WARRIOR_HERO_BANNER} 
            alt="Zombie Apocalypse Warrior Hero" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent flex flex-col justify-between p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase shadow-md">
                  TACTICAL SPEC-OPS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-950/80 text-[9px] sm:text-[10px] font-bold text-amber-400 border border-amber-500/40">
                  SURVIVOR CORPS
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-amber-400 drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)]">
                  ZOMBIE APOCALYPSE
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-300 line-clamp-1">
                  SURVIVAL STRIKE • CHIẾN DỊCH DIỆT QUÁI SINH TỒN
                </p>
              </div>

              {/* DIRECT HERO START BUTTON */}
              <button
                onClick={handleLaunchGame}
                className="px-5 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-red-600/50 transition-all flex items-center justify-center gap-2 active:scale-95 border-2 border-amber-400/80 animate-pulse shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>BẮT ĐẦU CHƠI NGAY</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT TOP CALL-TO-ACTION PLAY BAR */}
        <div className="w-full mb-3.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/80 border-2 border-red-500/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-xl">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-neutral-950">
              <img 
                src={activeWarrior.avatar} 
                alt={activeWarrior.nameVi} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>{activeWarrior.nameVi}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold uppercase">
                  {difficulty.toUpperCase()}
                </span>
              </div>
              <div className="text-[10.5px] text-sky-300 font-medium">
                📍 {activeMap.nameVi} • {mode === 'survival' ? 'Từng Đợt Sóng (Waves)' : 'Ác Mộng Vô Tận'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchGame}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-300 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>VÀO TRẬN CHIẾN ĐẤU</span>
          </button>
        </div>

        {/* NAVIGATION TABS (Fluid Horizontal Scroll for Mobile) */}
        <div className="flex w-full border-b border-neutral-800 mb-3.5 sm:mb-5 gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar touch-pan-x">
          <button
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('play'); }}
            className={`flex-1 min-w-[110px] sm:min-w-[130px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              activeTab === 'play'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 bg-neutral-950/50 border border-neutral-800/80'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> THIẾT LẬP VÀO TRẬN
          </button>
          <button
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('maps'); }}
            className={`flex-1 min-w-[105px] sm:min-w-[125px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              activeTab === 'maps'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-neutral-950 font-black shadow-lg shadow-sky-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 bg-neutral-950/50 border border-neutral-800/80'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> BỐI CẢNH ({MAP_ENVIRONMENTS.length})
          </button>
          <button
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('warriors'); }}
            className={`flex-1 min-w-[105px] sm:min-w-[125px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              activeTab === 'warriors'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 bg-neutral-950/50 border border-neutral-800/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> CHIẾN BINH ({WARRIOR_CLASSES.length})
          </button>
          <button
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('leaderboard'); }}
            className={`flex-1 min-w-[95px] sm:min-w-[110px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 bg-neutral-950/50 border border-neutral-800/80'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> KỶ LỤC
          </button>
          <button
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('guide'); }}
            className={`flex-1 min-w-[95px] sm:min-w-[110px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 bg-neutral-950/50 border border-neutral-800/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> CÁCH CHƠI
          </button>
        </div>

        {/* TAB 1: PLAY CONFIGURATION & ACTIVE WARRIOR SUMMARY */}
        {activeTab === 'play' && (
          <div className="w-full space-y-4 sm:space-y-5">
            {/* DUAL PREVIEW SUMMARY CARDS: WARRIOR & BATTLEFIELD ENVIRONMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {/* CURRENT SELECTED WARRIOR CARD */}
              <div className="relative overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-neutral-950/80 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg group">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-neutral-900">
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
                      <h3 className="font-black text-white text-xs sm:text-sm">{activeWarrior.nameVi}</h3>
                    </div>
                    <span className="text-[10px] text-sky-400 font-semibold block">
                      {activeWarrior.titleVi}
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-amber-300/90 font-medium line-clamp-1">
                      ✨ {activeWarrior.bonusDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { soundManager.playEmptyClick(); setActiveTab('warriors'); }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold transition-all border border-amber-500/30 shrink-0 active:scale-90"
                  >
                    Đổi
                  </button>
                </div>
              </div>

              {/* CURRENT SELECTED MAP ENVIRONMENT CARD WITH ARTWORK */}
              <div className="relative overflow-hidden p-3 sm:p-3.5 rounded-2xl bg-neutral-950/80 border border-sky-500/40 flex items-center justify-between gap-3 shadow-lg group">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-sky-400 shadow-md shrink-0 bg-neutral-900">
                    {activeMap.image ? (
                      <img 
                        src={activeMap.image} 
                        alt={activeMap.nameVi}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-950/50">
                        <MapPin className="w-6 h-6 text-sky-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent pointer-events-none" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-white text-xs sm:text-sm">{activeMap.nameVi}</h3>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-bold border border-sky-500/40 inline-block">
                      {activeMap.badge}
                    </span>
                    <p className="text-[10px] sm:text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                      {activeMap.subtitleVi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { soundManager.playEmptyClick(); setActiveTab('maps'); }}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-xs font-bold transition-all border border-sky-500/30 shrink-0 active:scale-90"
                  >
                    Đổi
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK BATTLEFIELD ENVIRONMENT PICKER (WITH HIGH-RES THUMBNAILS) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] sm:text-xs font-black text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> CHỌN BỐI CẢNH CHIẾN TRƯỜNG ({MAP_ENVIRONMENTS.length}):
                </label>
                <span className="text-[10px] sm:text-[11px] text-sky-400/90 font-medium">Tự chuyển cảnh qua mỗi đợt</span>
              </div>

              {/* 8 MAP THUMBNAIL CARDS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 touch-pan-y">
                {MAP_ENVIRONMENTS.map((map) => {
                  const isSelected = selectedMapId === map.id;
                  return (
                    <button
                      key={map.id}
                      type="button"
                      onClick={() => {
                        soundManager.playEmptyClick();
                        onSelectMap(map.id);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border text-left transition-all p-2 sm:p-2.5 flex flex-col justify-end min-h-[86px] sm:min-h-[96px] active:scale-95 touch-pan-y ${
                        isSelected
                          ? 'border-sky-400 shadow-xl shadow-sky-500/25 ring-2 ring-sky-400/50'
                          : 'border-neutral-800/90 hover:border-neutral-600 bg-neutral-950/60'
                      }`}
                    >
                      {/* Battlefield Thumbnail Artwork Background */}
                      {map.image && (
                        <img 
                          src={map.image} 
                          alt={map.nameVi}
                          referrerPolicy="no-referrer"
                          className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 ${
                            isSelected ? 'opacity-85 brightness-105' : 'opacity-40 brightness-75 group-hover:opacity-60'
                          }`}
                        />
                      )}
                      
                      {/* Dark Gradient Overlay for Ultra-High Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30 pointer-events-none" />

                      {/* Map Badges & Selection Indicator */}
                      <div className="relative z-10 flex items-center justify-between w-full mb-1">
                        <span 
                          className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded-md backdrop-blur-md border uppercase tracking-wider"
                          style={{ 
                            backgroundColor: `${map.themeColor}30`, 
                            color: map.accentColor,
                            borderColor: `${map.themeColor}60`
                          }}
                        >
                          {map.badge}
                        </span>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400 animate-pulse" />
                        )}
                      </div>

                      {/* Map Title */}
                      <div className="relative z-10 font-black text-[11px] sm:text-xs text-white leading-tight drop-shadow-md truncate">
                        {map.nameVi}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Friendly Scroll Down Hint */}
              <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-neutral-400 sm:hidden">
                <span>↓ Cuộn xuống để chọn Chế độ & Độ khó ↓</span>
              </div>
            </div>

            {/* GAME MODE SELECTION */}
            <div>
              <label className="text-[11px] sm:text-xs font-black text-neutral-300 uppercase tracking-wider block mb-1.5 sm:mb-2">
                CHẾ ĐỘ CHƠI:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => { soundManager.playEmptyClick(); setMode('survival'); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all active:scale-98 ${
                    mode === 'survival'
                      ? 'bg-gradient-to-br from-red-950/70 via-neutral-900 to-neutral-950 border-red-500 text-white shadow-xl shadow-red-500/20 ring-1 ring-red-500/40'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-xs sm:text-sm text-white">
                    <span className="flex items-center gap-1.5">
                      <Skull className="w-4 h-4 text-red-500" /> Từng Đợt Sinh Tồn (Waves)
                    </span>
                    {mode === 'survival' && <Check className="w-4 h-4 text-red-400" />}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    Chiến đấu qua từng Wave, đụng độ Trùm Đột Biến mỗi 5 Wave và chuyển sang bản đồ mới.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => { soundManager.playEmptyClick(); setMode('endless'); }}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all active:scale-98 ${
                    mode === 'endless'
                      ? 'bg-gradient-to-br from-amber-950/70 via-neutral-900 to-neutral-950 border-amber-500 text-white shadow-xl shadow-amber-500/20 ring-1 ring-amber-500/40'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-xs sm:text-sm text-white">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" /> Cơn Ác Mộng Vô Tận
                    </span>
                    {mode === 'endless' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    Zombie tràn ngập liên tục không ngừng nghỉ. Thử thách giới hạn sinh tồn của bạn!
                  </p>
                </button>
              </div>
            </div>

            {/* DIFFICULTY SELECTION */}
            <div>
              <label className="text-[11px] sm:text-xs font-black text-neutral-300 uppercase tracking-wider block mb-1.5 sm:mb-2">
                ĐỘ KHÓ CHIẾN TRƯỜNG:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {[
                  { id: 'easy' as GameDifficulty, label: 'Dễ (Tân Binh)', desc: 'Máu quái -30%, rơi vàng nhiều', color: '#10b981' },
                  { id: 'normal' as GameDifficulty, label: 'Tiêu Chuẩn', desc: 'Trải nghiệm cân bằng nhất', color: '#f59e0b' },
                  { id: 'hard' as GameDifficulty, label: 'Kỳ Cựu (Khó)', desc: 'Quái nhanh & đông hơn', color: '#f43f5e' },
                  { id: 'nightmare' as GameDifficulty, label: 'Ác Mộng (Cực Khó)', desc: 'Sát thương x2, quái bạo nộ', color: '#ef4444' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { soundManager.playEmptyClick(); setDifficulty(item.id); }}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                      difficulty === item.id
                        ? 'bg-neutral-800 border-amber-400 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-black text-xs text-white flex items-center justify-between">
                      <span>{item.label}</span>
                      {difficulty === item.id && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-neutral-400 block mt-1 line-clamp-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* HIGH VISIBILITY LARGE BOTTOM START BUTTON */}
            <div className="pt-3">
              <button
                onClick={handleLaunchGame}
                className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base sm:text-lg uppercase tracking-widest shadow-2xl shadow-red-600/50 transition-all flex items-center justify-center gap-3 active:scale-95 group border-2 border-amber-300"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white group-hover:scale-110 transition-transform" />
                <span>BẮT ĐẦU CHƠI: {activeWarrior.nameVi.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED MAP ENVIRONMENT SHOWCASE */}
        {activeTab === 'maps' && (
          <div className="w-full space-y-4">
            <div className="text-center mb-1">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" /> 8 BỐI CẢNH CHIẾN TRƯỜNG & KHÔNG GIAN
              </h3>
              <p className="text-xs text-neutral-400">Chọn bối cảnh xuất phát điểm — qua mỗi vòng bối cảnh sẽ tự động chuyển đổi sang vùng đất mới!</p>
            </div>

            {/* Dynamic Map Rotation Announcement Banner */}
            <div className="p-3 rounded-2xl bg-sky-950/50 border border-sky-500/40 flex items-center gap-3 text-xs text-sky-200 shadow-md">
              <div className="p-2 rounded-xl bg-sky-900/60 border border-sky-400/40 text-sky-300 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="leading-relaxed">
                <strong className="text-sky-300 font-bold block">TỰ ĐỘNG CHUYỂN ĐỔI BỐI CẢNH MỖI VÒNG:</strong>
                Sau khi vượt qua mỗi đợt sóng Zombie & Boss, toàn bộ không gian bản đồ và chướng ngại vật sẽ xoay vòng sang bối cảnh tiếp theo theo chu trình 8 chiến trường!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {MAP_ENVIRONMENTS.map((map) => {
                const isSelected = selectedMapId === map.id;
                return (
                  <div
                    key={map.id}
                    onClick={() => { soundManager.playEmptyClick(); onSelectMap(map.id); }}
                    className={`cursor-pointer rounded-2xl overflow-hidden border transition-all flex flex-col justify-between group active:scale-98 ${
                      isSelected
                        ? 'bg-neutral-900 border-sky-400 shadow-2xl shadow-sky-500/20 ring-2 ring-sky-400/50'
                        : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Cinematic Header Image */}
                    <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-neutral-950">
                      {map.image && (
                        <img 
                          src={map.image} 
                          alt={map.nameVi}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md uppercase tracking-wider"
                          style={{ 
                            backgroundColor: `${map.themeColor}40`, 
                            color: map.accentColor, 
                            borderColor: `${map.themeColor}80` 
                          }}
                        >
                          {map.badge}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                        <div>
                          <h4 className="font-black text-white text-base leading-tight drop-shadow">{map.nameVi}</h4>
                          <span className="text-[10px] text-sky-300 font-mono font-bold drop-shadow">{map.codename}</span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-400 text-neutral-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" /> ĐANG CHỌN
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <p className="text-xs text-sky-200 font-semibold mb-1">{map.subtitleVi}</p>
                        <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">{map.descVi}</p>

                        {/* Hazards Info */}
                        <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/90 text-[10.5px] flex items-start gap-2 text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <div>
                            <strong>Môi trường:</strong> {map.hazardsVi}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundManager.playEmptyClick();
                            onSelectMap(map.id);
                            setActiveTab('play');
                          }}
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-sky-400 text-neutral-950 shadow-md'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          }`}
                        >
                          {isSelected ? 'ĐÃ CHỌN BỐI CẢNH NÀY' : 'CHỌN BỐI CẢNH'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMap(map.id);
                            handleLaunchGame();
                          }}
                          className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> CHƠI NGAY
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WARRIOR SPECIALIZATIONS & CHARACTER SHOWCASE */}
        {activeTab === 'warriors' && (
          <div className="w-full space-y-4">
            <div className="text-center mb-1">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" /> BIỆT ĐỘI CHIẾN BINH ĐẶC NHIỆM ({WARRIOR_CLASSES.length})
              </h3>
              <p className="text-xs text-neutral-400">Chọn phong cách và chiến binh phù hợp nhất cho lối đánh của bạn</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {WARRIOR_CLASSES.map((warrior) => {
                const isSelected = selectedWarriorId === warrior.id;
                return (
                  <div
                    key={warrior.id}
                    onClick={() => { soundManager.playEmptyClick(); onSelectWarrior(warrior.id); }}
                    className={`cursor-pointer rounded-2xl p-3 sm:p-4 border transition-all flex flex-col justify-between group active:scale-98 ${
                      isSelected
                        ? 'bg-neutral-900 border-amber-400 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/50'
                        : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Avatar Image with Tactical Frame */}
                      <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-3 border border-neutral-700 shadow-md bg-neutral-950">
                        <img 
                          src={warrior.avatar} 
                          alt={warrior.nameVi}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-md text-[9px] sm:text-[10px] font-black text-amber-400 border border-amber-500/40">
                          {warrior.codename}
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" /> ĐANG CHỌN
                          </div>
                        )}
                      </div>

                      {/* Name & Title */}
                      <h4 className="font-black text-white text-base">{warrior.nameVi}</h4>
                      <span className="text-[11px] text-sky-400 font-semibold block mb-1.5">{warrior.titleVi}</span>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{warrior.descriptionVi}</p>

                      {/* Perk Stats Grid */}
                      <div className="space-y-1.5 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800 text-[11px]">
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
                    <div className="mt-3 pt-2.5 border-t border-neutral-800">
                      <div className="text-[11px] font-bold text-amber-300">
                        ⚡ Đặc Quyền: <span className="text-neutral-300 font-normal">{warrior.bonusDesc}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundManager.playEmptyClick();
                            onSelectWarrior(warrior.id);
                            setActiveTab('play');
                          }}
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 shadow-md'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          }`}
                        >
                          {isSelected ? 'ĐÃ CHỌN' : 'CHỌN TƯỚNG'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectWarrior(warrior.id);
                            handleLaunchGame();
                          }}
                          className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> CHƠI NGAY
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="w-full space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> BẢNG VÀNG KỶ LỤC CHIẾN TÍCH
            </h3>
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/50 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                Chưa có kỷ lục nào được ghi nhận. Hãy trở thành người đầu tiên vượt qua các đợt Zombie!
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {leaderboard.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs"
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

        {/* TAB 5: HOW TO PLAY */}
        {activeTab === 'guide' && (
          <div className="w-full space-y-4 text-xs text-neutral-300 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-black text-amber-400 uppercase mb-2">ĐIỀU KHIỂN TRÊN MÁY TÍNH:</h4>
                <ul className="space-y-1.5 text-neutral-300">
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
                <h4 className="font-black text-sky-400 uppercase mb-2">ĐIỀU KHIỂN TRÊN ĐIỆN THOẠI:</h4>
                <ul className="space-y-1.5 text-neutral-300">
                  <li>• <strong className="text-white">Cần gạt ảo bên trái</strong>: Di chuyển 360 độ</li>
                  <li>• <strong className="text-white">Cần gạt ảo bên phải</strong>: Ngắm & Bắn tự động</li>
                  <li>• <strong className="text-white">Các nút bấm nhanh</strong>: Lướt né, Nạp đạn, Ném lựu và Chuyển súng</li>
                  <li>• <strong className="text-white">Dải vũ khí ngang</strong>: Chạm vào súng bất kỳ để đổi ngay lập tức</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-neutral-300">
              💡 <strong>MẸO SINH TỒN:</strong> Bắn vào các thùng phuy đỏ khi quái bám đông để kích nổ diện rộng! Tích lũy Vàng mở khóa <strong>Robo tác chiến trong Cửa Hàng (Phím B)</strong> để được robot bay hộ tống nã đạn bảo vệ bạn trước những đợt bão Zombie đông đảo và Boss hung hãn!
            </div>
          </div>
        )}

      </div>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
      />

    </div>
  );
};
