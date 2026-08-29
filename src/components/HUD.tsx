import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PlayerStats, Weapon, WeaponType, ActiveBuffs, MapEnvironmentId } from '../types/game';
import { 
  Heart, Shield, Zap, Crosshair, RefreshCw, 
  Flame, Skull, DollarSign, Award, Bomb, Radio,
  Clock, ShieldAlert, Sparkles, UserCheck, Lock, ShoppingCart, MapPin, X
} from 'lucide-react';
import { WARRIOR_CLASSES } from '../data/warriors';
import { MAP_ENVIRONMENTS } from '../data/maps';

interface HUDProps {
  player: PlayerStats;
  weapons: Record<string, Weapon>;
  currentWeapon: Weapon;
  currentWeaponId: WeaponType;
  wave: number;
  totalZombiesInWave: number;
  zombiesRemaining: number;
  bossHp?: { current: number; max: number; name: string; badge?: string; currentSkill?: string } | null;
  activeBuffs: ActiveBuffs;
  currentMapId?: MapEnvironmentId;
  isReloading: boolean;
  reloadProgress: number;
  onOpenShop: () => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onThrowGrenade: () => void;
  onSelectWeapon: (weaponId: WeaponType) => void;
  cameraZoomMode?: 'wide' | 'ultrawide' | 'normal';
  onToggleCameraZoom?: () => void;
  autoAimEnabled?: boolean;
  onToggleAutoAim?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  weapons,
  currentWeapon,
  currentWeaponId,
  wave,
  totalZombiesInWave,
  zombiesRemaining,
  bossHp,
  activeBuffs,
  currentMapId = 'rooftop',
  isReloading,
  reloadProgress,
  onOpenShop,
  onPause,
  isMuted,
  onToggleMute,
  onThrowGrenade,
  onSelectWeapon,
  cameraZoomMode = 'wide',
  onToggleCameraZoom,
  autoAimEnabled = true,
  onToggleAutoAim
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const armorPercent = Math.max(0, Math.min(100, (player.armor / player.maxArmor) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (player.stamina / player.maxStamina) * 100));
  const waveProgress = totalZombiesInWave > 0 
    ? Math.max(0, Math.min(100, ((totalZombiesInWave - zombiesRemaining) / totalZombiesInWave) * 100))
    : 0;

  const currentMap = useMemo(() => {
    return MAP_ENVIRONMENTS.find(m => m.id === currentMapId) || MAP_ENVIRONMENTS[0];
  }, [currentMapId]);

  const isLowHp = player.hp < player.maxHp * 0.3;

  // Check if player has enough gold to buy any locked weapon or upgrade
  const weaponList = useMemo(() => Object.values(weapons || {}) as Weapon[], [weapons]);
  
  const affordableLockedWeapon = useMemo(() => {
    return weaponList.find(w => !w.unlocked && player.gold >= w.cost);
  }, [weaponList, player.gold]);

  const canUpgradeCurrent = useMemo(() => {
    if (!currentWeapon) return false;
    const cost = Math.round(currentWeapon.cost * 0.6 * currentWeapon.level) + 120;
    return player.gold >= cost;
  }, [currentWeapon, player.gold]);

  const canAffordAnything = Boolean(affordableLockedWeapon || canUpgradeCurrent);

