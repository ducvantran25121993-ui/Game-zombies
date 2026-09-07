import React from 'react';
import { WeaponType } from '../types/game';
import { EquipmentSlotId } from '../types/game';

// ==========================================
// 1. WEAPON VISUAL ARTWORK (SÚNG)
// ==========================================
export const WeaponVisualArtwork: React.FC<{
  weaponId: WeaponType;
  color?: string;
  className?: string;
}> = ({ weaponId, color = '#f59e0b', className = 'w-full h-full' }) => {
  switch (weaponId) {
    case 'pistol':
      // M1911 Tactical Pistol
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Laser Sight Dot & Beam */}
          <line x1="148" y1="46" x2="160" y2="46" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="147" cy="46" r="1.5" fill="#ef4444" className="animate-ping" />

          {/* Slide (Thân trên) */}
          <path d="M30 32 H142 V48 H30 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <path d="M30 34 H70 V40 H30 Z" fill="#0f172a" />
          {/* Slide serrations */}
          <line x1="36" y1="35" x2="36" y2="45" stroke="#64748b" strokeWidth="1.5" />
          <line x1="42" y1="35" x2="42" y2="45" stroke="#64748b" strokeWidth="1.5" />
          <line x1="48" y1="35" x2="48" y2="45" stroke="#64748b" strokeWidth="1.5" />
          <line x1="54" y1="35" x2="54" y2="45" stroke="#64748b" strokeWidth="1.5" />

          {/* Barrel & Muzzle Compensator */}
          <rect x="142" y="36" width="8" height="9" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <circle cx="146" cy="40.5" r="2" fill="#0f172a" />

          {/* Lower Receiver & Frame */}
          <path d="M48 48 H128 V56 H72 L62 82 H38 L48 48 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          
          {/* Grip Texture */}
          <path d="M44 54 L36 78 H56 L64 54 Z" fill="#334155" />
          <circle cx="48" cy="62" r="2" fill="#64748b" />
          <circle cx="44" cy="72" r="2" fill="#64748b" />

          {/* Tactical Rail & Underbarrel Module */}
          <rect x="100" y="48" width="34" height="6" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <rect x="110" y="54" width="22" height="7" rx="1" fill="#1e293b" stroke={color} strokeWidth="1" />
          <circle cx="130" cy="57.5" r="1.5" fill={color} />

          {/* Trigger Guard & Trigger */}
          <path d="M68 56 C68 66 84 66 84 56" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M74 57 Q76 62 72 63" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* Sights */}
          <rect x="34" y="28" width="5" height="4" fill="#64748b" />
          <rect x="134" y="28" width="4" height="4" fill="#10b981" />
        </svg>
      );

    case 'shotgun':
      // SPAS-12 Combat Shotgun
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stock (Gập kim loại) */}
          <path d="M12 40 L34 44 V52 L12 46 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <line x1="12" y1="40" x2="34" y2="40" stroke="#64748b" strokeWidth="2" />
          <circle cx="34" cy="46" r="3" fill="#334155" stroke="#94a3b8" />

          {/* Receiver */}
          <rect x="34" y="40" width="42" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="52" y="44" width="14" height="6" rx="1" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
          {/* Shell chambered preview */}
          <rect x="54" y="45.5" width="8" height="3" rx="0.5" fill="#ef4444" />

          {/* Long Barrel & Tube Magazine */}
          <rect x="76" y="42" width="72" height="6" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          <rect x="76" y="49" width="62" height="5" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="138" y="48.5" width="4" height="6" rx="1" fill="#64748b" />

          {/* Ribbed Heat Shield */}
          <line x1="82" y1="39" x2="134" y2="39" stroke="#64748b" strokeWidth="1.5" />
          {[86, 94, 102, 110, 118, 126].map(x => (
            <circle key={x} cx={x} cy="45" r="1.5" fill="#0f172a" />
          ))}

          {/* Pump Handguard */}
          <rect x="90" y="48" width="28" height="9" rx="2" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
          <line x1="96" y1="48" x2="96" y2="57" stroke="#7c2d12" strokeWidth="1.5" />
          <line x1="102" y1="48" x2="102" y2="57" stroke="#7c2d12" strokeWidth="1.5" />
          <line x1="108" y1="48" x2="108" y2="57" stroke="#7c2d12" strokeWidth="1.5" />

          {/* Pistol Grip & Trigger */}
          <path d="M42 58 L36 82 H50 L56 58 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <path d="M56 58 C56 68 70 68 70 58" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M62 60 Q63 65 60 66" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* Muzzle flash hider */}
          <rect x="148" y="41" width="6" height="8" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );

    case 'ak47':
      // AK-47 Tactical Assault Rifle
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wooden / Polymer Stock */}
          <path d="M10 44 L38 42 V58 L12 62 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <line x1="14" y1="47" x2="34" y2="45" stroke="#d97706" strokeWidth="1" />

          {/* Receiver */}
          <rect x="38" y="40" width="44" height="17" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="42" y="42" width="22" height="6" fill="#0f172a" />
          {/* Bolt carrier handle */}
          <rect x="58" y="43" width="6" height="4" rx="1" fill="#94a3b8" />

          {/* Curved Banana Magazine */}
          <path d="M62 57 C64 68 54 82 42 85 L38 80 C48 76 54 66 52 57 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Mag grooves */}
          <path d="M44 76 C49 72 52 65 51 60" stroke="#334155" strokeWidth="1" />

          {/* Barrel & Gas Piston Tube */}
          <rect x="82" y="43" width="64" height="5" fill="#334155" stroke="#475569" strokeWidth="1" />
          <rect x="82" y="39" width="38" height="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />

          {/* Wooden Handguard */}
          <rect x="84" y="42" width="28" height="12" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.2" />

          {/* Pistol Grip & Trigger */}
          <path d="M42 57 L38 78 H48 L52 57 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <path d="M52 57 C52 66 64 66 64 57" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M58 59 Q59 64 56 65" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

          {/* Front Sight & Slanted Muzzle Brake */}
          <polygon points="138,43 140,34 143,34 144,43" fill="#475569" />
          <polygon points="146,43 152,41 152,48 146,48" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
        </svg>
      );

    case 'sniper':
      // Barrett .50 Cal Anti-Materiel Sniper Rifle
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy Skeleton Stock & Monopod */}
          <path d="M8 44 H34 V56 H18 L10 50 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="12" y="56" width="4" height="12" rx="1" fill="#334155" />

          {/* Receiver */}
          <rect x="34" y="42" width="44" height="16" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <rect x="42" y="58" width="18" height="16" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />

          {/* High Magnification Optical Scope */}
          <rect x="42" y="32" width="42" height="7" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Scope Mounts */}
          <rect x="48" y="39" width="5" height="3" fill="#64748b" />
          <rect x="72" y="39" width="5" height="3" fill="#64748b" />
          {/* Scope Lenses */}
          <ellipse cx="42" cy="35.5" rx="2" ry="3.5" fill="#38bdf8" />
          <ellipse cx="84" cy="35.5" rx="2.5" ry="4" fill="#0284c7" />

          {/* Long Heavy Fluted Barrel */}
          <rect x="78" y="45" width="66" height="6" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          <line x1="84" y1="48" x2="138" y2="48" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 3" />

          {/* Massive Arrowhead Muzzle Brake */}
          <path d="M144 43 L156 39 V57 L144 53 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="148" y1="44" x2="152" y2="43" stroke="#64748b" strokeWidth="2" />
          <line x1="148" y1="52" x2="152" y2="53" stroke="#64748b" strokeWidth="2" />

          {/* Bipod (Chân chống súng) */}
          <rect x="116" y="51" width="6" height="4" fill="#475569" />
          <line x1="117" y1="55" x2="108" y2="82" stroke="#64748b" strokeWidth="2" />
          <line x1="121" y1="55" x2="128" y2="82" stroke="#64748b" strokeWidth="2" />

          {/* Grip & Trigger */}
          <path d="M36 58 L32 78 H42 L48 58 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <path d="M48 58 C48 66 58 66 58 58" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M52 60 Q53 65 50 66" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'minigun':
      // M134 Vulcan 6-Barrel Gatling Gun
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual Top Carry Handles */}
          <path d="M26 36 H64 V44 H26 Z" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
          <rect x="36" y="28" width="22" height="8" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />

          {/* Heavy Motor Housing */}
          <rect x="22" y="44" width="46" height="24" rx="3" fill="#1e293b" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="45" cy="56" r="6" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
          {/* Gear rivets */}
          <circle cx="45" cy="56" r="2" fill="#eab308" />

          {/* Ammo Feed Chute & Belt */}
          <path d="M28 68 C28 78 18 84 10 82" stroke="#f59e0b" strokeWidth="4" strokeDasharray="3 1.5" />

          {/* 6 Rotary Barrels */}
          <rect x="68" y="46" width="76" height="3.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <rect x="68" y="50" width="76" height="3.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="68" y="54" width="76" height="3.5" fill="#475569" stroke="#64748b" strokeWidth="0.8" />
          <rect x="68" y="58" width="76" height="3.5" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="68" y="62" width="76" height="3.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />

          {/* Barrel Clamps & Support Rings */}
          <rect x="94" y="44" width="6" height="23" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <rect x="122" y="44" width="6" height="23" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <rect x="144" y="44" width="8" height="23" rx="1.5" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />

          {/* Spinning Energy Glow */}
          <line x1="148" y1="46" x2="152" y2="46" stroke="#fbbf24" strokeWidth="2" />
          <line x1="148" y1="55" x2="152" y2="55" stroke="#fbbf24" strokeWidth="2" />
          <line x1="148" y1="64" x2="152" y2="64" stroke="#fbbf24" strokeWidth="2" />
        </svg>
      );

    case 'rpg':
      // RPG-7 Rocket Propelled Grenade Launcher
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Exhaust Flared Funnel (Đuôi phóng phản lực) */}
          <polygon points="12,43 28,47 28,57 12,61" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />

          {/* Main Launch Tube */}
          <rect x="28" y="48" width="86" height="8" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />

          {/* Wooden Thermal Shield Sleeve */}
          <rect x="46" y="46" width="38" height="12" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
          <line x1="56" y1="46" x2="56" y2="58" stroke="#b45309" strokeWidth="1" />
          <line x1="68" y1="46" x2="68" y2="58" stroke="#b45309" strokeWidth="1" />

          {/* Dual Grip Handles */}
          <path d="M52 58 L48 78 H56 L60 58 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
          <path d="M80 58 L82 76 H88 L86 58 Z" fill="#334155" stroke="#475569" strokeWidth="1.2" />

          {/* Optical Sight */}
          <rect x="62" y="38" width="16" height="8" rx="1.5" fill="#0f172a" stroke="#a855f7" strokeWidth="1.2" />
          <circle cx="70" cy="42" r="2" fill="#c084fc" />

          {/* PG-7 Rocket Warhead (Đầu đạn hình thoi huyền thoại) */}
          <rect x="114" y="50" width="10" height="4" fill="#475569" />
          <path d="M124 52 L132 40 L146 52 L132 64 Z" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
          <polygon points="146,52 154,52 146,47" fill="#dc2626" />
          <polygon points="146,52 154,52 146,57" fill="#dc2626" />
          {/* Fuse Tip */}
          <line x1="154" y1="52" x2="158" y2="52" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      );

    case 'plasma':
      // Quantum Plasma Rifle X-1
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyber Futuristic Stock */}
          <path d="M14 42 H36 V58 H24 L14 52 Z" fill="#022c22" stroke="#06b6d4" strokeWidth="1.5" />
          <circle cx="25" cy="50" r="3" fill="#06b6d4" className="animate-pulse" />

          {/* Main Cyber Body */}
          <rect x="36" y="40" width="46" height="19" rx="3" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />

          {/* Glowing Plasma Battery Core */}
          <rect x="44" y="44" width="22" height="11" rx="2" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="48" y1="49.5" x2="62" y2="49.5" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="55" cy="49.5" r="4" fill="#a5f3fc" className="animate-ping" />

          {/* Dual Emitter Accelerator Rails */}
          <line x1="82" y1="44" x2="142" y2="44" stroke="#22d3ee" strokeWidth="2.5" />
          <line x1="82" y1="55" x2="142" y2="55" stroke="#22d3ee" strokeWidth="2.5" />

          {/* Magnetic Energy Rings */}
          {[92, 106, 120, 134].map(x => (
            <g key={x}>
              <ellipse cx={x} cy="49.5" rx="3" ry="8" fill="none" stroke="#06b6d4" strokeWidth="1.8" />
              <circle cx={x} cy="49.5" r="1.5" fill="#a5f3fc" />
            </g>
          ))}

          {/* Split Emitter Prongs */}
          <path d="M142 41 L154 36 V46 L146 45 Z" fill="#042f2e" stroke="#22d3ee" strokeWidth="1.5" />
          <path d="M142 58 L154 63 V53 L146 54 Z" fill="#042f2e" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="150" y1="42" x2="150" y2="57" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />

          {/* Grip & Trigger */}
          <path d="M46 59 L42 80 H52 L56 59 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        </svg>
      );

    case 'flamethrower':
      // Inferno Hellfire Flamethrower
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual Pressurized Fuel Cylinders (Bình nhiên liệu napalm) */}
          <rect x="18" y="32" width="34" height="15" rx="5" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
          <rect x="22" y="49" width="34" height="15" rx="5" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1.5" />
          {/* Pressure Gauge */}
          <circle cx="46" cy="39.5" r="3.5" fill="#fef08a" stroke="#7f1d1d" strokeWidth="1" />
          <line x1="46" y1="39.5" x2="48" y2="38" stroke="#b91c1c" strokeWidth="1" />

          {/* Fuel lines & Feed Tube */}
          <path d="M52 40 C68 40 68 54 78 54" stroke="#f97316" strokeWidth="3" fill="none" />
          <path d="M56 56 H78" stroke="#ea580c" strokeWidth="2" fill="none" />

          {/* Barrel & Insulated Heat Wrap */}
          <rect x="78" y="49" width="62" height="9" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          {[84, 92, 100, 108, 116, 124].map(x => (
            <line key={x} x1={x} y1="49" x2={x + 4} y2="58" stroke="#ca8a04" strokeWidth="1.5" />
          ))}

          {/* Nozzle Cone & Pilot Light Flame */}
          <polygon points="140,48 152,44 152,63 140,59" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
          {/* Pilot Ignition Torch */}
          <rect x="136" y="60" width="12" height="3" fill="#475569" />
          {/* Dancing Flame */}
          <path d="M152 53 Q156 50 159 52 Q162 48 160 54 Q157 58 152 55 Z" fill="#f97316" stroke="#fef08a" strokeWidth="1" className="animate-pulse" />

          {/* Handle & Trigger Guard */}
          <path d="M72 56 L68 78 H78 L82 56 Z" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" />
          <path d="M104 58 L106 74 H112 L110 58 Z" fill="#334155" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 2. DRONE VISUAL ARTWORK (ROBO HỘ VỆ)
