import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Weapon, WeaponType } from '../types/game';
import { 
  Crosshair, RefreshCw, Zap, Bomb, ChevronRight, ChevronLeft, 
  ShoppingCart, Smartphone, Sparkles, Target, Flame, ShieldAlert,
  Volume2, VolumeX, Eye, EyeOff
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface VirtualControlsProps {
  onMove: (dx: number, dy: number) => void;
  onAim: (angle: number, isShooting: boolean) => void;
  onDash: () => void;
  onReload: () => void;
  onThrowGrenade: () => void;
  onNextWeapon: () => void;
  onPrevWeapon: () => void;
  onSelectWeapon?: (weaponId: WeaponType) => void;
  weapons: Record<string, Weapon>;
  currentWeaponId: WeaponType;
  grenadesLeft: number;
  onOpenShop?: () => void;
  canAffordShop?: boolean;
  autoAimEnabled?: boolean;
  onToggleAutoAim?: () => void;
  isReloading?: boolean;
  reloadProgress?: number;
  playerStamina?: number;
  maxStamina?: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMove,
  onAim,
  onDash,
  onReload,
  onThrowGrenade,
  onNextWeapon,
  onPrevWeapon,
  onSelectWeapon,
  weapons,
  currentWeaponId,
  grenadesLeft,
  onOpenShop,
  canAffordShop = false,
  autoAimEnabled = true,
  onToggleAutoAim,
  isReloading = false,
  reloadProgress = 0,
  playerStamina = 100,
  maxStamina = 100
}) => {
  const leftZoneRef = useRef<HTMLDivElement>(null);
  const rightZoneRef = useRef<HTMLDivElement>(null);

  // Left Joystick States
  const [leftStickActive, setLeftStickActive] = useState(false);
  const [leftStickOrigin, setLeftStickOrigin] = useState({ x: 100, y: 100 });
  const [leftThumbOffset, setLeftThumbOffset] = useState({ x: 0, y: 0 });
  const leftTouchId = useRef<number | null>(null);

  // Right Joystick States
  const [rightStickActive, setRightStickActive] = useState(false);
  const [rightStickOrigin, setRightStickOrigin] = useState({ x: 100, y: 100 });
  const [rightThumbOffset, setRightThumbOffset] = useState({ x: 0, y: 0 });
  const rightTouchId = useRef<number | null>(null);

  // Auto-detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [stickMode, setStickMode] = useState<'dynamic' | 'fixed'>('dynamic');

  useEffect(() => {
    const detect = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
      setIsTouchDevice(hasTouch);
    };
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  const MAX_RADIUS = 52;

  // =========================================================================
  // LEFT JOYSTICK (DYNAMIC / TOUCH ANYWHERE ON LEFT HALF)
  // =========================================================================
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (leftTouchId.current !== null) return;

    leftTouchId.current = touch.identifier;
    const rect = leftZoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localX = touch.clientX - rect.left;
    const localY = touch.clientY - rect.top;

    setLeftStickOrigin({ x: localX, y: localY });
    setLeftThumbOffset({ x: 0, y: 0 });
    setLeftStickActive(true);
  };

  const handleLeftTouchMove = (e: React.TouchEvent) => {
    if (leftTouchId.current === null || !leftZoneRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === leftTouchId.current) {
        const rect = leftZoneRef.current.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        const dx = currentX - leftStickOrigin.x;
        const dy = currentY - leftStickOrigin.y;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) {
          setLeftThumbOffset({ x: 0, y: 0 });
          onMove(0, 0);
          return;
        }

        const clamped = Math.min(dist, MAX_RADIUS);
        const nx = (dx / dist) * clamped;
        const ny = (dy / dist) * clamped;

        setLeftThumbOffset({ x: nx, y: ny });
        onMove(nx / MAX_RADIUS, ny / MAX_RADIUS);
        break;
      }
    }
  };

  const handleLeftTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === leftTouchId.current) {
        leftTouchId.current = null;
        setLeftStickActive(false);
        setLeftThumbOffset({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // =========================================================================
  // RIGHT JOYSTICK (MANUAL AIM & SHOOT ON RIGHT HALF)
  // =========================================================================
  const handleRightTouchStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (rightTouchId.current !== null) return;

    rightTouchId.current = touch.identifier;
    const rect = rightZoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localX = touch.clientX - rect.left;
    const localY = touch.clientY - rect.top;

    setRightStickOrigin({ x: localX, y: localY });
    setRightThumbOffset({ x: 0, y: 0 });
    setRightStickActive(true);
  };

  const handleRightTouchMove = (e: React.TouchEvent) => {
    if (rightTouchId.current === null || !rightZoneRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === rightTouchId.current) {
        const rect = rightZoneRef.current.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        const dx = currentX - rightStickOrigin.x;
        const dy = currentY - rightStickOrigin.y;
        const dist = Math.hypot(dx, dy);

        const angle = Math.atan2(dy, dx);
        const clamped = Math.min(dist, MAX_RADIUS);
        const nx = (dx / (dist || 1)) * clamped;
        const ny = (dy / (dist || 1)) * clamped;

        setRightThumbOffset({ x: nx, y: ny });
        // Firing when dragged beyond slight deadzone
        const isFiring = dist > 10;
        onAim(angle, isFiring);
        break;
      }
    }
  };

  const handleRightTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightTouchId.current) {
        rightTouchId.current = null;
        setRightStickActive(false);
        setRightThumbOffset({ x: 0, y: 0 });
        onAim(0, false);
        break;
      }
    }
  };

  // Get unlocked weapons array for quick 1-touch selector
  const unlockedWeaponList = (Object.values(weapons || {}) as Weapon[]).filter(w => w.unlocked);

  const staminaPct = Math.max(0, Math.min(100, (playerStamina / maxStamina) * 100));
  const canDash = playerStamina >= 30;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none font-sans">
      {controlsVisible && (
        <>
          {/* ===============================================================
              LEFT TOUCH ZONE (Dynamic Joystick - Appears directly under finger)
          ================================================================ */}
          <div
            ref={leftZoneRef}
            onTouchStart={handleLeftTouchStart}
            onTouchMove={handleLeftTouchMove}
            onTouchEnd={handleLeftTouchEnd}
            onTouchCancel={handleLeftTouchEnd}
            className="absolute left-0 bottom-0 w-1/2 h-2/3 pointer-events-auto touch-none"
          >
            {/* Minimalist Movement Base */}
            <div
              className={`absolute rounded-full border transition-opacity duration-150 flex items-center justify-center ${
                leftStickActive 
                  ? 'border-amber-400/80 bg-neutral-950/80 opacity-90 scale-100 shadow-xl shadow-amber-500/20' 
                  : 'border-neutral-700/30 bg-neutral-950/20 opacity-25 scale-90'
              }`}
              style={{
                width: 100,
                height: 100,
                left: leftStickActive ? leftStickOrigin.x - 50 : 25,
                top: leftStickActive ? leftStickOrigin.y - 50 : undefined,
                bottom: leftStickActive ? undefined : 25,
                pointerEvents: 'none'
              }}
            >
              {/* Center lines */}
              <div className="absolute w-full h-[1px] bg-neutral-700/40" />
              <div className="absolute h-full w-[1px] bg-neutral-700/40" />

              {/* Thumb Knob */}
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg border border-white/60 absolute flex items-center justify-center text-neutral-950 font-black text-[10px]"
                style={{
                  transform: `translate(${leftThumbOffset.x}px, ${leftThumbOffset.y}px)`
                }}
              >
                MOVE
              </div>
            </div>
          </div>

          {/* ===============================================================
              RIGHT TOUCH ZONE (Manual Aim JoyStick ONLY when Auto-Aim is OFF)
          ================================================================ */}
          {!autoAimEnabled && (
            <div
              ref={rightZoneRef}
              onTouchStart={handleRightTouchStart}
              onTouchMove={handleRightTouchMove}
              onTouchEnd={handleRightTouchEnd}
              onTouchCancel={handleRightTouchEnd}
              className="absolute right-0 bottom-0 w-1/2 h-2/3 pointer-events-auto touch-none"
            >
              <div
                className={`absolute rounded-full border-2 transition-opacity duration-150 flex items-center justify-center ${
                  rightStickActive 
                    ? 'border-red-500/90 bg-neutral-950/85 opacity-100 scale-100 shadow-2xl shadow-red-500/30' 
                    : 'border-red-900/40 bg-neutral-950/30 opacity-60 scale-95'
                }`}
                style={{
                  width: 100,
                  height: 100,
                  left: rightStickActive ? rightStickOrigin.x - 50 : undefined,
                  right: rightStickActive ? undefined : 25,
                  top: rightStickActive ? rightStickOrigin.y - 50 : undefined,
                  bottom: rightStickActive ? undefined : 25,
                  pointerEvents: 'none'
                }}
              >
                <Crosshair className={`w-6 h-6 ${rightStickActive ? 'text-red-400 animate-pulse' : 'text-red-900/40'}`} />

                {/* Thumb Knob */}
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-lg border border-white/60 absolute flex items-center justify-center text-white font-black text-[10px]"
                  style={{
                    transform: `translate(${rightThumbOffset.x}px, ${rightThumbOffset.y}px)`
                  }}
                >
                  FIRE
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              RIGHT HAND ERGONOMIC ACTION BUTTONS (Dash, Reload, Grenade, Shop)
          ================================================================ */}
          <div className="absolute right-3 bottom-3 pointer-events-auto flex flex-col items-end gap-2 z-40">
            <div className="flex items-center gap-2">
              {/* Quick Reload Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); onReload(); }}
                onClick={onReload}
                className={`px-3 py-2 rounded-xl border flex items-center gap-1 shadow-lg transition-transform active:scale-90 font-black text-[11px] backdrop-blur-md ${
                  isReloading
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-neutral-950/85 border-amber-500/50 text-amber-400 hover:bg-neutral-900'
                }`}
                title="Nạp đạn (R)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isReloading ? `${Math.round(reloadProgress * 100)}%` : 'NẠP'}</span>
              </button>

              {/* Quick Grenade Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); onThrowGrenade(); }}
                onClick={onThrowGrenade}
                disabled={grenadesLeft <= 0}
                className={`px-3 py-2 rounded-xl border flex items-center gap-1 shadow-lg transition-transform active:scale-90 font-black text-[11px] backdrop-blur-md ${
                  grenadesLeft > 0
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 border-red-400 text-white shadow-red-500/20'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-600 opacity-60'
                }`}
                title="Ném lựu đạn nổ diện rộng (G)"
              >
                <Bomb className="w-3.5 h-3.5" />
                <span className="font-mono">{grenadesLeft}</span>
              </button>

              {/* Quick Shop Modal Button */}
              {onOpenShop && (
                <button
                  onTouchStart={(e) => { e.stopPropagation(); onOpenShop(); }}
                  onClick={onOpenShop}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-1 shadow-lg transition-transform active:scale-90 font-black text-[11px] backdrop-blur-md ${
                    canAffordShop
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-200 text-neutral-950 animate-pulse shadow-yellow-500/30'
                      : 'bg-neutral-950/85 border-neutral-700 text-amber-400 hover:bg-neutral-900'
                  }`}
                  title="Mở Cửa Hàng Nâng Cấp (B)"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>SHOP</span>
                  {canAffordShop && (
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute -top-1 -right-1" />
                  )}
                </button>
              )}
            </div>

            {/* Prominent Large Dash Button */}
            <button
              onTouchStart={(e) => { e.stopPropagation(); onDash(); }}
              onClick={onDash}
              disabled={!canDash}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-1.5 shadow-xl transition-transform active:scale-90 font-black text-xs backdrop-blur-md relative overflow-hidden ${
                canDash
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 border-indigo-300 text-white shadow-indigo-500/30'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-600 opacity-60'
              }`}
              title="Lướt né đòn (Space)"
            >
              <Zap className={`w-4 h-4 ${canDash ? 'fill-white text-yellow-300' : 'text-neutral-600'}`} />
              <span>LƯỚT [SPACE]</span>

              {/* Micro Stamina Progress */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-300 transition-all"
                style={{ width: `${staminaPct}%` }}
              />
            </button>
          </div>

          {/* ===============================================================
              CENTER BOTTOM: 1-TOUCH COMPACT WEAPON BELT
          ================================================================ */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto z-40 max-w-[62vw] sm:max-w-none">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-950/90 border border-neutral-800/90 backdrop-blur-md shadow-2xl overflow-x-auto no-scrollbar">
              {unlockedWeaponList.map((wep) => {
                const isSelected = wep.id === currentWeaponId;
                const magPct = wep.magSize > 0 ? (wep.currentMag / wep.magSize) * 100 : 100;
                
                return (
                  <button
                    key={wep.id}
                    onClick={() => {
                      soundManager.playEmptyClick();
                      if (onSelectWeapon) onSelectWeapon(wep.id);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      soundManager.playEmptyClick();
                      if (onSelectWeapon) onSelectWeapon(wep.id);
                    }}
                    className={`relative p-1 sm:p-1.5 rounded-lg flex flex-col items-center min-w-[42px] sm:min-w-[50px] transition-all active:scale-90 ${
                      isSelected
                        ? 'bg-amber-500/30 border border-amber-400 text-white shadow-md'
                        : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-none">{wep.icon}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold font-mono truncate max-w-[38px] mt-0.5" style={{ color: wep.color }}>
                      {wep.nameVi.split(' ')[0]}
                    </span>

                    {/* Micro Ammo Bar */}
                    <div className="w-full h-0.5 bg-neutral-800 rounded-full mt-0.5 overflow-hidden">
                      <div 
                        className={`h-full ${magPct < 25 ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${magPct}%` }}
                      />
                    </div>

                    {/* Level Badge */}
                    <div className="absolute -top-1 -right-1 px-0.5 rounded bg-neutral-950 border border-amber-500/50 text-[7px] font-bold text-amber-300 font-mono leading-tight">
                      v{wep.level}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
