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
  const [activeTab, setActiveTab] = useState<'play' | 'warriors' | 'maps' | 'leaderboard'>('play');
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
    <div className="relative w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start text-neutral-200 pb-12 sm:pb-16 touch-pan-y">
      
      {/* FULL-SCREEN CINEMATIC DYNAMIC BACKDROP UNDER ENTIRE APP */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src={WARRIOR_HERO_BANNER} 
          alt="Apocalypse Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-45 sm:opacity-40 scale-105 filter brightness-75 contrast-125"
        />
        {/* Multilevel vignette and atmospheric glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-transparent to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.22)_0%,transparent_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* TOP SAFE-AREA PADDING WRAPPER TO PREVENT PHONE NOTCH / STATUS BAR CLIPPING */}
      <div className="w-full pt-safe px-2.5 sm:px-4 md:px-6 pt-3 sm:pt-4 flex flex-col items-center z-20">

        {/* TOP HEADER BAR */}
        <header className="w-full max-w-4xl flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 rounded-2xl bg-neutral-950/85 border border-neutral-800/90 backdrop-blur-xl shadow-xl">
          {/* Left: Tactical Live Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-red-400 font-mono whitespace-nowrap">
              <span className="hidden xs:inline">LIVE // </span>WARZONE <span className="text-neutral-400">V2.4</span>
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Guide & How to Play Button */}
            <button
              onClick={() => {
                soundManager.playEmptyClick();
                setIsInstallModalOpen(true);
              }}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900/70 text-sky-200 transition-all flex items-center gap-1 text-[10.5px] sm:text-xs font-bold shadow-sm active:scale-95 whitespace-nowrap"
              title="Xem cách chơi và hướng dẫn cài đặt ứng dụng"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden xs:inline">Cách Chơi & Hướng Dẫn</span>
              <span className="xs:hidden">Hướng Dẫn</span>
            </button>

            {/* Missions & Records */}
            {onOpenMissions && (
              <button
                onClick={() => {
                  soundManager.playEmptyClick();
                  onOpenMissions();
                }}
                className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl border border-amber-500/40 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 transition-all flex items-center gap-1 text-[10.5px] sm:text-xs font-bold shadow-sm active:scale-95 whitespace-nowrap"
                title="Nhiệm vụ & Kỷ lục"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Nhiệm vụ</span>
                {unclaimedMissionsCount > 0 && (
                  <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse shrink-0">
                    {unclaimedMissionsCount}
                  </span>
                )}
              </button>
            )}

            {/* Audio Mute Toggle */}
            <button
              onClick={onToggleMute}
              className={`h-7 sm:h-8 px-2 rounded-xl border transition-all flex items-center gap-1 text-[10.5px] sm:text-xs font-bold shadow-sm active:scale-95 whitespace-nowrap ${
                isMuted 
                  ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200' 
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              )}
              <span className="hidden md:inline">{isMuted ? 'Tắt âm' : 'Bật âm'}</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTAINER CARD */}
        <div className="w-full max-w-4xl bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-3 sm:p-5 md:p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center">
          
          {/* TACTICAL COMMAND LOBBY HERO BANNER (INTEGRATED FULLY WITH BACKDROP) */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-700/80 mb-3 sm:mb-4 shadow-2xl group bg-neutral-950">
            <div className="relative w-full h-32 sm:h-40 md:h-44 overflow-hidden">
              <img 
                src={WARRIOR_HERO_BANNER} 
                alt="Zombie Apocalypse Warrior Hero" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-transparent to-neutral-950/50" />
              
              {/* Top Badges */}
              <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-[9px] font-black text-white tracking-widest uppercase shadow">
                    SPEC-OPS
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-950/80 text-[9px] font-bold text-amber-400 border border-amber-500/40">
                    SURVIVOR CORPS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 font-bold">
                  {mode === 'survival' ? 'WAVES 1-20' : 'ENDLESS'}
                </span>
              </div>

              {/* Title */}
              <div className="absolute bottom-2 left-3 right-3">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-200 to-amber-400 drop-shadow">
                  ZOMBIE APOCALYPSE
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold text-neutral-300 line-clamp-1">
                  SURVIVAL STRIKE • CHIẾN DỊCH DIỆT QUÁI SINH TỒN
                </p>
              </div>
            </div>

            {/* Quick Interactive Squad Bar & Play Button */}
            <div className="p-2 sm:p-2.5 bg-neutral-900/90 border-t border-neutral-800/90 flex flex-col sm:flex-row items-center justify-between gap-2">
              {/* Quick Loadout Chips */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {/* Warrior Chip */}
                <button
                  type="button"
                  onClick={() => { soundManager.playEmptyClick(); setActiveTab('warriors'); }}
                  className="px-2 py-1 rounded-xl bg-neutral-950 border border-amber-500/40 hover:border-amber-400 flex items-center gap-1.5 transition-all text-left shrink-0 active:scale-95 group/w"
                  title="Bấm để chọn Chiến Binh"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-400 shrink-0">
                    <img src={activeWarrior.avatar} alt={activeWarrior.nameVi} className="w-full h-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[8.5px] text-amber-400 font-black flex items-center gap-0.5">
                      <span>CHIẾN BINH</span>
                      <span className="text-[7.5px] text-neutral-400 group-hover/w:text-amber-300">▼</span>
                    </div>
                    <div className="text-[11px] font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
                      {activeWarrior.nameVi}
                    </div>
                  </div>
                </button>

                {/* Map Chip */}
                <button
                  type="button"
                  onClick={() => { soundManager.playEmptyClick(); setActiveTab('maps'); }}
                  className="px-2 py-1 rounded-xl bg-neutral-950 border border-sky-500/40 hover:border-sky-400 flex items-center gap-1.5 transition-all text-left shrink-0 active:scale-95 group/m"
                  title="Bấm để chọn Bối Cảnh Chiến Trường"
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden border border-sky-400 shrink-0 bg-neutral-900 flex items-center justify-center">
                    {activeMap.image ? (
                      <img src={activeMap.image} alt={activeMap.nameVi} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[8.5px] text-sky-400 font-black flex items-center gap-0.5">
                      <span>BỐI CẢNH</span>
                      <span className="text-[7.5px] text-neutral-400 group-hover/m:text-sky-300">▼</span>
                    </div>
                    <div className="text-[11px] font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
                      {activeMap.nameVi}
                    </div>
                  </div>
                </button>

                {/* Difficulty Pill */}
                <button
                  type="button"
                  onClick={() => { soundManager.playEmptyClick(); setActiveTab('play'); }}
                  className="px-2 py-1 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-center text-left shrink-0"
                  title="Bấm để chỉnh Chế độ & Độ khó"
                >
                  <span className="text-[8.5px] text-neutral-400 font-black">ĐỘ KHÓ</span>
                  <span className="text-[11px] font-bold text-amber-400 uppercase">
                    {difficulty}
                  </span>
                </button>
              </div>

              {/* Main Action Start Button */}
              <button
                onClick={handleLaunchGame}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-300/80 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>VÀO TRẬN NGAY</span>
              </button>
            </div>
          </div>

        {/* TACTICAL SCI-FI MILITARY SEGMENTED DOCK TABS */}
        <div className="w-full bg-neutral-950/85 p-1.5 rounded-2xl border border-neutral-800/90 mb-3.5 sm:mb-4 grid grid-cols-4 gap-1.5 shadow-2xl backdrop-blur-xl">
          {/* TAB 1: THIẾT LẬP */}
          <button
            type="button"
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('play'); }}
            className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
              activeTab === 'play'
                ? 'bg-gradient-to-b from-red-500/20 via-red-950/40 to-neutral-950/90 border border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.25)] text-white'
                : 'bg-neutral-950/40 border border-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 hover:border-neutral-700/60'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Swords className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'play' ? 'text-red-400 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
            </div>
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap mt-1 ${activeTab === 'play' ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
              Thiết Lập
            </span>
            {/* Tactical Laser Pip */}
            <div className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${activeTab === 'play' ? 'w-5 sm:w-6 bg-gradient-to-r from-red-500 via-rose-300 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'w-0 opacity-0'}`} />
          </button>

          {/* TAB 2: CHIẾN BINH */}
          <button
            type="button"
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('warriors'); }}
            className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
              activeTab === 'warriors'
                ? 'bg-gradient-to-b from-amber-500/20 via-amber-950/40 to-neutral-950/90 border border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-white'
                : 'bg-neutral-950/40 border border-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 hover:border-neutral-700/60'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <UserCheck className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'warriors' ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
              <span className={`absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8.5px] font-black leading-none border shadow-sm ${
                activeTab === 'warriors'
                  ? 'bg-amber-400 border-amber-300 text-neutral-950'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}>
                3
              </span>
            </div>
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap mt-1 ${activeTab === 'warriors' ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
              Chiến Binh
            </span>
            {/* Tactical Laser Pip */}
            <div className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${activeTab === 'warriors' ? 'w-5 sm:w-6 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'w-0 opacity-0'}`} />
          </button>

          {/* TAB 3: BỐI CẢNH */}
          <button
            type="button"
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('maps'); }}
            className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
              activeTab === 'maps'
                ? 'bg-gradient-to-b from-sky-500/20 via-sky-950/40 to-neutral-950/90 border border-sky-500/70 shadow-[0_0_15px_rgba(14,165,233,0.25)] text-white'
                : 'bg-neutral-950/40 border border-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 hover:border-neutral-700/60'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <MapPin className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'maps' ? 'text-sky-400 scale-110 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
              <span className={`absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8.5px] font-black leading-none border shadow-sm ${
                activeTab === 'maps'
                  ? 'bg-sky-400 border-sky-300 text-neutral-950'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}>
                8
              </span>
            </div>
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap mt-1 ${activeTab === 'maps' ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
              Bối Cảnh
            </span>
            {/* Tactical Laser Pip */}
            <div className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${activeTab === 'maps' ? 'w-5 sm:w-6 bg-gradient-to-r from-sky-500 via-cyan-200 to-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]' : 'w-0 opacity-0'}`} />
          </button>

          {/* TAB 4: KỶ LỤC */}
          <button
            type="button"
            onClick={() => { soundManager.playEmptyClick(); setActiveTab('leaderboard'); }}
            className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-b from-purple-500/20 via-purple-950/40 to-neutral-950/90 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white'
                : 'bg-neutral-950/40 border border-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 hover:border-neutral-700/60'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Trophy className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'leaderboard' ? 'text-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'text-neutral-400 group-hover:text-neutral-200'}`} />
            </div>
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap mt-1 ${activeTab === 'leaderboard' ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
              Kỷ Lục
            </span>
            {/* Tactical Laser Pip */}
            <div className={`h-0.5 rounded-full mt-1 transition-all duration-300 ${activeTab === 'leaderboard' ? 'w-5 sm:w-6 bg-gradient-to-r from-purple-500 via-fuchsia-200 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'w-0 opacity-0'}`} />
          </button>
        </div>

        {/* TAB 1: PLAY CONFIGURATION */}
        {activeTab === 'play' && (
          <div className="w-full space-y-3.5 sm:space-y-4">
            {/* GAME MODE SELECTION */}
            <div>
              <label className="text-[11px] sm:text-xs font-black text-neutral-300 uppercase tracking-wider block mb-1.5 sm:mb-2 flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-red-500" />
                <span>CHỌN CHẾ ĐỘ CHIẾN ĐẤU:</span>
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
                    Chiến đấu qua từng Wave, đụng độ Trùm Đột Biến mỗi 5 Wave và tự chuyển cảnh qua 8 vùng đất.
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
                    Zombie tràn ngập liên tục không ngừng nghỉ. Thử thách giới hạn sinh tồn và leo rank đỉnh cao!
                  </p>
                </button>
              </div>
            </div>

            {/* DIFFICULTY SELECTION */}
            <div>
              <label className="text-[11px] sm:text-xs font-black text-neutral-300 uppercase tracking-wider block mb-1.5 sm:mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>ĐỘ KHÓ CHIẾN TRƯỜNG:</span>
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

        </div>

      </div>

      {/* Install App & Gameplay Guide Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
        defaultTab="gameplay"
      />

    </div>
  );
};
