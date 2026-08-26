import React, { useRef, useState, useEffect } from 'react';
import { Weapon, WeaponType } from '../types/game';
import { Crosshair, RefreshCw, Zap, Bomb, ChevronRight, ChevronLeft, ShoppingCart, Smartphone, Sparkles } from 'lucide-react';

interface VirtualControlsProps {
  onMove: (dx: number, dy: number) => void;
  onAim: (angle: number, isShooting: boolean) => void;
  onDash: () => void;
  onReload: () => void;
  onThrowGrenade: () => void;
  onNextWeapon: () => void;
  onPrevWeapon: () => void;
  weapons: Record<string, Weapon>;
  currentWeaponId: WeaponType;
  grenadesLeft: number;
  onOpenShop?: () => void;
  canAffordShop?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMove,
  onAim,
  onDash,
  onReload,
  onThrowGrenade,
  onNextWeapon,
  onPrevWeapon,
  weapons,
  currentWeaponId,
  grenadesLeft,
  onOpenShop,
  canAffordShop
}) => {
  const leftStickRef = useRef<HTMLDivElement>(null);
  const rightStickRef = useRef<HTMLDivElement>(null);

  const [leftThumbPos, setLeftThumbPos] = useState({ x: 0, y: 0 });
  const [rightThumbPos, setRightThumbPos] = useState({ x: 0, y: 0 });

  const leftTouchId = useRef<number | null>(null);
  const rightTouchId = useRef<number | null>(null);

  // Auto-detect touch device (iPad, iPhone, Android, Tablet)
  const [isTouchEnabled, setIsTouchEnabled] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchEnabled(hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Left Joystick (Movement)
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    leftTouchId.current = touch.identifier;
    updateLeftStick(touch.clientX, touch.clientY);
  };

  const handleLeftTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === leftTouchId.current) {
        updateLeftStick(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  };

  const handleLeftTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === leftTouchId.current) {
        leftTouchId.current = null;
        setLeftThumbPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  const updateLeftStick = (clientX: number, clientY: number) => {
    if (!leftStickRef.current) return;
    const rect = leftStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 12;

    if (dist === 0) {
      setLeftThumbPos({ x: 0, y: 0 });
      onMove(0, 0);
      return;
    }

    const clampedDist = Math.min(dist, maxRadius);
    const nx = (dx / dist) * clampedDist;
    const ny = (dy / dist) * clampedDist;

    setLeftThumbPos({ x: nx, y: ny });
    onMove(nx / maxRadius, ny / maxRadius);
  };

  // Right Joystick (Aim & Shoot)
  const handleRightTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    rightTouchId.current = touch.identifier;
    updateRightStick(touch.clientX, touch.clientY, true);
  };

  const handleRightTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightTouchId.current) {
        updateRightStick(e.changedTouches[i].clientX, e.changedTouches[i].clientY, true);
        break;
      }
    }
  };

  const handleRightTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === rightTouchId.current) {
        rightTouchId.current = null;
        setRightThumbPos({ x: 0, y: 0 });
        onAim(0, false);
        break;
      }
    }
  };

  const updateRightStick = (clientX: number, clientY: number, isShooting: boolean) => {
    if (!rightStickRef.current) return;
    const rect = rightStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 12;

    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxRadius);
    const nx = (dx / (dist || 1)) * clampedDist;
    const ny = (dy / (dist || 1)) * clampedDist;

    setRightThumbPos({ x: nx, y: ny });
    onAim(angle, isShooting);
  };

  if (!isVisible) {
    return (
      <div className="absolute top-24 right-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="px-3 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/50 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>HIỆN NÚT CẢM ỨNG</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-end justify-between p-3 sm:p-5 pb-6">
      {/* LEFT VIRTUAL JOYSTICK (Movement) */}
      <div className="relative pointer-events-auto flex flex-col items-center select-none touch-none">
        <div
          ref={leftStickRef}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          onTouchEnd={handleLeftTouchEnd}
          onTouchCancel={handleLeftTouchEnd}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-neutral-950/75 border-2 border-neutral-700/80 backdrop-blur-md relative flex items-center justify-center shadow-2xl active:border-amber-500/80"
        >
          {/* Base Crosshairs */}
          <div className="absolute w-full h-[1px] bg-neutral-800" />
          <div className="absolute h-full w-[1px] bg-neutral-800" />
          {/* Directional Chevrons */}
          <div className="absolute top-2 text-[10px] font-bold text-neutral-500">W</div>
          <div className="absolute bottom-2 text-[10px] font-bold text-neutral-500">S</div>
          <div className="absolute left-2 text-[10px] font-bold text-neutral-500">A</div>
          <div className="absolute right-2 text-[10px] font-bold text-neutral-500">D</div>

          {/* Thumb Knob */}
          <div
            className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl border-2 border-white/40 absolute flex items-center justify-center text-neutral-950 font-black text-[11px] sm:text-xs pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${leftThumbPos.x}px, ${leftThumbPos.y}px)`
            }}
          >
            MOVE
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase mt-1 tracking-wider">DI CHUYỂN</span>
      </div>

      {/* QUICK TOUCH ACTION BUTTONS: Dash & Reload & Grenade & Weapons & Shop */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 mb-1 select-none">
        {/* Weapon Switching & Reload Row */}
        <div className="flex items-center gap-2 bg-neutral-950/70 p-1.5 rounded-full border border-neutral-800/80 backdrop-blur-md shadow-lg">
          <button
            onTouchStart={(e) => { e.preventDefault(); onPrevWeapon(); }}
            onClick={onPrevWeapon}
            className="p-2 sm:p-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white active:bg-neutral-700 active:scale-90 transition-transform"
            title="Súng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onReload(); }}
            onClick={onReload}
            className="px-3 py-2 sm:p-2.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-400 active:bg-amber-500 active:text-neutral-950 active:scale-90 transition-transform flex items-center gap-1 font-bold text-xs"
            title="Nạp đạn"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">NẠP</span>
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onNextWeapon(); }}
            onClick={onNextWeapon}
            className="p-2 sm:p-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white active:bg-neutral-700 active:scale-90 transition-transform"
            title="Súng kế tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Combat Skills Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Grenade Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onThrowGrenade(); }}
            onClick={onThrowGrenade}
            disabled={grenadesLeft <= 0}
            className={`p-2.5 sm:p-3 rounded-2xl border flex items-center gap-1.5 shadow-xl active:scale-90 transition-transform ${
              grenadesLeft > 0 
                ? 'bg-amber-600 border-amber-400 text-white font-black'
                : 'bg-neutral-900 border-neutral-800 text-neutral-600'
            }`}
          >
            <Bomb className="w-4 h-4" />
            <span className="text-xs font-mono font-bold">{grenadesLeft}</span>
          </button>

          {/* Quick Shop Button on Mobile / iPad */}
          {onOpenShop && (
            <button
              onTouchStart={(e) => { e.preventDefault(); onOpenShop(); }}
              onClick={onOpenShop}
              className={`p-2.5 sm:p-3 rounded-2xl border flex items-center gap-1.5 shadow-xl active:scale-90 transition-transform font-bold text-xs ${
                canAffordShop
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-yellow-200 text-neutral-950 animate-pulse'
                  : 'bg-neutral-900/90 border-neutral-700 text-amber-400'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>SHOP</span>
            </button>
          )}

          {/* Dash Skill Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onDash(); }}
            onClick={onDash}
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400 text-white active:scale-90 transition-transform shadow-xl font-bold flex items-center gap-1.5 text-xs"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>LƯỚT</span>
          </button>
        </div>
      </div>

      {/* RIGHT VIRTUAL JOYSTICK (Aim & Auto Fire) */}
      <div className="relative pointer-events-auto flex flex-col items-center select-none touch-none">
        <div
          ref={rightStickRef}
          onTouchStart={handleRightTouchStart}
          onTouchMove={handleRightTouchMove}
          onTouchEnd={handleRightTouchEnd}
          onTouchCancel={handleRightTouchEnd}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-neutral-950/75 border-2 border-red-900/80 backdrop-blur-md relative flex items-center justify-center shadow-2xl active:border-red-500/80"
        >
          {/* Base Crosshairs */}
          <div className="absolute w-full h-[1px] bg-red-950" />
          <div className="absolute h-full w-[1px] bg-red-950" />
          <Crosshair className="w-8 h-8 text-red-900/50 absolute pointer-events-none" />

          {/* Thumb Knob */}
          <div
            className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-red-600 to-rose-700 shadow-xl border-2 border-white/40 absolute flex items-center justify-center text-white font-black text-[11px] sm:text-xs pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${rightThumbPos.x}px, ${rightThumbPos.y}px)`
            }}
          >
            FIRE
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-red-400 font-bold uppercase mt-1 tracking-wider">NGẮM & BẮN</span>
      </div>
    </div>
  );
};
