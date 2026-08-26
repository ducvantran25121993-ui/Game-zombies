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
      
      {/* -------------------------------------------------------------------
          TOP QUICK TOGGLE / MOBILE STATUS BAR (Discreet & Touch-Friendly)
      -------------------------------------------------------------------- */}
      <div className="absolute top-16 right-3 pointer-events-auto flex items-center gap-2 z-40">
        {/* Auto-Aim Assist Button */}
        {onToggleAutoAim && (
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              onToggleAutoAim();
            }}
            className={`px-2.5 py-1.5 rounded-full border text-[11px] font-black flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all active:scale-95 ${
              autoAimEnabled
                ? 'bg-emerald-500/25 border-emerald-400/80 text-emerald-300 shadow-emerald-500/20 animate-pulse'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-400'
            }`}
            title="Bật/Tắt Tự Động Khóa Quái Gần Nhất"
          >
            <Target className={`w-3.5 h-3.5 ${autoAimEnabled ? 'text-emerald-400 animate-spin' : 'text-neutral-500'}`} style={{ animationDuration: '6s' }} />
            <span>TỰ NGẮM: {autoAimEnabled ? 'BẬT' : 'TẮT'}</span>
          </button>
        )}

        {/* Toggle Controls Visibility Button */}
        <button
          onClick={() => setControlsVisible(prev => !prev)}
          className="p-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-300 backdrop-blur-md shadow-md active:scale-95"
          title="Ẩn/Hiện Phím Cảm Ứng"
        >
          {controlsVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
        </button>
      </div>

      {controlsVisible && (
        <>
          {/* ===============================================================
              LEFT TOUCH ZONE (Full Lower Left Quadrant for Dynamic Joystick)
          ================================================================ */}
          <div
            ref={leftZoneRef}
            onTouchStart={handleLeftTouchStart}
            onTouchMove={handleLeftTouchMove}
            onTouchEnd={handleLeftTouchEnd}
            onTouchCancel={handleLeftTouchEnd}
            className="absolute left-0 bottom-0 w-1/2 h-2/3 pointer-events-auto touch-none"
          >
            {/* Visual Movement Base when Active or Idle Indicator */}
            <div
              className={`absolute rounded-full border-2 transition-opacity duration-150 flex items-center justify-center ${
                leftStickActive 
                  ? 'border-amber-400/80 bg-neutral-950/80 opacity-100 scale-100 shadow-2xl shadow-amber-500/20' 
                  : 'border-neutral-700/50 bg-neutral-950/40 opacity-60 scale-95'
              }`}
              style={{
                width: 120,
                height: 120,
                left: leftStickActive ? leftStickOrigin.x - 60 : 40,
                top: leftStickActive ? leftStickOrigin.y - 60 : undefined,
                bottom: leftStickActive ? undefined : 40,
                pointerEvents: 'none'
              }}
            >
              {/* Center Crosshair lines */}
              <div className="absolute w-full h-[1px] bg-neutral-700/50" />
              <div className="absolute h-full w-[1px] bg-neutral-700/50" />
              <div className="absolute text-[9px] font-black text-amber-400/70 tracking-widest uppercase">
                {leftStickActive ? 'DI CHUYỂN' : 'CHẠM ĐỂ ĐI'}
              </div>

              {/* Thumb Knob */}
              <div
                className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl border-2 border-white/50 absolute flex items-center justify-center text-neutral-950 font-black text-[11px]"
                style={{
                  transform: `translate(${leftThumbOffset.x}px, ${leftThumbOffset.y}px)`
                }}
              >
                MOVE
              </div>
            </div>
          </div>

          {/* ===============================================================
              RIGHT TOUCH ZONE (Full Lower Right Quadrant for Aim & Shoot)
          ================================================================ */}
          <div
            ref={rightZoneRef}
            onTouchStart={handleRightTouchStart}
            onTouchMove={handleRightTouchMove}
            onTouchEnd={handleRightTouchEnd}
            onTouchCancel={handleRightTouchEnd}
            className="absolute right-0 bottom-0 w-1/2 h-2/3 pointer-events-auto touch-none"
          >
            {/* Visual Aim Stick Knob */}
            <div
              className={`absolute rounded-full border-2 transition-opacity duration-150 flex items-center justify-center ${
                rightStickActive 
                  ? 'border-red-500/90 bg-neutral-950/85 opacity-100 scale-100 shadow-2xl shadow-red-500/30' 
                  : 'border-red-900/40 bg-neutral-950/30 opacity-60 scale-95'
              }`}
              style={{
                width: 120,
                height: 120,
                left: rightStickActive ? rightStickOrigin.x - 60 : undefined,
                right: rightStickActive ? undefined : 40,
                top: rightStickActive ? rightStickOrigin.y - 60 : undefined,
                bottom: rightStickActive ? undefined : 40,
                pointerEvents: 'none'
              }}
            >
              {/* Crosshair Graphic */}
              <Crosshair className={`w-8 h-8 ${rightStickActive ? 'text-red-400 animate-pulse' : 'text-red-900/40'}`} />
              <div className="absolute bottom-2 text-[9px] font-black text-red-400/80 tracking-widest uppercase">
                {rightStickActive ? 'ĐANG BẮN' : autoAimEnabled ? 'TỰ KHÓA QUÁI' : 'KÉO ĐỂ BẮN'}
              </div>

              {/* Thumb Knob */}
              <div
                className="w-13 h-13 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-xl border-2 border-white/50 absolute flex items-center justify-center text-white font-black text-[11px]"
                style={{
                  transform: `translate(${rightThumbOffset.x}px, ${rightThumbOffset.y}px)`
                }}
              >
                FIRE
              </div>
            </div>
          </div>

          {/* ===============================================================
              CENTER BOTTOM: 1-TOUCH WEAPON BELT & ACTION SKILL BUTTONS
          ================================================================ */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 max-w-[95vw] z-40">
            
            {/* Quick 1-Touch Weapon Belt (Chạm 1 chạm chọn súng lập tức) */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-950/85 border border-neutral-800/90 backdrop-blur-md shadow-2xl overflow-x-auto max-w-[92vw] no-scrollbar">
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
                    className={`relative p-1.5 sm:p-2 rounded-xl flex flex-col items-center min-w-[50px] sm:min-w-[58px] transition-all active:scale-90 ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/30 to-amber-900/40 border-2 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-base sm:text-lg leading-none">{wep.icon}</span>
                    <span className="text-[9px] font-bold font-mono truncate max-w-[48px] mt-0.5" style={{ color: wep.color }}>
                      {wep.nameVi.split(' ')[0]}
                    </span>

                    {/* Ammo micro bar */}
                    <div className="w-full h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${magPct < 25 ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${magPct}%` }}
                      />
                    </div>

                    {/* Level Pill */}
                    <div className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-neutral-950 border border-amber-500/60 text-[8px] font-black text-amber-300 font-mono">
                      v{wep.level}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Tactical Combat Actions: Dash, Reload, Grenade, Shop */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Dash Button (Lướt) with Stamina Cooldown */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); onDash(); }}
                onClick={onDash}
                disabled={!canDash}
                className={`relative px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-1.5 shadow-xl transition-transform active:scale-90 font-black text-xs ${
                  canDash
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-indigo-500/30'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-600 opacity-60'
                }`}
                title="Lướt né đòn (Space)"
              >
                <Zap className={`w-4 h-4 ${canDash ? 'fill-white text-yellow-300 animate-bounce' : 'text-neutral-600'}`} />
                <span>LƯỚT</span>

                {/* Micro Stamina Ring */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-300 rounded-b-2xl transition-all"
                  style={{ width: `${staminaPct}%` }}
                />
              </button>

              {/* Quick Reload Button with Circular / Animated Bar */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); onReload(); }}
                onClick={onReload}
                className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-1.5 shadow-xl transition-transform active:scale-90 font-black text-xs ${
                  isReloading
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-neutral-900/90 border-amber-500/50 text-amber-400 hover:bg-neutral-800'
                }`}
                title="Nạp đạn (R)"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isReloading ? `${Math.round(reloadProgress * 100)}%` : 'NẠP'}</span>
              </button>

              {/* Quick Grenade Button */}
              <button
                onTouchStart={(e) => { e.stopPropagation(); onThrowGrenade(); }}
                onClick={onThrowGrenade}
                disabled={grenadesLeft <= 0}
                className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-1.5 shadow-xl transition-transform active:scale-90 font-black text-xs ${
                  grenadesLeft > 0
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 border-red-400 text-white shadow-red-500/30'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-600 opacity-60'
                }`}
                title="Ném lựu đạn nổ diện rộng (G)"
              >
                <Bomb className="w-4 h-4" />
                <span className="font-mono text-sm">{grenadesLeft}</span>
              </button>

              {/* Quick Shop / Armory Modal Button */}
              {onOpenShop && (
                <button
                  onTouchStart={(e) => { e.stopPropagation(); onOpenShop(); }}
                  onClick={onOpenShop}
                  className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border flex items-center gap-1.5 shadow-xl transition-transform active:scale-90 font-black text-xs ${
                    canAffordShop
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-200 text-neutral-950 animate-pulse shadow-yellow-500/40'
                      : 'bg-neutral-900/90 border-neutral-700 text-amber-400 hover:bg-neutral-800'
                  }`}
                  title="Mở Cửa Hàng Nâng Cấp (B)"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>SHOP</span>
                  {canAffordShop && (
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute -top-1 -right-1" />
                  )}
                </button>
              )}

            </div>
          </div>
        </>
      )}

    </div>
  );
};