// ==========================================
export const DroneVisualArtwork: React.FC<{
  droneId: string;
  type?: string;
  color?: string;
  glowColor?: string;
  className?: string;
}> = ({ droneId, color = '#06b6d4', glowColor = '#22d3ee', className = 'w-full h-full' }) => {
  switch (droneId) {
    case 'drone_vulcan':
      // Vulcan Quad-Rotor Hover Mech with Twin Miniguns
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rotor Arms */}
          <line x1="20" y1="30" x2="52" y2="48" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="30" x2="88" y2="48" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          
          {/* Spinning Rotors (Hào quang cánh quạt) */}
          <ellipse cx="20" cy="28" rx="18" ry="4" fill="none" stroke={glowColor} strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin" />
          <ellipse cx="120" cy="28" rx="18" ry="4" fill="none" stroke={glowColor} strokeWidth="1.5" strokeDasharray="3 2" className="animate-spin" />
          <circle cx="20" cy="28" r="3" fill="#0f172a" stroke={color} strokeWidth="1.5" />
          <circle cx="120" cy="28" r="3" fill="#0f172a" stroke={color} strokeWidth="1.5" />

          {/* Armored Central Chassis */}
          <polygon points="70,30 92,44 86,72 54,72 48,44" fill="#0f172a" stroke={color} strokeWidth="2" />
          <polygon points="70,36 84,46 70,64 56,46" fill="#1e293b" stroke={glowColor} strokeWidth="1" />

          {/* Central AI Eye / Scanner Core */}
          <circle cx="70" cy="50" r="7" fill="#083344" stroke={glowColor} strokeWidth="2" />
          <circle cx="70" cy="50" r="3.5" fill={glowColor} className="animate-ping" />

          {/* Twin Underhung Gatling Cannons */}
          <g>
            <rect x="42" y="68" width="8" height="22" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
            <line x1="44" y1="74" x2="44" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="48" y1="74" x2="48" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="42" y="88" width="8" height="3" fill="#0f172a" />
          </g>
          <g>
            <rect x="90" y="68" width="8" height="22" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
            <line x1="92" y1="74" x2="92" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="96" y1="74" x2="96" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="90" y="88" width="8" height="3" fill="#0f172a" />
          </g>

          {/* Thruster Jet Wash */}
          <polygon points="62,72 70,84 78,72" fill={glowColor} opacity="0.6" className="animate-pulse" />
        </svg>
      );

    case 'drone_plasma':
      // Titan-Ion Delta Hover Drone with Glowing Plasma Core
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Delta Stealth Wings */}
          <path d="M70 20 L126 58 L104 68 L70 54 L36 68 L14 58 Z" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
          
          {/* Wingtip Ion Thrusters */}
          <ellipse cx="22" cy="62" rx="5" ry="2" fill="#c084fc" className="animate-pulse" />
          <ellipse cx="118" cy="62" rx="5" ry="2" fill="#c084fc" className="animate-pulse" />

          {/* Armored Cockpit Shield */}
          <polygon points="70,30 88,48 70,68 52,48" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />

          {/* Pulsing Quantum Reactor Core */}
          <circle cx="70" cy="50" r="10" fill="#3b0764" stroke="#e879f9" strokeWidth="2" />
          <circle cx="70" cy="50" r="5" fill="#f0abfc" className="animate-ping" />
          {/* Orbital Ion Ring */}
          <ellipse cx="70" cy="50" rx="16" ry="6" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 2" transform="rotate(-20 70 50)" />

          {/* Dual Undermounted Plasma Projectors */}
          <rect x="56" y="68" width="6" height="18" rx="2" fill="#3b0764" stroke="#c084fc" strokeWidth="1.2" />
          <circle cx="59" cy="86" r="2.5" fill="#e879f9" />
          <rect x="78" y="68" width="6" height="18" rx="2" fill="#3b0764" stroke="#c084fc" strokeWidth="1.2" />
          <circle cx="81" cy="86" r="2.5" fill="#e879f9" />
        </svg>
      );

    case 'drone_laser':
      // Aegis Beam Scout with Concentrated Laser Lens
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular Armored Chassis */}
          <circle cx="70" cy="48" r="30" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
          <circle cx="70" cy="48" r="24" fill="#27272a" stroke="#f87171" strokeWidth="1.2" />

          {/* Magnetic Gold Collector Rings */}
          <path d="M36 48 A34 34 0 0 1 104 48" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M36 48 A34 34 0 0 0 104 48" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />

          {/* Central High-Intensity Laser Prism Lens */}
          <circle cx="70" cy="48" r="12" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
          <circle cx="70" cy="48" r="6" fill="#fca5a5" className="animate-ping" />

          {/* Laser Emitter Prongs & Beam Preview */}
          <line x1="70" y1="60" x2="70" y2="88" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="88" x2="70" y2="98" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="2 2" />
          
          {/* Target Reticle Crosshair */}
          <line x1="70" y1="28" x2="70" y2="34" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="50" y1="48" x2="56" y2="48" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="84" y1="48" x2="90" y2="48" stroke="#ef4444" strokeWidth="1.5" />
        </svg>
      );

    case 'drone_missile':
      // Valkyrie Heavy Rocket Pod Launcher Drone
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy Armored Hull */}
          <polygon points="70,24 105,42 95,74 45,74 35,42" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />

          {/* Targeting Antenna */}
          <line x1="70" y1="24" x2="70" y2="12" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="70" cy="11" r="2" fill="#ef4444" className="animate-ping" />

          {/* 4 Micro-Rocket Pods (Hộc phóng rocket) */}
          <g>
            <rect x="22" y="44" width="20" height="26" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="28" cy="51" r="3" fill="#ef4444" />
            <circle cx="36" cy="51" r="3" fill="#ef4444" />
            <circle cx="28" cy="62" r="3" fill="#ef4444" />
            <circle cx="36" cy="62" r="3" fill="#ef4444" />
          </g>
          <g>
            <rect x="98" y="44" width="20" height="26" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="104" cy="51" r="3" fill="#ef4444" />
            <circle cx="112" cy="51" r="3" fill="#ef4444" />
            <circle cx="104" cy="62" r="3" fill="#ef4444" />
            <circle cx="112" cy="62" r="3" fill="#ef4444" />
          </g>

          {/* Center Heavy Visor */}
          <rect x="52" y="42" width="36" height="12" rx="2" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="56" y1="48" x2="84" y2="48" stroke="#ef4444" strokeWidth="2" />

          {/* Heavy Booster Thrusters */}
          <polygon points="54,74 58,86 64,74" fill="#f59e0b" opacity="0.8" />
          <polygon points="76,74 82,86 86,74" fill="#f59e0b" opacity="0.8" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 3. EQUIPMENT VISUAL ARTWORK (TRANG BỊ CHIẾN ĐẤU)
