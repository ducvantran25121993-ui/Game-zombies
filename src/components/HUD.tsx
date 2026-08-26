import React, { useMemo } from 'react';
import { PlayerStats, Weapon, WeaponType, ActiveBuffs } from '../types/game';
import { 
  Heart, Shield, Zap, Crosshair, RefreshCw, 
  Flame, Skull, DollarSign, Award, Bomb, Radio,
  Clock, ShieldAlert, Sparkles, UserCheck, Lock, ShoppingCart
} from 'lucide-react';
import { WARRIOR_CLASSES } from '../data/warriors';

interface HUDProps {
  player: PlayerStats;
  weapons: Record<string, Weapon>;
  currentWeapon: Weapon;
  currentWeaponId: WeaponType;
  wave: number;
  totalZombiesInWave: number;
  zombiesRemaining: number;
  bossHp?: { current: number; max: number; name: string } | null;
  activeBuffs: ActiveBuffs;
  isReloading: boolean;
  reloadProgress: number;
  onOpenShop: () => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onThrowGrenade: () => void;
  onSelectWeapon: (weaponId: WeaponType) => void;
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
  isReloading,
  reloadProgress,
  onOpenShop,
  onPause,
  isMuted,
  onToggleMute,
  onThrowGrenade,
  onSelectWeapon
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const armorPercent = Math.max(0, Math.min(100, (player.armor / player.maxArmor) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (player.stamina / player.maxStamina) * 100));
  const waveProgress = totalZombiesInWave > 0 
    ? Math.max(0, Math.min(100, ((totalZombiesInWave - zombiesRemaining) / totalZombiesInWave) * 100))
    : 0;

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

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* Red Low HP Vignette Warning */}
      {isLowHp && (
        <div className="absolute inset-0 border-8 border-red-600/40 animate-pulse pointer-events-none shadow-[inset_0_0_60px_rgba(239,68,68,0.5)]" />
      )}

      {/* TOP HEADER: Player Vitals & Wave Info */}
      <div className="flex items-start justify-between gap-3 w-full max-w-7xl mx-auto pointer-events-auto">
        {/* Left: Warrior Avatar & Health, Armor, Stamina */}
        <div className="flex items-center gap-3 bg-neutral-950/85 backdrop-blur-md p-3 rounded-2xl border border-neutral-800/80 shadow-2xl min-w-[240px] md:min-w-[320px]">
          {/* Warrior Portrait with Tactical Glow */}
          {(() => {
            const currentWarrior = WARRIOR_CLASSES.find(w => w.id === (player.warriorSkin || 'commando')) || WARRIOR_CLASSES[0];
            return (
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-md shrink-0 bg-neutral-900">
                <img 
                  src={currentWarrior.avatar} 
                  alt={currentWarrior.nameVi}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 px-1 bg-amber-500 text-[8px] font-black text-neutral-950 rounded-bl">
                  LV.{1 + (player.upgrades.maxHpLevel || 0) + (player.upgrades.bulletDamageLevel || 0)}
                </div>
              </div>
            );
          })()}

          <div className="flex-1 flex flex-col gap-1.5">
            {/* Health Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-red-400">
                  <Heart className={`w-3.5 h-3.5 fill-red-500 text-red-500 ${isLowHp ? 'animate-bounce' : ''}`} />
                  HP
                </span>
                <span className="text-neutral-300 font-mono text-[11px]">
                  {Math.ceil(player.hp)} / {player.maxHp}
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-red-950/60 relative">
                <div 
                  className={`h-full transition-all duration-200 rounded-full ${
                    isLowHp ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse' : 'bg-gradient-to-r from-red-700 to-emerald-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Armor Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1 text-sky-400">
                  <Shield className="w-3 h-3 text-sky-400" />
                  GIÁP
                </span>
                <span className="text-neutral-300 font-mono text-[10px]">
                  {Math.ceil(player.armor)} / {player.maxArmor}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-sky-950/60">
                <div 
                  className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-200 rounded-full"
                  style={{ width: `${armorPercent}%` }}
                />
              </div>
            </div>

            {/* Stamina / Dash */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[9px] font-semibold text-amber-400">
                <span className="flex items-center gap-0.5">
                  <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                  LƯỚT [SPACE]
                </span>
                <span className="text-neutral-400 font-mono">{Math.floor(staminaPercent)}%</span>
              </div>
              <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Wave Indicator & Boss HP */}
        <div className="flex flex-col items-center gap-2 max-w-xs md:max-w-md w-full">
          {/* Boss Bar if present */}
          {bossHp && (
            <div className="w-full bg-red-950/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse">
              <div className="flex items-center justify-between text-xs font-black text-red-200 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1.5 text-red-400">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  {bossHp.name}
                </span>
                <span className="font-mono">{Math.ceil(bossHp.current)} / {bossHp.max} HP</span>
              </div>
              <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden border border-red-800">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (bossHp.current / bossHp.max) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Wave Banner */}
          <div className="bg-neutral-950/85 backdrop-blur-md px-5 py-2 rounded-2xl border border-neutral-800 shadow-xl flex flex-col items-center min-w-[170px]">
            <div className="text-amber-400 text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-amber-500" />
              ĐỢT TẤN CÔNG {wave}
            </div>
            <div className="text-[11px] text-neutral-300 font-medium mt-0.5">
              Còn lại: <span className="text-red-400 font-bold font-mono">{zombiesRemaining}</span> quái
            </div>
            {/* Wave progress bar */}
            <div className="h-1.5 w-32 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${waveProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Gold, Score, Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-neutral-950/85 backdrop-blur-md p-3 rounded-2xl border border-neutral-800/80 shadow-2xl flex flex-col gap-1.5 min-w-[130px] md:min-w-[160px]">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1 text-amber-400">
                <DollarSign className="w-4 h-4" /> TIỀN VÀNG:
              </span>
              <span className="text-amber-300 font-mono text-sm">{player.gold}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-neutral-300">
              <span className="flex items-center gap-1 text-neutral-400">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> ĐIỂM:
              </span>
              <span className="text-white font-mono text-sm">{player.score}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-neutral-400">
              <span className="flex items-center gap-1">
                <Skull className="w-3 h-3 text-red-400" /> Đã diệt:
              </span>
              <span className="text-neutral-200 font-mono">{player.kills}</span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-md transition-all shadow-lg pointer-events-auto"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              <Radio className={`w-4 h-4 ${isMuted ? 'text-neutral-500' : 'text-emerald-400'}`} />
            </button>
            
            {/* Shop Button with notification badge */}
            <button
              onClick={onOpenShop}
              className={`relative px-3.5 py-2 rounded-xl text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all active:scale-95 pointer-events-auto ${
                canAffordAnything
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 shadow-amber-500/40 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/20'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>CỬA HÀNG (B)</span>
              {canAffordAnything && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 border-2 border-neutral-950 rounded-full animate-ping" />
              )}
            </button>

            <button
              onClick={onPause}
              className="p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 backdrop-blur-md transition-all shadow-lg pointer-events-auto font-mono text-xs font-bold"
              title="Tạm dừng game"
            >
              II
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING PROMPT WHEN AFFORDABLE WEAPON IS AVAILABLE */}
      {affordableLockedWeapon && (
        <div 
          onClick={onOpenShop}
          className="self-center cursor-pointer pointer-events-auto bg-amber-500/90 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-2xl border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 animate-bounce"
        >
          <ShoppingCart className="w-5 h-5 text-neutral-950" />
          <div className="text-left">
            <div className="text-xs font-black uppercase tracking-wider">
              ĐỦ VÀNG MUA: {affordableLockedWeapon.nameVi} ({affordableLockedWeapon.cost}V)!
            </div>
            <div className="text-[10px] font-bold text-neutral-900">
              Nhấn phím [B] hoặc bấm vào đây để mở Kho Súng & Nâng Cấp
            </div>
          </div>
        </div>
      )}

      {/* CENTER COMBO MULTIPLIER NOTIFICATION */}
      {player.combo > 1 && (
        <div className="self-center flex flex-col items-center gap-0.5 animate-bounce">
          <div className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            {player.combo}x COMBO SÁT THỦ!
          </div>
          <div className="text-[11px] text-amber-300 font-bold bg-neutral-950/80 px-3 py-0.5 rounded-full border border-amber-500/40">
            +{Math.round((player.multiplier - 1) * 100)}% Điểm thưởng
          </div>
        </div>
      )}

      {/* ACTIVE POWER-UP BUFF TIMERS */}
      <div className="self-start flex flex-wrap items-center gap-2 pointer-events-auto ml-1">
        {activeBuffs.doubleDamageTimer > 0 && (
          <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/60 px-3 py-1.5 rounded-xl text-xs font-bold text-red-200 backdrop-blur-md shadow-lg shadow-red-500/20 animate-pulse">
            <Flame className="w-4 h-4 text-red-400" />
            <span>x2 SÁT THƯƠNG:</span>
            <span className="font-mono text-white">{(activeBuffs.doubleDamageTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.speedBoostTimer > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/60 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 backdrop-blur-md shadow-lg shadow-amber-500/20">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>TỐC ĐỘ CAO:</span>
            <span className="font-mono text-white">{(activeBuffs.speedBoostTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.freezeEnemiesTimer > 0 && (
          <div className="flex items-center gap-1.5 bg-cyan-950/90 border border-cyan-500/60 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-200 backdrop-blur-md shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ĐÓNG BĂNG:</span>
            <span className="font-mono text-white">{(activeBuffs.freezeEnemiesTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
        {activeBuffs.shieldTimer > 0 && (
          <div className="flex items-center gap-1.5 bg-indigo-950/90 border border-indigo-500/60 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-200 backdrop-blur-md shadow-lg shadow-indigo-500/20">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>BẤT TỬ:</span>
            <span className="font-mono text-white">{(activeBuffs.shieldTimer / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Active Weapon, Ammo, Grenades */}
      <div className="flex flex-col gap-2 w-full max-w-7xl mx-auto pointer-events-auto pb-14 sm:pb-0">
        {/* BOTTOM ROW: Grenades + Active Weapon Status */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 w-full">
          {/* Left: Grenades & Quick Keybinds (Desktop only, mobile has virtual button) */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Grenade Button */}
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
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
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
              <span className="text-[9px] text-neutral-500 uppercase font-semibold hidden sm:inline">Phím [R] Nạp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
