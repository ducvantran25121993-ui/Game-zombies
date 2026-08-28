import React, { useState } from 'react';
import { PlayerStats, Weapon, WeaponType } from '../types/game';
import { UPGRADES_CONFIG } from '../utils/constants';
import { 
  DollarSign, ShoppingCart, Crosshair, Heart, Shield, 
  Zap, RefreshCw, Target, Sword, Magnet, Bomb, Radio,
  Sparkles, Check, Lock, ChevronRight, X, UserCheck, Footprints,
  Bot, Cpu, Star, Flame
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { WARRIOR_CLASSES, WarriorClass } from '../data/warriors';
import { CompanionDroneConfig } from '../data/drones';

interface ShopModalProps {
  player: PlayerStats;
  weapons: Record<string, Weapon>;
  currentWeaponId: WeaponType;
  isOpen: boolean;
  onClose: () => void;
  onBuyWeapon: (weaponId: WeaponType) => void;
  onUpgradeWeapon: (weaponId: WeaponType) => void;
  onBuyAmmo: (weaponId: WeaponType) => void;
  onBuyPerk: (perkId: string) => void;
  onBuySupply: (type: 'heal' | 'armor' | 'grenade' | 'turret') => void;
  onSelectWarriorSkin?: (id: string) => void;
  unlockedWarriors?: string[];
  onUnlockWarrior?: (id: string, cost: number) => void;
  drones?: CompanionDroneConfig[];
  onUnlockDrone?: (droneId: string) => void;
  onUpgradeDrone?: (droneId: string) => void;
  onQuickUpgradeAll?: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  player,
  weapons,
  currentWeaponId,
  isOpen,
  onClose,
  onBuyWeapon,
  onUpgradeWeapon,
  onBuyAmmo,
  onBuyPerk,
  onBuySupply,
  onSelectWarriorSkin,
  unlockedWarriors = ['commando', 'ghost', 'cyber'],
  onUnlockWarrior,
  drones = [],
  onUnlockDrone,
  onUpgradeDrone,
  onQuickUpgradeAll
}) => {
  const [tab, setTab] = useState<'weapons' | 'drones' | 'warriors' | 'upgrades' | 'supplies'>('weapons');

  if (!isOpen) return null;

  const getPerkCost = (perkId: string, currentLevel: number) => {
    const config = UPGRADES_CONFIG.find(u => u.id === perkId);
    if (!config) return 9999;
    return Math.round(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  };

  const getDroneUpgradeCost = (drone: CompanionDroneConfig) => {
    return Math.round(drone.cost * 0.7 * Math.pow(1.5, drone.level));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[94vh] landscape:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-200">
        
        {/* HEADER */}
        <div className="p-3 sm:p-5 landscape:p-2.5 border-b border-neutral-800 flex flex-wrap items-center justify-between bg-neutral-950/70 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-3 landscape:p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 landscape:w-4 landscape:h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-2xl landscape:text-lg font-black text-white tracking-wider flex items-center gap-2">
                KHO VŨ KHÍ & NÂNG CẤP
              </h2>
              <p className="text-[11px] sm:text-xs landscape:hidden text-neutral-400">Tối ưu trang bị, mua drone & nâng cấp toàn diện</p>
            </div>
          </div>

          {/* Current Gold, Quick Upgrade Button & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onQuickUpgradeAll && (
              <button
                onClick={() => {
                  onQuickUpgradeAll();
                }}
                disabled={player.gold < 80}
                className={`px-3 py-1.5 sm:py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                  player.gold >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-amber-500/30 animate-pulse'
                    : 'bg-neutral-800 text-neutral-500 opacity-60 cursor-not-allowed'
                }`}
                title="Tự động nâng cấp tất cả kỹ năng và vũ khí phù hợp với số vàng hiện có"
              >
                <Zap className="w-4 h-4 fill-neutral-950" />
                <span className="hidden sm:inline">NÂNG CẤP NHANH</span>
                <span className="sm:hidden">NHANH</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 sm:px-3.5 py-1 sm:py-2 rounded-2xl text-amber-300 font-bold text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-mono text-sm sm:text-base font-black text-white">{player.gold}</span>
              <span className="text-[9px] sm:text-xs text-amber-400">VÀNG</span>
            </div>

            <button
              onClick={() => {
                soundManager.playEmptyClick();
                onClose();
              }}
              className="p-1.5 sm:p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1.5 sm:p-2 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('weapons')}
            className={`flex-1 min-w-[100px] sm:min-w-[110px] py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              tab === 'weapons' 
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Súng ({(Object.values(weapons) as Weapon[]).filter(w => w.unlocked).length}/{Object.keys(weapons).length})</span>
          </button>
          <button
            onClick={() => setTab('drones')}
            className={`flex-1 min-w-[100px] sm:min-w-[135px] py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              tab === 'drones' 
                ? 'bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-400/20 font-black' 
                : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-950/30'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Drone ({drones.filter(d => d.unlocked).length}/{drones.length})</span>
          </button>
          <button
            onClick={() => setTab('warriors')}
            className={`flex-1 min-w-[100px] sm:min-w-[110px] py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              tab === 'warriors' 
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Chiến Binh ({WARRIOR_CLASSES.length})</span>
          </button>
          <button
            onClick={() => setTab('upgrades')}
            className={`flex-1 min-w-[90px] sm:min-w-[110px] py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              tab === 'upgrades' 
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Kỹ Năng</span>
          </button>
          <button
            onClick={() => setTab('supplies')}
            className={`flex-1 min-w-[90px] sm:min-w-[110px] py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              tab === 'supplies' 
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Bomb className="w-4 h-4" />
            <span>Tiếp Tế</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* TAB: DRONES COMPANIONS */}
          {tab === 'drones' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-cyan-200">KHO ROBO TÁC CHIẾN HỘ TỐNG</h4>
                    <p className="text-xs text-neutral-400">Mua Robo trong cửa hàng để đồng hành chiến đấu. Khi mua, Robo sẽ tự động bay lơ lửng bọc hậu, hộ tống và nã đạn bảo vệ bạn!</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-900/60 px-3 py-1.5 rounded-xl border border-cyan-500/40 shrink-0">
                  {drones.filter(d => d.unlocked).length}/{drones.length} ĐÃ SỞ HỮU
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drones.map((drone) => {
                  const upgradeCost = getDroneUpgradeCost(drone);
                  const canBuy = !drone.unlocked && player.gold >= drone.cost;
                  const canUpgrade = drone.unlocked && drone.level < drone.maxLevel && player.gold >= upgradeCost;
                  const isMaxLevel = drone.level >= drone.maxLevel;

                  return (
                    <div 
                      key={drone.id}
                      className={`relative p-4 md:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        drone.unlocked
                          ? 'bg-neutral-900/90 border-cyan-500/40 shadow-xl shadow-cyan-950/30'
                          : 'bg-neutral-950/70 border-neutral-800/80 opacity-90'
                      }`}
                    >
                      <div>
                        {/* Header & Badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
                              style={{ 
                                backgroundColor: `${drone.color}22`,
                                borderColor: drone.glowColor
                              }}
                            >
                              <Bot className="w-6 h-6" style={{ color: drone.glowColor }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm md:text-base text-white">{drone.nameVi}</h3>
                                <span 
                                  className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                                  style={{ 
                                    backgroundColor: `${drone.color}33`,
                                    color: drone.glowColor,
                                    border: `1px solid ${drone.glowColor}55`
                                  }}
                                >
                                  {drone.codename}
                                </span>
                              </div>
                              <p className="text-xs text-cyan-300/80 font-medium">{drone.subtitleVi}</p>
                            </div>
                          </div>

                          {drone.unlocked && (
                            <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-xl">
                              <Check className="w-3 h-3" /> ĐANG HỘ VỆ
                            </span>
                          )}
                        </div>

                        {/* Level Stars & Description */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(lvl => (
                              <Star 
                                key={lvl}
                                className={`w-3.5 h-3.5 ${
                                  drone.unlocked && lvl <= drone.level 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-neutral-700'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-mono font-bold text-neutral-400 ml-1">
                              {drone.unlocked ? `Cấp ${drone.level}/${drone.maxLevel}` : 'Chưa Mở Khóa'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                          {drone.descVi}
                        </p>

                        {/* Stats Matrix */}
                        <div className="grid grid-cols-3 gap-2 bg-neutral-950/70 p-2.5 rounded-2xl border border-neutral-800/80 mb-3 text-center">
                          <div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase">Sát Thương</div>
                            <div className="text-xs font-mono font-black text-amber-300">
                              {drone.damage + (drone.level - 1) * 8} / phát
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase">Tốc Độ Bắn</div>
                            <div className="text-xs font-mono font-black text-cyan-300">
                              {Math.max(100, drone.fireRate - (drone.level - 1) * 25)}ms
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase">Tầm Quét</div>
                            <div className="text-xs font-mono font-black text-purple-300">
                              {drone.range + (drone.level - 1) * 30}px
                            </div>
                          </div>
                        </div>

                        {/* Abilities tags */}
                        <div className="space-y-1 mb-3">
                          {drone.abilitiesVi.map((ab, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: drone.glowColor }} />
                              <span>{ab}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-neutral-800/80">
                        {!drone.unlocked ? (
                          <button
                            onClick={() => onUnlockDrone && onUnlockDrone(drone.id)}
                            disabled={!canBuy}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                              canBuy
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-500/20 active:scale-95 font-black'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            {canBuy ? <DollarSign className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {canBuy ? `MUA ROBO CHIẾN ĐẤU (${drone.cost} VÀNG)` : `CẦN ${drone.cost} VÀNG ĐỂ MUA`}
                          </button>
                        ) : isMaxLevel ? (
                          <div className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black text-center uppercase tracking-wider">
                            ★ ĐÃ ĐẠT CẤP ĐỘ TỐI ĐA ★
                          </div>
                        ) : (
                          <button
                            onClick={() => onUpgradeDrone && onUpgradeDrone(drone.id)}
                            disabled={!canUpgrade}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                              canUpgrade
                                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/20 active:scale-95'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            NÂNG CẤP LÊN CẤP {drone.level + 1} ({upgradeCost} Vàng)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* TAB 1: WEAPONS */}
          {tab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.values(weapons) as Weapon[]).map((weapon) => {
                const upgradeCost = Math.round(weapon.cost * 0.6 * weapon.level) + 120;
                const ammoCost = Math.round(weapon.cost * 0.15) + 30;
                const isEquipped = currentWeaponId === weapon.id;

                return (
                  <div 
                    key={weapon.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      weapon.unlocked 
                        ? isEquipped
                          ? 'bg-neutral-800/80 border-amber-500/80 shadow-lg shadow-amber-500/10'
                          : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                        : 'bg-neutral-950/40 border-neutral-800/60 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: weapon.color }} />
                          <h3 className="font-bold text-base text-white">{weapon.nameVi}</h3>
                          {weapon.unlocked && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-amber-400">
                              LV.{weapon.level}
                            </span>
                          )}
                        </div>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-[10px] font-black text-neutral-950 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ĐANG DÙNG
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60 font-mono">
                        <div className="text-neutral-400">
                          Sát thương: <span className="text-white font-bold">{weapon.damage}</span>
                        </div>
                        <div className="text-neutral-400">
                          Băng đạn: <span className="text-white font-bold">{weapon.magSize}</span>
                        </div>
                        <div className="text-neutral-400">
                          Đạn dự trữ: <span className="text-white font-bold">{weapon.reserveAmmo}</span>
                        </div>
                        <div className="text-neutral-400">
                          Xuyên phá: <span className="text-white font-bold">{weapon.pierce}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {weapon.unlocked ? (
                        <>
                          <button
                            onClick={() => onUpgradeWeapon(weapon.id)}
                            disabled={player.gold < upgradeCost}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                              player.gold >= upgradeCost
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Nâng Cấp ({upgradeCost} V)
                          </button>
                          <button
                            onClick={() => onBuyAmmo(weapon.id)}
                            disabled={player.gold < ammoCost || weapon.reserveAmmo >= 999}
                            className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                              player.gold >= ammoCost && weapon.reserveAmmo < 999
                                ? 'bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black active:scale-95'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Mua Đạn ({ammoCost} V)
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onBuyWeapon(weapon.id)}
                          disabled={player.gold < weapon.cost}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            player.gold >= weapon.cost
                              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/20 active:scale-95'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <DollarSign className="w-4 h-4" /> Mở Khóa ({weapon.cost} Vàng)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: WARRIORS & SPECIAL OPERATIVES */}
          {tab === 'warriors' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WARRIOR_CLASSES.map((warrior) => {
                const isEquipped = (player.warriorSkin || 'commando') === warrior.id;
                return (
                  <div
                    key={warrior.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-neutral-800/90 border-amber-500 shadow-xl shadow-amber-500/10'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Avatar Image */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border border-neutral-700 shadow-md">
                        <img 
                          src={warrior.avatar} 
                          alt={warrior.nameVi}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neutral-950/80 text-[10px] font-black text-amber-400 border border-amber-500/30">
                          {warrior.codename}
                        </div>
                        {isEquipped && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" /> ĐANG TRANG BỊ
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base">{warrior.nameVi}</h4>
                      <span className="text-[11px] text-sky-400 font-semibold block mb-2">{warrior.titleVi}</span>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{warrior.descriptionVi}</p>

                      <div className="space-y-1 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800 text-[11px]">
                        <div className="flex justify-between items-center text-neutral-300">
                          <span>Máu khởi điểm:</span>
                          <span className="font-mono font-bold text-red-400">{Math.round(100 * warrior.perks.hpMultiplier)} HP</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-300">
                          <span>Giáp khởi điểm:</span>
                          <span className="font-mono font-bold text-sky-400">{Math.round(50 * warrior.perks.armorMultiplier)}</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-300">
                          <span>Đặc quyền:</span>
                          <span className="font-semibold text-amber-400 truncate max-w-[120px]">{warrior.bonusDesc}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playPowerUp();
                        if (onSelectWarriorSkin) {
                          onSelectWarriorSkin(warrior.id);
                        }
                      }}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isEquipped
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isEquipped ? 'ĐANG DÙNG' : 'TRANG BỊ NGAY'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: PASSIVE UPGRADES */}
          {tab === 'upgrades' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UPGRADES_CONFIG.map((perk) => {
                const currentLvl = (player.upgrades as any)[`${perk.id}Level`] || 0;
                const isMax = currentLvl >= perk.maxLevel;
                const cost = getPerkCost(perk.id, currentLvl);

                return (
                  <div 
                    key={perk.id}
                    className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{perk.icon}</span>
                          <div>
                            <h3 className="font-bold text-base text-white">{perk.nameVi}</h3>
                            <p className="text-xs text-neutral-400">{perk.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-amber-400">
                          {isMax ? 'TỐI ĐA' : `Cấp ${currentLvl}/${perk.maxLevel}`}
                        </span>
                      </div>

                      {/* Level Progress Bar */}
                      <div className="h-2 w-full bg-neutral-900 rounded-full mt-3 overflow-hidden border border-neutral-700">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-200" 
                          style={{ width: `${(currentLvl / perk.maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyPerk(perk.id)}
                      disabled={isMax || player.gold < cost}
                      className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isMax 
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : player.gold >= cost
                            ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/20 active:scale-95'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        'ĐÃ ĐẠT CẤP TỐI ĐA'
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" /> Nâng Cấp ({cost} Vàng)
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: SUPPLIES & DEFENSIVE TURRETS */}
          {tab === 'supplies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medkit Heal */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Hồi Phục Sinh Lực (Medkit)</h3>
                      <p className="text-xs text-neutral-400">Hồi ngay 50 HP (Không vượt quá giới hạn máu tối đa)</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBuySupply('heal')}
                  disabled={player.hp >= player.maxHp || player.gold < 100}
                  className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    player.hp < player.maxHp && player.gold >= 100
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> HỒI MÁU (100 Vàng)
                </button>
              </div>

              {/* Armor Repair */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Sửa Chữa Giáp Phòng Hộ</h3>
                      <p className="text-xs text-neutral-400">Hồi phục hoàn toàn 100% chỉ số Giáp hiện tại</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBuySupply('armor')}
                  disabled={player.armor >= player.maxArmor || player.gold < 120}
                  className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    player.armor < player.maxArmor && player.gold >= 120
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> HỒI GIÁP (120 Vàng)
                </button>
              </div>

              {/* Hand Grenades */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                      <Bomb className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Bổ Sung 3 Quả Lựu Đạn Nổ</h3>
                      <p className="text-xs text-neutral-400">Hiện có: {player.grenadeCount} quả lựu đạn sẵn sàng</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBuySupply('grenade')}
                  disabled={player.gold < 180}
                  className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    player.gold >= 180
                      ? 'bg-amber-600 hover:bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-600/20 active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> MUA 3 LỰU ĐẠN (180 Vàng)
                </button>
              </div>

              {/* Automatic Sentry Turret */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
                      <Radio className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Tháp Pháo Tự Động Sentry Gun</h3>
                      <p className="text-xs text-neutral-400">Triển khai 1 tháp súng tự động ngắm bắn zombie trong 30 giây</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBuySupply('turret')}
                  disabled={player.gold < 350}
                  className={`w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    player.gold >= 350
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 active:scale-95'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> TRIỂN KHAI TRỤ SÚNG (350 Vàng)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-xs text-neutral-400">Nhấn <kbd className="px-2 py-0.5 bg-neutral-800 rounded font-mono text-neutral-200">ESC</kbd> hoặc nút Đóng để quay lại trận chiến</span>
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            QUAY LẠI TRẬN CHIẾN
          </button>
        </div>

      </div>
    </div>
  );
};