// ==========================================
export const EquipmentVisualArtwork: React.FC<{
  slotId: EquipmentSlotId;
  level: number;
  color?: string;
  className?: string;
}> = ({ slotId, level = 1, color = '#38bdf8', className = 'w-full h-full' }) => {
  switch (slotId) {
    case 'armor':
      // Tactical Armor Vest (Tiers 1-4 with glowing core & ballistic plates)
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vest Silhouette */}
          <path 
            d="M32 24 L46 24 L52 40 L68 40 L74 24 L88 24 L96 46 L90 98 L30 98 L24 46 Z" 
            fill="#0f172a" 
            stroke={color} 
            strokeWidth="2.5" 
          />
          {/* Ceramic Ballistic Chest Plates */}
          <polygon points="38,44 58,44 56,70 34,70" fill="#1e293b" stroke={color} strokeWidth="1.5" />
          <polygon points="62,44 82,44 86,70 64,70" fill="#1e293b" stroke={color} strokeWidth="1.5" />
          
          {/* MOLLE Webbing Struts */}
          <line x1="36" y1="76" x2="84" y2="76" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="38" y1="84" x2="82" y2="84" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="40" y1="92" x2="80" y2="92" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />

          {/* Cyber Energy Core for Tiers 2+ */}
          {level >= 2 && (
            <g>
              <circle cx="60" cy="56" r="8" fill="#083344" stroke={color} strokeWidth="2" />
              <circle cx="60" cy="56" r="4" fill={color} className="animate-ping" />
            </g>
          )}
          {/* Aegis Shield Radiance for Tier 4 */}
          {level >= 4 && (
            <circle cx="60" cy="56" r="32" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          )}
        </svg>
      );

    case 'boots':
      // Kinetic Combat Boots with Jump Thrusters
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Boot Shaft & Ankle Support */}
          <path d="M42 22 H72 V58 L88 72 V92 H28 L28 80 L38 52 Z" fill="#0f172a" stroke={color} strokeWidth="2.5" />
          
          {/* Heavy Lug Sole (Đế giày giảm chấn) */}
          <rect x="26" y="90" width="66" height="12" rx="3" fill="#1e293b" stroke={color} strokeWidth="1.5" />
          <line x1="34" y1="96" x2="34" y2="102" stroke="#475569" strokeWidth="2" />
          <line x1="46" y1="96" x2="46" y2="102" stroke="#475569" strokeWidth="2" />
          <line x1="58" y1="96" x2="58" y2="102" stroke="#475569" strokeWidth="2" />
          <line x1="70" y1="96" x2="70" y2="102" stroke="#475569" strokeWidth="2" />
          <line x1="82" y1="96" x2="82" y2="102" stroke="#475569" strokeWidth="2" />

          {/* Lacing & Straps */}
          <line x1="46" y1="32" x2="66" y2="32" stroke={color} strokeWidth="2" />
          <line x1="46" y1="42" x2="66" y2="42" stroke={color} strokeWidth="2" />
          <line x1="48" y1="52" x2="68" y2="52" stroke={color} strokeWidth="2" />

          {/* Heel Rocket Thruster Nozzle */}
          <rect x="20" y="74" width="10" height="12" rx="2" fill="#334155" stroke={color} strokeWidth="1.5" />
          <polygon points="12,80 20,76 20,84" fill="#f59e0b" className="animate-pulse" />
        </svg>
      );

    case 'helmet':
      // Ballistic Combat Helmet with Integrated HUD Visor
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Helmet Shell Dome */}
          <path 
            d="M26 68 C24 34 40 20 60 20 C80 20 96 34 94 68 L92 82 H80 L76 72 H44 L40 82 H28 Z" 
            fill="#0f172a" 
            stroke={color} 
            strokeWidth="2.5" 
          />
          {/* Tactical Headset Comms & Side Rails */}
          <rect x="20" y="52" width="8" height="18" rx="2" fill="#334155" stroke={color} strokeWidth="1" />
          <rect x="92" y="52" width="8" height="18" rx="2" fill="#334155" stroke={color} strokeWidth="1" />
          {/* Mic boom */}
          <path d="M24 70 Q28 88 46 88" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="48" cy="88" r="3" fill="#ef4444" />

          {/* Glowing HUD Optical Visor Lens */}
          <path d="M34 52 H86 L80 66 H40 Z" fill="#042f2e" stroke={color} strokeWidth="2" />
          <line x1="44" y1="59" x2="76" y2="59" stroke={color} strokeWidth="2" strokeDasharray="6 3" className="animate-pulse" />

          {/* Night Vision Goggles Mount (NVG Shroud) */}
          <rect x="52" y="24" width="16" height="10" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );

    case 'gloves':
      // Tactical Shooter Gloves with Knuckle Armor
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glove Palm & Wrist */}
          <path d="M34 98 H86 L84 62 L94 48 L86 40 L76 52 L76 26 L66 26 L66 50 L56 24 L46 24 L46 50 L38 32 L28 36 L34 60 Z" fill="#0f172a" stroke={color} strokeWidth="2.5" />
          
          {/* Molded Carbon-Fiber Knuckle Plate */}
          <rect x="36" y="54" width="48" height="12" rx="4" fill="#1e293b" stroke={color} strokeWidth="1.5" />
          <circle cx="44" cy="60" r="2.5" fill={color} />
          <circle cx="54" cy="60" r="2.5" fill={color} />
          <circle cx="64" cy="60" r="2.5" fill={color} />
          <circle cx="74" cy="60" r="2.5" fill={color} />

          {/* Wrist Cinch Strap & Cyber Sensor */}
          <rect x="36" y="86" width="48" height="8" rx="2" fill="#334155" stroke={color} strokeWidth="1.2" />
        </svg>
      );

    case 'backpack':
      // Military Tactical Rucksack / Ammo Rig
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Pack Body */}
          <rect x="32" y="26" width="56" height="68" rx="8" fill="#0f172a" stroke={color} strokeWidth="2.5" />
          
          {/* Top Flap Cover */}
          <path d="M28 26 C28 20 92 20 92 26 L88 42 H32 Z" fill="#1e293b" stroke={color} strokeWidth="1.5" />

          {/* Dual Side Utility Pods */}
          <rect x="18" y="44" width="14" height="36" rx="3" fill="#1e293b" stroke={color} strokeWidth="1.2" />
          <rect x="88" y="44" width="14" height="36" rx="3" fill="#1e293b" stroke={color} strokeWidth="1.2" />

          {/* Front Zipper Compartment with Medkit Cross */}
          <rect x="40" y="50" width="40" height="36" rx="4" fill="#042f2e" stroke={color} strokeWidth="1.5" />
          <rect x="56" y="58" width="8" height="20" rx="1" fill="#10b981" />
          <rect x="50" y="64" width="20" height="8" rx="1" fill="#10b981" />

          {/* Compression Straps */}
          <line x1="32" y1="46" x2="88" y2="46" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="32" y1="82" x2="88" y2="82" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    case 'visor':
      // Holographic Combat Visor / Thermal Scanner Eye
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyber Visor Frame & Temple Arm */}
          <path d="M18 52 H102 L96 68 H26 Z" fill="#042f2e" stroke={color} strokeWidth="2.5" />
          <line x1="18" y1="52" x2="10" y2="42" stroke={color} strokeWidth="3" strokeLinecap="round" />

          {/* Holographic Projection HUD Target */}
          <circle cx="60" cy="60" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 3" className="animate-spin" />
          <circle cx="60" cy="60" r="6" fill={color} opacity="0.3" />
          <circle cx="60" cy="60" r="2" fill="#ffffff" />
          {/* Reticle Axes */}
          <line x1="60" y1="38" x2="60" y2="46" stroke={color} strokeWidth="2" />
          <line x1="60" y1="74" x2="60" y2="82" stroke={color} strokeWidth="2" />
          <line x1="38" y1="60" x2="46" y2="60" stroke={color} strokeWidth="2" />
          <line x1="74" y1="60" x2="82" y2="60" stroke={color} strokeWidth="2" />

          {/* Thermal Scanner Indicator */}
          <rect x="88" y="56" width="8" height="8" rx="1" fill="#ef4444" className="animate-ping" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 4. SKILL PERK VISUAL ARTWORK (KỸ NĂNG BỔ TRỢ)