  // 5-second Auto-Dismiss Notification System for newly affordable weapons/gear
  const [notification, setNotification] = useState<{ id: string; title: string; subtitle: string } | null>(null);
  const lastNotifiedItemRef = useRef<string | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (affordableLockedWeapon) {
      const notifKey = `wep_${affordableLockedWeapon.id}_${affordableLockedWeapon.cost}`;
      // Trigger notification if it's a new unlockable item
      if (lastNotifiedItemRef.current !== notifKey) {
        lastNotifiedItemRef.current = notifKey;
        setNotification({
          id: notifKey,
          title: `ĐỦ VÀNG: ${affordableLockedWeapon.nameVi} (${affordableLockedWeapon.cost}V)!`,
          subtitle: 'Chạm để mở Cửa Hàng & Trang Bị ngay'
        });

        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    }
  }, [affordableLockedWeapon]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] px-[max(0.5rem,env(safe-area-inset-left,0px))] sm:p-4 md:p-6 overflow-hidden">
      {/* Red Low HP Vignette Warning */}
      {isLowHp && (
        <div className="absolute inset-0 border-4 sm:border-8 border-red-600/40 animate-pulse pointer-events-none shadow-[inset_0_0_60px_rgba(239,68,68,0.5)]" />
      )}

      {/* TOP HEADER: Balanced Responsive Container */}
      <div className="flex flex-col gap-1.5 w-full max-w-7xl mx-auto pointer-events-auto">
        
        {/* ROW 1: Player Stats, Wave Indicator, Currency, Shop & Grenade */}
        <div className="flex items-center justify-between gap-1 w-full flex-nowrap">
          
          {/* Left: Warrior Avatar & Health, Armor */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-950/90 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-xl border border-neutral-800/80 shadow-md shrink-0">
            {/* Warrior Portrait */}
            {(() => {
              const currentWarrior = WARRIOR_CLASSES.find(w => w.id === (player.warriorSkin || 'commando')) || WARRIOR_CLASSES[0];
              return (
                <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-amber-500/80 shrink-0 bg-neutral-900">
                  <img 
                    src={currentWarrior.avatar} 
                    alt={currentWarrior.nameVi}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 px-0.5 bg-amber-500 text-[6px] sm:text-[7px] font-black text-neutral-950 rounded-bl">
                    v{1 + (player.upgrades.maxHpLevel || 0) + (player.upgrades.bulletDamageLevel || 0)}
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col gap-0.5 min-w-[58px] sm:min-w-[85px]">
              {/* Health */}
              <div className="flex items-center justify-between text-[7.5px] sm:text-[10px] font-bold leading-none">
                <span className="flex items-center gap-0.5 text-red-400">
                  <Heart className={`w-2.5 h-2.5 fill-red-500 text-red-500 ${isLowHp ? 'animate-bounce' : ''}`} />
                  HP
                </span>
                <span className="text-neutral-300 font-mono text-[7.5px] sm:text-[10px]">
                  {Math.ceil(player.hp)}/{player.maxHp}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-red-950/60">
                <div 
                  className={`h-full transition-all duration-200 rounded-full ${
                    isLowHp ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse' : 'bg-gradient-to-r from-red-700 to-emerald-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              {/* Armor */}
              <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-sky-950/60">
                <div 
                  className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-200 rounded-full"
                  style={{ width: `${armorPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center: Wave Indicator */}
          <div className="bg-neutral-950/90 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-xl border border-neutral-800 shadow-md flex items-center gap-1 shrink-0">
            <Skull className="w-3 h-3 text-amber-500 shrink-0" />
            <div className="flex flex-col items-center leading-none">
              <span className="text-amber-400 text-[8.5px] sm:text-[11px] font-black uppercase">ĐỢT {wave}</span>
              <span className="text-neutral-400 font-mono text-[6.5px] sm:text-[8px]">Còn {zombiesRemaining}</span>
            </div>
          </div>

          {/* Currency: Gold & Score */}
          <div className="bg-neutral-950/90 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-xl border border-neutral-800/80 shadow-md flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="flex items-center gap-0.5 text-amber-400 font-black text-[8.5px] sm:text-xs">
              <DollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
              <span className="font-mono">{player.gold}</span>
            </div>
            <div className="h-2.5 w-[1px] bg-neutral-800" />
            <div className="flex items-center gap-0.5 text-white font-bold text-[7.5px] sm:text-[10px]">
              <Award className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
              <span className="font-mono">{player.score}</span>
            </div>
          </div>

          {/* Quick Shop Button in Top Bar */}
          <button
            onClick={onOpenShop}
            className={`px-1.5 sm:px-2 py-1 rounded-xl border flex items-center gap-1 shadow-md transition-all active:scale-90 text-[8px] sm:text-[10px] font-black backdrop-blur-md relative pointer-events-auto shrink-0 ${
              canAffordAnything
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 border-amber-300 animate-pulse shadow-amber-500/40'
                : 'bg-neutral-950/90 border-amber-500/50 text-amber-400 hover:bg-neutral-900'
            }`}
            title="Mở Cửa Hàng Trang Bị / Nâng Cấp (Phím B)"
          >
            <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span>SHOP</span>
            {canAffordAnything && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 animate-ping border border-white" />
            )}
          </button>

          {/* Quick Grenade Button in Top Bar */}
          <button
            onClick={onThrowGrenade}
            disabled={player.grenadeCount <= 0}
            className={`px-1.5 sm:px-2 py-1 rounded-xl border flex items-center gap-1 shadow-md transition-all active:scale-90 text-[8px] sm:text-[10px] font-black backdrop-blur-md pointer-events-auto shrink-0 ${
              player.grenadeCount > 0
                ? 'bg-gradient-to-r from-red-600 to-amber-600 border-red-400 text-white shadow-red-500/20'
                : 'bg-neutral-950/70 border-neutral-800 text-neutral-600 opacity-60'
            }`}
            title="Ném Lựu đạn nổ diện rộng (Phím G hoặc E)"
          >
            <Bomb className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="font-mono">x{player.grenadeCount}</span>
          </button>
        </div>

        {/* ROW 2: Boss Bar & Tactical Controls (Zoom 0.7x, Auto-Aim, Mute, Pause) ON THE SAME LINE */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
          {/* Boss Bar or Map Chip on the left/center */}
          {bossHp ? (
            <div 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggle-boss-lock'));
              }}
              className="flex-1 min-w-0 bg-neutral-950/90 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl border border-red-500/70 shadow-md shadow-red-950/40 cursor-pointer hover:border-amber-400/90 transition-all active:scale-[0.99] group select-none"
              title="Click/Chạm để Khóa hoặc Hủy Khóa mục tiêu Boss"
            >
              {/* Boss Info Header */}
              <div className="flex items-center justify-between text-[7px] sm:text-[9.5px] font-black text-red-200 uppercase tracking-wide gap-1">
                <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                  <ShieldAlert className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0 animate-pulse group-hover:text-amber-400" />
                  {bossHp.badge && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[6px] sm:text-[7.5px] shrink-0 hidden xs:inline-block">
                      {bossHp.badge}
                    </span>
                  )}
                  <span className="font-black text-white tracking-wide truncate">{bossHp.name}</span>
                  {bossHp.currentSkill && (
                    <span className="text-[6px] sm:text-[8px] text-amber-300 font-mono font-bold bg-amber-950/60 border border-amber-500/40 px-1 py-0.2 rounded truncate shrink-0 max-w-[90px] sm:max-w-[180px] flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping inline-block shrink-0" />
                      <span>{bossHp.currentSkill}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="font-mono text-red-200 font-black text-[7px] sm:text-[9.5px]">
                    {Math.ceil(bossHp.current)}/{bossHp.max}
                  </span>
                  <span className="text-[6.5px] text-amber-400 font-mono hidden md:inline-block bg-neutral-900/80 px-1 py-0.2 rounded border border-neutral-700">
                    🎯 Khóa
                  </span>
                </div>
              </div>

              {/* Segmented Slim HP Gauge */}
              <div className="h-1.5 sm:h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-red-900/80 shadow-inner mt-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-150 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  style={{ width: `${Math.max(0, Math.min(100, (bossHp.current / bossHp.max) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            <div 
              className="text-[7.5px] sm:text-[9px] font-bold px-2 py-0.5 rounded-lg border border-neutral-800 bg-neutral-950/80 flex items-center gap-1 shadow-sm shrink-0"
              style={{ color: currentMap.accentColor }}
            >
              <MapPin className="w-2.5 h-2.5" />
              <span>{currentMap.nameVi}</span>
            </div>
          )}

          {/* Tactical Controls (Zoom 0.7x, Auto-Aim, Sound, Pause) aligned on the same row */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Camera FOV Zoom Toggle Button */}
            {onToggleCameraZoom && (
              <button
                onClick={onToggleCameraZoom}
                className="px-1.5 py-0.5 sm:py-1 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-[8px] sm:text-[10px] font-black text-cyan-300 backdrop-blur-md shadow-sm active:scale-95 flex items-center gap-0.5"
                title="Thay đổi góc nhìn camera (Siêu rộng / Rộng / Chuẩn)"
              >
                <span>🔍</span>
                <span>{cameraZoomMode === 'ultrawide' ? '0.5x' : cameraZoomMode === 'wide' ? '0.7x' : '1.0x'}</span>
              </button>
            )}

            {/* Auto-Aim Quick Toggle */}
            {onToggleAutoAim && (
              <button
                onClick={onToggleAutoAim}
                className={`px-1.5 py-0.5 sm:py-1 rounded-lg border text-[8px] sm:text-[10px] font-black flex items-center gap-1 backdrop-blur-md shadow-sm transition-all active:scale-95 ${
                  autoAimEnabled
                    ? 'bg-emerald-500/25 border-emerald-400/80 text-emerald-300'
                    : 'bg-neutral-900/90 border-neutral-700 text-neutral-400'
                }`}
                title="Bật/Tắt Tự Động Khóa Quái Gần Nhất"
              >
                <Crosshair className={`w-2.5 h-2.5 ${autoAimEnabled ? 'text-emerald-400 animate-spin' : 'text-neutral-500'}`} style={{ animationDuration: '6s' }} />
                <span className="hidden sm:inline">{autoAimEnabled ? 'TỰ NGẮM' : 'TẮT'}</span>
              </button>
            )}

            <button
              onClick={onToggleMute}
              className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-md transition-all shadow-sm pointer-events-auto"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              <Radio className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isMuted ? 'text-neutral-500' : 'text-emerald-400'}`} />
            </button>

            <button
              onClick={onPause}
              className="px-2 py-0.5 sm:py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-md transition-all shadow-sm pointer-events-auto font-mono text-[8.5px] sm:text-[10px] font-bold"
              title="Tạm dừng game"
            >
              II
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING PROMPT: AUTO-DISMISSES AFTER 5 SECONDS */}
      {notification && (
        <div 
          onClick={onOpenShop}
          className="self-center cursor-pointer pointer-events-auto bg-amber-500/95 hover:bg-amber-400 text-neutral-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 animate-bounce relative group"
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-950 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
              {notification.title}
            </div>
            <div className="text-[8px] sm:text-[10px] font-bold text-neutral-900">
              {notification.subtitle}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotification(null);
            }}
            className="p-1 rounded-full hover:bg-neutral-950/20 text-neutral-900 ml-1 transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CENTER COMBO MULTIPLIER NOTIFICATION */}
      {player.combo > 1 && (
        <div className="self-center flex flex-col items-center gap-0.5 animate-bounce">
          <div className="text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {player.combo}x COMBO SÁT THỦ!
          </div>
          <div className="text-[9px] sm:text-[11px] text-amber-300 font-bold bg-neutral-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            +{Math.round((player.multiplier - 1) * 100)}% Điểm thưởng
          </div>
        </div>
      )}

      {/* ACTIVE POWER-UP BUFF TIMERS */}
      <div className="self-start flex flex-wrap items-center gap-1.5 pointer-events-auto ml-1">
        {activeBuffs.doubleDamageTimer > 0 && (
          <div className="flex items-center gap-1 bg-red-950/90 border border-red-500/60 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold text-red-200 backdrop-blur-md shadow-lg shadow-red-500/20 animate-pulse">
            <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            <span>x2 DAMAGE:</span>
            <span className="font-mono text-white">{(activeBuffs.doubleDamageTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.speedBoostTimer > 0 && (
          <div className="flex items-center gap-1 bg-amber-950/90 border border-amber-500/60 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold text-amber-200 backdrop-blur-md shadow-lg shadow-amber-500/20">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
            <span>TỐC ĐỘ:</span>
            <span className="font-mono text-white">{(activeBuffs.speedBoostTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.freezeEnemiesTimer > 0 && (
          <div className="flex items-center gap-1 bg-cyan-950/90 border border-cyan-500/60 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold text-cyan-200 backdrop-blur-md shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <span>ĐÓNG BĂNG:</span>
            <span className="font-mono text-white">{(activeBuffs.freezeEnemiesTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.shieldTimer > 0 && (
          <div className="flex items-center gap-1 bg-indigo-950/90 border border-indigo-500/60 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold text-indigo-200 backdrop-blur-md shadow-lg shadow-indigo-500/20">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
            <span>BẤT TỬ:</span>
            <span className="font-mono text-white">{(activeBuffs.shieldTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Desktop Only Full Weapon Info (Hidden on Mobile to keep screen 100% clean) */}
      <div className="hidden sm:flex flex-col gap-2 w-full max-w-7xl mx-auto pointer-events-auto pb-0">
        <div className="flex items-end justify-between gap-4 w-full">
          {/* Left: Grenades & Quick Keybinds */}
          <div className="flex items-center gap-2">
            <button
              onClick={onThrowGrenade}
              disabled={player.grenadeCount <= 0}
              className={`p-2.5 sm:p-3 rounded-2xl backdrop-blur-md border flex flex-col items-center gap-1 shadow-2xl transition-all ${
                player.grenadeCount > 0
                  ? 'bg-neutral-950/85 hover:bg-neutral-900 border-amber-500/50 text-amber-400 hover:scale-105 active:scale-95'
                  : 'bg-neutral-950/50 border-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
              title="Ném Lựu đạn (Phím G hoặc E)"
            >
              <div className="flex items-center gap-1">
                <Bomb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="font-black text-xs sm:text-sm font-mono text-white">x{player.grenadeCount}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-neutral-400">Lựu đạn [G/E]</span>
            </button>
          </div>

          {/* Right: Active Weapon & Ammo HUD */}
          <div className="bg-neutral-950/90 backdrop-blur-md p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-800 shadow-2xl flex items-center gap-3 sm:gap-4 ml-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">VŨ KHÍ</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  LV.{currentWeapon.level}
                </span>
              </div>
              <span className="text-sm sm:text-lg font-black text-white flex items-center gap-1 sm:gap-1.5 truncate max-w-[120px] sm:max-w-none" style={{ color: currentWeapon.color }}>
                <Crosshair className="w-4 h-4 shrink-0" />
                {currentWeapon.nameVi}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                ST: {currentWeapon.damage} • {(1000 / currentWeapon.fireRate).toFixed(1)}v/s
              </span>
            </div>

            <div className="h-8 sm:h-10 w-[1px] bg-neutral-800" />

            {/* Ammo Display */}
            <div className="flex flex-col items-end min-w-[70px] sm:min-w-[80px]">
              {isReloading ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-amber-400" /> NẠP...
                  </span>
                  <div className="h-1.5 sm:h-2 w-16 sm:w-24 bg-neutral-900 rounded-full overflow-hidden border border-amber-900/60">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-75 rounded-full"
                      style={{ width: `${reloadProgress * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl sm:text-3xl font-black font-mono ${
                    currentWeapon.currentMag <= currentWeapon.magSize * 0.25 ? 'text-red-500 animate-pulse' : 'text-white'
                  }`}>
                    {currentWeapon.currentMag}
                  </span>
                  <span className="text-neutral-500 font-mono text-xs sm:text-sm">
                    / {currentWeapon.reserveAmmo === -1 ? '∞' : currentWeapon.reserveAmmo}
                  </span>
                </div>
              )}
              <span className="text-[9px] text-neutral-500 uppercase font-semibold">Phím [R] Nạp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