// ==========================================
export const SkillPerkVisualArtwork: React.FC<{
  perkId: string;
  level?: number;
  color?: string;
  className?: string;
}> = ({ perkId, level = 1, color = '#f59e0b', className = 'w-full h-full' }) => {
  switch (perkId) {
    case 'maxHpLevel':
      // Cybernetic Biovital Heart Core with ECG pulse & vascular nanite conduits
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ambient Glow Aura */}
          <circle cx="80" cy="45" r="34" fill="#ef4444" opacity="0.12" />
          
          {/* Top Vascular Conduits (Aorta & Superior Vena Cava) */}
          <path d="M68 28 V16 H76 V28" stroke="#64748b" strokeWidth="3" fill="#1e293b" />
          <path d="M84 28 V12 H94 V28" stroke="#64748b" strokeWidth="3" fill="#1e293b" />
          <line x1="72" y1="14" x2="72" y2="28" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="89" y1="12" x2="89" y2="28" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Mechanical Heart Casing Body */}
          <path 
            d="M80 74 C50 56 46 36 62 26 C72 20 80 28 80 32 C80 28 88 20 98 26 C114 36 110 56 80 74 Z" 
            fill="#1e1b2e" 
            stroke="#ef4444" 
            strokeWidth="2.5" 
          />

          {/* Layered Cyber Armor Plates */}
          <path d="M56 34 Q80 44 76 66 Q62 52 56 34 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
          <path d="M104 34 Q80 44 84 66 Q98 52 104 34 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />

          {/* Central Reactor Core (Heartbeat Reactor) */}
          <circle cx="80" cy="45" r="11" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
          <circle cx="80" cy="45" r="5.5" fill="#ef4444" className="animate-ping" />

          {/* Dynamic ECG Cardiogram Monitor Line */}
          <path 
            d="M36 46 H62 L67 36 L72 56 L77 38 L83 49 L88 46 H124" 
            stroke="#22c55e" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity="0.9"
          />

          {/* Nanite Infusion Beads */}
          <circle cx="64" cy="50" r="2" fill="#ef4444" />
          <circle cx="96" cy="50" r="2" fill="#ef4444" />
          <circle cx="80" cy="64" r="2" fill="#f87171" />

          {/* Level 3+ Supercharge Rings */}
          {level >= 3 && (
            <ellipse cx="80" cy="45" rx="36" ry="16" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" transform="rotate(-15 80 45)" />
          )}
        </svg>
      );

    case 'armorLevel':
      // Aegis Hex-Deflector Shield Matrix with glowing hexagonal force barrier
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagonal Forcefield Ambient Glow */}
          <circle cx="80" cy="45" r="32" fill="#0284c7" opacity="0.15" />

          {/* Outer Force Barrier Hexagons */}
          <g stroke="#38bdf8" strokeWidth="1.2" opacity="0.75">
            <polygon points="52,35 60,30 68,35 68,45 60,50 52,45" fill="#082f49" />
            <polygon points="68,25 76,20 84,25 84,35 76,40 68,35" fill="#0c4a6e" />
            <polygon points="84,25 92,20 100,25 100,35 92,40 84,35" fill="#0c4a6e" />
            <polygon points="100,35 108,30 116,35 116,45 108,50 100,45" fill="#082f49" />
            <polygon points="68,45 76,40 84,45 84,55 76,60 68,55" fill="#075985" />
            <polygon points="84,45 92,40 100,45 100,55 92,60 84,55" fill="#075985" />
            <polygon points="76,60 84,55 92,60 92,70 84,75 76,70" fill="#0c4a6e" />
          </g>

          {/* Heavy Armored Ballistic Chest Plate Silhouette */}
          <path 
            d="M60 22 H100 L112 40 L80 78 L48 40 Z" 
            fill="#0f172a" 
            stroke="#0284c7" 
            strokeWidth="2.5" 
          />

          {/* Interior Armored Plates */}
          <path d="M68 28 H92 L98 42 L80 66 L62 42 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Central Nano-Aegis Core */}
          <polygon points="80,36 90,44 80,56 70,44" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="80" cy="46" r="3.5" fill="#38bdf8" className="animate-ping" />

          {/* Quad Shield Stabilizer Nodes */}
          <circle cx="50" cy="38" r="3" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
          <circle cx="110" cy="38" r="3" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1" />
          <line x1="50" y1="38" x2="68" y2="44" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="110" y1="38" x2="92" y2="44" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'speedLevel':
      // Kinetic Hydraulic Jump Boots & Sonic Slipstream
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Supersonic Slipstream Streaks */}
          <line x1="18" y1="32" x2="62" y2="32" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
          <line x1="12" y1="45" x2="55" y2="45" stroke="#34d399" strokeWidth="2.5" strokeDasharray="8 5" opacity="0.8" />
          <line x1="20" y1="58" x2="68" y2="58" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
          <line x1="26" y1="70" x2="78" y2="70" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />

          {/* Boot Leg Ankle Brace */}
          <path d="M72 18 H98 V46 L114 56 V72 H62 L60 62 L68 40 Z" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />

          {/* Hydraulic Suspension Piston */}
          <rect x="66" y="24" width="8" height="24" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <line x1="70" y1="28" x2="70" y2="44" stroke="#f59e0b" strokeWidth="2.5" />

          {/* Heavy Lug Tread Sole */}
          <rect x="60" y="70" width="58" height="10" rx="2" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <line x1="68" y1="75" x2="68" y2="80" stroke="#34d399" strokeWidth="2" />
          <line x1="78" y1="75" x2="78" y2="80" stroke="#34d399" strokeWidth="2" />
          <line x1="88" y1="75" x2="88" y2="80" stroke="#34d399" strokeWidth="2" />
          <line x1="98" y1="75" x2="98" y2="80" stroke="#34d399" strokeWidth="2" />
          <line x1="108" y1="75" x2="108" y2="80" stroke="#34d399" strokeWidth="2" />

          {/* Heel Plasma Jet Rocket Thruster */}
          <rect x="52" y="56" width="12" height="12" rx="2" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <polygon points="34,62 52,58 52,66" fill="#10b981" className="animate-pulse" />
          <polygon points="42,62 52,59 52,65" fill="#6ee7b7" />

          {/* Ankle Speed Sensor Indicator */}
          <circle cx="86" cy="52" r="3.5" fill="#34d399" className="animate-ping" />
        </svg>
      );

    case 'reloadLevel':
      // Hyper-Cycle Dual-Chamber Fast Speedloader with Revolving Cylinder Magazines
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular Rotation Guide Track */}
          <circle cx="80" cy="45" r="32" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
          
          {/* Twin Rotating Speedloader Chambers */}
          {/* Left Chamber */}
          <circle cx="60" cy="45" r="20" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
          <circle cx="60" cy="45" r="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Brass Cartridges in Left Cylinder */}
          <circle cx="60" cy="32" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <circle cx="71" cy="39" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <circle cx="71" cy="51" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <circle cx="60" cy="58" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <circle cx="49" cy="51" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <circle cx="49" cy="39" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />

          {/* Right Chamber */}
          <circle cx="100" cy="45" r="20" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="45" r="6" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Brass Cartridges in Right Cylinder */}
          <circle cx="100" cy="32" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="111" cy="39" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="111" cy="51" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="100" cy="58" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="89" cy="51" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="89" cy="39" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

          {/* Rapid Auto-Loader Mechanical Transfer Arm */}
          <path d="M72 40 L88 40 L84 50 L68 50 Z" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="80" cy="45" r="3" fill="#f59e0b" className="animate-ping" />

          {/* Dynamic Rotation Arrows */}
          <path d="M76 18 A32 32 0 0 1 106 26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="106,21 110,28 102,28" fill="#fbbf24" />
          <path d="M84 72 A32 32 0 0 1 54 64" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="54,69 50,62 58,62" fill="#fbbf24" />
        </svg>
      );

    case 'critChanceLevel':
      // Deadshot Tactical Hologram HUD Reticle with precision lock
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Glowing Red Optical Grid Background */}
          <circle cx="80" cy="45" r="35" fill="#881337" opacity="0.15" />

          {/* Outer Milliradian Compass Ring */}
          <circle cx="80" cy="45" r="34" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="80" cy="45" r="24" stroke="#fb7185" strokeWidth="1.8" />

          {/* 4 Corner Locking Brackets */}
          <path d="M42 22 H54 V34" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 22 H106 V34" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 68 H54 V56" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 68 H106 V56" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Precision Crosshairs Axes */}
          <line x1="80" y1="14" x2="80" y2="34" stroke="#f43f5e" strokeWidth="2" />
          <line x1="80" y1="56" x2="80" y2="76" stroke="#f43f5e" strokeWidth="2" />
          <line x1="48" y1="45" x2="68" y2="45" stroke="#f43f5e" strokeWidth="2" />
          <line x1="92" y1="45" x2="112" y2="45" stroke="#f43f5e" strokeWidth="2" />

          {/* Center Weakpoint Skull / Target Bullseye */}
          <circle cx="80" cy="45" r="10" fill="#4c0519" stroke="#fda4af" strokeWidth="2" />
          <circle cx="80" cy="45" r="4.5" fill="#f43f5e" className="animate-ping" />

          {/* Critical Rangefinder HUD telemetry */}
          <text x="38" y="42" fill="#fda4af" fontSize="6" fontFamily="monospace" fontWeight="bold">CRIT 2.5X</text>
          <text x="96" y="42" fill="#fda4af" fontSize="6" fontFamily="monospace" fontWeight="bold">LOCK ON</text>
        </svg>
      );

    case 'bulletDamageLevel':
      // Depleted Uranium APFSDS Heavy Shell & Dual Plasma Energy Blades
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Overdrive Kinetic Shock Aura */}
          <polygon points="30,45 130,22 145,45 130,68" fill="#ea580c" opacity="0.15" />

          {/* Kinetic Shockwave Cones */}
          <path d="M118 26 Q134 45 118 64" stroke="#f97316" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M128 32 Q140 45 128 58" stroke="#fdba74" strokeWidth="2" />

          {/* Heavy Armor-Piercing Sabot Projectile */}
          {/* Casing / Body */}
          <rect x="36" y="40" width="70" height="10" rx="1" fill="#1e293b" stroke="#ea580c" strokeWidth="1.8" />
          
          {/* Hardened Tungsten Penetrator Point */}
          <path d="M106 38 L136 45 L106 52 Z" fill="#c2410c" stroke="#fed7aa" strokeWidth="1.5" />
          <line x1="106" y1="45" x2="136" y2="45" stroke="#fed7aa" strokeWidth="1.5" />

          {/* Brass Primer & Base */}
          <rect x="28" y="38" width="8" height="14" rx="1" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />

          {/* Stabilizing Fin Sabots */}
          <polygon points="36,40 50,26 62,40" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.2" />
          <polygon points="36,50 50,64 62,50" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.2" />

          {/* Crackling High-Energy Plasma Rings Wrapping Around Bullet */}
          <ellipse cx="65" cy="45" rx="7" ry="14" stroke="#fb923c" strokeWidth="2" strokeDasharray="3 2" transform="rotate(20 65 45)" />
          <ellipse cx="90" cy="45" rx="6" ry="12" stroke="#fdba74" strokeWidth="2" strokeDasharray="3 2" transform="rotate(20 90 45)" />
          <circle cx="136" cy="45" r="3.5" fill="#fed7aa" className="animate-ping" />
        </svg>
      );

    case 'magnetRadiusLevel':
      // Quantum Gravity Singularity Vortex & Neodymium Magnet
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Gravity Singularity Ambient Halo */}
          <circle cx="80" cy="45" r="32" fill="#a855f7" opacity="0.14" />

          {/* Magnetic Flux Vector Field Lines */}
          <ellipse cx="80" cy="45" rx="42" ry="18" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
          <ellipse cx="80" cy="45" rx="30" ry="26" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />

          {/* Dual Horseshoe Neodymium Magnet Prongs */}
          <path 
            d="M50 30 C50 18 110 18 110 30 V56 H94 V32 C94 28 66 28 66 32 V56 H50 Z" 
            fill="#2e1065" 
            stroke="#a855f7" 
            strokeWidth="2.5" 
          />

          {/* North & South Magnetic Pole Caps */}
          {/* North Pole (Red) */}
          <rect x="50" y="52" width="16" height="12" rx="1" fill="#dc2626" stroke="#f87171" strokeWidth="1.2" />
          <text x="55" y="61" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
          
          {/* South Pole (Blue) */}
          <rect x="94" y="52" width="16" height="12" rx="1" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.2" />
          <text x="99" y="61" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">S</text>

          {/* Central Quantum Graviton Vortex */}
          <circle cx="80" cy="45" r="8" fill="#3b0764" stroke="#e879f9" strokeWidth="2" />
          <circle cx="80" cy="45" r="3.5" fill="#f0abfc" className="animate-ping" />

          {/* Orbiting Attracted Gold Coins & Gems */}
          <circle cx="68" cy="70" r="4.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="92" cy="72" r="3.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.2" />
          <polygon points="80,24 84,28 80,32 76,28" fill="#38bdf8" />
          <polygon points="122,42 126,46 122,50 118,46" fill="#f59e0b" />
          <polygon points="38,44 42,48 38,52 34,48" fill="#a855f7" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 5. SUPPLY VISUAL ARTWORK (TIẾP TẾ TÁC CHIẾN)
// ==========================================
export const SupplyVisualArtwork: React.FC<{
  supplyType: 'heal' | 'armor' | 'grenade' | 'turret' | 'trap';
  className?: string;
}> = ({ supplyType, className = 'w-full h-full' }) => {
  switch (supplyType) {
    case 'heal':
      // Military Nano-Stim Combat Medkit Case
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ambient Vital Glow */}
          <circle cx="80" cy="45" r="30" fill="#22c55e" opacity="0.15" />

          {/* Heavy Armored Medkit Briefcase */}
          <rect x="42" y="24" width="76" height="52" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="2.5" />
          
          {/* Top Carry Handle */}
          <path d="M68 24 V16 H92 V24" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Reinforced Armor Corner Bumpers */}
          <path d="M42 34 V24 H52" stroke="#475569" strokeWidth="3" />
          <path d="M118 34 V24 H108" stroke="#475569" strokeWidth="3" />
          <path d="M42 66 V76 H52" stroke="#475569" strokeWidth="3" />
          <path d="M118 66 V76 H108" stroke="#475569" strokeWidth="3" />

          {/* Heavy Center Clasp */}
          <rect x="74" y="24" width="12" height="10" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Prominent Glowing Emerald Medical Cross */}
          <rect x="73" y="38" width="14" height="26" rx="2" fill="#22c55e" />
          <rect x="67" y="44" width="26" height="14" rx="2" fill="#22c55e" />
          <rect x="75" y="40" width="10" height="22" rx="1" fill="#86efac" />
          <rect x="69" y="46" width="22" height="10" rx="1" fill="#86efac" />

          {/* Dual Rapid Auto-Injector Syrettes docked on the sides */}
          <g>
            <rect x="28" y="36" width="8" height="28" rx="2" fill="#1e293b" stroke="#22c55e" strokeWidth="1.2" />
            <rect x="30" y="42" width="4" height="16" fill="#22c55e" className="animate-pulse" />
            <line x1="32" y1="64" x2="32" y2="72" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>
          <g>
            <rect x="124" y="36" width="8" height="28" rx="2" fill="#1e293b" stroke="#22c55e" strokeWidth="1.2" />
            <rect x="126" y="42" width="4" height="16" fill="#22c55e" className="animate-pulse" />
            <line x1="128" y1="64" x2="128" y2="72" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Digital Bio-Pressure LED Monitor */}
          <rect x="54" y="68" width="52" height="4" rx="1" fill="#042f2e" stroke="#22c55e" strokeWidth="0.8" />
          <rect x="55" y="69" width="38" height="2" fill="#4ade80" />
        </svg>
      );

    case 'armor':
      // Nanoceramic Ballistic Armor Repair Matrix Kit
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ambient Azure Glow */}
          <circle cx="80" cy="45" r="30" fill="#0284c7" opacity="0.15" />

          {/* Composite Ceramic Armor Plate Base */}
          <path 
            d="M52 20 H108 L118 42 L80 76 L42 42 Z" 
            fill="#0f172a" 
            stroke="#0284c7" 
            strokeWidth="2.5" 
          />

          {/* Layered Weave Carbon Plates */}
          <path d="M60 26 H100 L106 44 L80 68 L54 44 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Armor Repair Welder Seam with Cyan Sealant */}
          <path d="M80 32 L84 46 L76 56 L80 66" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="46" r="3.5" fill="#bae6fd" className="animate-ping" />

          {/* Articulated Robotic Nano-Welder Torch Arm */}
          <path d="M124 22 L102 36 L86 44" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          <circle cx="102" cy="36" r="3.5" fill="#334155" stroke="#94a3b8" />
          <rect x="82" y="42" width="6" height="6" rx="1" fill="#38bdf8" />

          {/* Welding Plasma Sparks */}
          <circle cx="76" cy="40" r="1.5" fill="#38bdf8" />
          <circle cx="88" cy="48" r="1.5" fill="#38bdf8" />
          <circle cx="82" cy="52" r="1.2" fill="#e0f2fe" />
          <circle cx="72" cy="46" r="1.2" fill="#e0f2fe" />

          {/* Armor Integrity Gauge Readout */}
          <rect x="62" y="30" width="36" height="5" rx="1" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
          <rect x="63" y="31" width="28" height="3" fill="#38bdf8" />
        </svg>
      );

    case 'grenade':
      // Trio of Tactical M67 Pineapple Frag Grenades
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ambient Amber Glow */}
          <circle cx="80" cy="45" r="30" fill="#f59e0b" opacity="0.12" />

          {/* Left Grenade */}
          <g transform="translate(-32, 6) rotate(-12 60 45)">
            {/* Grenade Egg Body */}
            <rect x="52" y="32" width="22" height="30" rx="9" fill="#14532d" stroke="#15803d" strokeWidth="1.8" />
            {/* Ribbed Fragmentation Grid */}
            <line x1="52" y1="42" x2="74" y2="42" stroke="#166534" strokeWidth="1.5" />
            <line x1="52" y1="52" x2="74" y2="52" stroke="#166534" strokeWidth="1.5" />
            <line x1="63" y1="32" x2="63" y2="62" stroke="#166534" strokeWidth="1.5" />
            {/* Fuse & Spoon Lever */}
            <rect x="59" y="24" width="8" height="8" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <path d="M59 26 C54 26 50 32 50 48" stroke="#94a3b8" strokeWidth="2" fill="none" />
            {/* Pull Ring */}
            <circle cx="68" cy="27" r="4" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            {/* Yellow Hazard Stripe */}
            <rect x="53" y="36" width="20" height="2.5" fill="#f59e0b" />
          </g>

          {/* Right Grenade */}
          <g transform="translate(32, 6) rotate(12 100 45)">
            <rect x="90" y="32" width="22" height="30" rx="9" fill="#14532d" stroke="#15803d" strokeWidth="1.8" />
            <line x1="90" y1="42" x2="112" y2="42" stroke="#166534" strokeWidth="1.5" />
            <line x1="90" y1="52" x2="112" y2="52" stroke="#166534" strokeWidth="1.5" />
            <line x1="101" y1="32" x2="101" y2="62" stroke="#166534" strokeWidth="1.5" />
            <rect x="97" y="24" width="8" height="8" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <path d="M105 26 C110 26 114 32 114 48" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <circle cx="95" cy="27" r="4" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            <rect x="91" y="36" width="20" height="2.5" fill="#f59e0b" />
          </g>

          {/* Center Grenade (Hero Primary) */}
          <g>
            <rect x="67" y="26" width="26" height="36" rx="11" fill="#15803d" stroke="#22c55e" strokeWidth="2" />
            {/* Ribbed Fragmentation Grid */}
            <line x1="67" y1="38" x2="93" y2="38" stroke="#14532d" strokeWidth="1.8" />
            <line x1="67" y1="50" x2="93" y2="50" stroke="#14532d" strokeWidth="1.8" />
            <line x1="80" y1="26" x2="80" y2="62" stroke="#14532d" strokeWidth="1.8" />
            {/* Yellow Hazard Band */}
            <rect x="68" y="31" width="24" height="3" fill="#f59e0b" />
            {/* Fuse Mechanism & Spoon */}
            <rect x="75" y="16" width="10" height="10" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <path d="M75 18 C68 18 64 26 64 46" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Steel Pull Ring */}
            <circle cx="88" cy="19" r="5" stroke="#e2e8f0" strokeWidth="2" fill="none" />
            <circle cx="80" cy="44" r="2.5" fill="#f59e0b" className="animate-ping" />
          </g>
        </svg>
      );

    case 'turret':
      // Automated Deployable Heavy Sentry Gatling Turret
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tripod Stabilizer Leg Assembly */}
          <path d="M80 62 L42 82 H34" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M80 62 L118 82 H126" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M80 62 V84" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="62" r="5" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />

          {/* Rotating Turret Swivel Housing */}
          <rect x="58" y="38" width="44" height="24" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
          <polygon points="58,42 70,30 90,30 102,42" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5" />

          {/* AI Targeting Optical Sensor Lens */}
          <circle cx="80" cy="48" r="6" fill="#581c87" stroke="#e879f9" strokeWidth="1.8" />
          <circle cx="80" cy="48" r="2.5" fill="#f0abfc" className="animate-ping" />

          {/* Red Target Acquisition Laser Line */}
          <line x1="80" y1="48" x2="152" y2="48" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx="152" cy="48" r="1.5" fill="#ef4444" className="animate-ping" />

          {/* Twin Rotary Multi-Barrel Cannons */}
          <g>
            <rect x="102" y="42" width="34" height="3" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            <rect x="102" y="46" width="34" height="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.8" />
            <rect x="102" y="50" width="34" height="3" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            {/* Muzzle Clamp */}
            <rect x="132" y="40" width="5" height="15" rx="1" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
          </g>

          {/* Ammo Feed Belt Drum Hopper */}
          <rect x="42" y="42" width="16" height="18" rx="3" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.5" />
          <line x1="46" y1="46" x2="54" y2="46" stroke="#f59e0b" strokeWidth="2" />
          <line x1="46" y1="52" x2="54" y2="52" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      );

    case 'trap':
      // Cyber-Tesla Shock Field Pylon Trap
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground Electric Stun Field Perimeter */}
          <ellipse cx="80" cy="72" rx="52" ry="12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
          <ellipse cx="80" cy="72" rx="34" ry="8" fill="#0284c7" opacity="0.18" />

          {/* Triangular Heavy Ground Anchor Base */}
          <polygon points="54,72 80,62 106,72 80,78" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
          <circle cx="54" cy="72" r="3" fill="#38bdf8" />
          <circle cx="106" cy="72" r="3" fill="#38bdf8" />

          {/* Vertical Tesla Induction Coil Tower */}
          <rect x="74" y="28" width="12" height="36" rx="2" fill="#082f49" stroke="#38bdf8" strokeWidth="1.8" />
          {/* Copper Magnetic Windings */}
          <line x1="74" y1="34" x2="86" y2="34" stroke="#f59e0b" strokeWidth="2" />
          <line x1="74" y1="40" x2="86" y2="40" stroke="#f59e0b" strokeWidth="2" />
          <line x1="74" y1="46" x2="86" y2="46" stroke="#f59e0b" strokeWidth="2" />
          <line x1="74" y1="52" x2="86" y2="52" stroke="#f59e0b" strokeWidth="2" />
          <line x1="74" y1="58" x2="86" y2="58" stroke="#f59e0b" strokeWidth="2" />

          {/* Spherical High-Voltage Discharge Emitter */}
          <circle cx="80" cy="24" r="9" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2" />
          <circle cx="80" cy="24" r="4.5" fill="#bae6fd" className="animate-ping" />

          {/* Branching Electric Lightning Arc Bolts */}
          <path d="M80 20 L72 10 L84 4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M86 24 L104 18 L114 26 L128 20" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M74 24 L56 18 L48 28 L32 22" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M80 28 L94 40 L108 52" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    default:
      return null;
  }
};

