import React from 'react';
import { WeaponType } from '../types/game';
import { EquipmentSlotId } from '../types/game';

// ==========================================
// 1. WEAPON VISUAL ARTWORK (SÚNG CHIẾN THUẬT)
// ==========================================
export const WeaponVisualArtwork: React.FC<{
  weaponId: WeaponType;
  color?: string;
  className?: string;
}> = ({ weaponId, color = '#f59e0b', className = 'w-full h-full' }) => {
  switch (weaponId) {
    case 'pistol':
      // Glock-19 / Tactical 9mm with Crimson Laser & Polished Slide
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pistolSlide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="35%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="pistolHighlight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="pistolGrip" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <radialGradient id="laserGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <filter id="glowPistol" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Laser Sight Beam */}
          <line x1="144" y1="46" x2="162" y2="46" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" filter="url(#glowPistol)" />
          <circle cx="160" cy="46" r="3" fill="url(#laserGlow)" className="animate-pulse" />

          {/* Underbarrel Tactical Rail Module */}
          <rect x="100" y="48" width="44" height="9" rx="1.5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <rect x="112" y="51" width="28" height="5" rx="1" fill="#0f172a" stroke={color} strokeWidth="1" />
          <circle cx="134" cy="53.5" r="1.5" fill="#ef4444" />

          {/* Pistol Slide (Thân trên kim loại vát cạnh bóng bẩy) */}
          <path d="M26 31 H144 V48 H26 Z" fill="url(#pistolSlide)" stroke="#64748b" strokeWidth="1.5" />
          {/* Beveled Top Edge Highlight */}
          <line x1="26" y1="32" x2="144" y2="32" stroke="url(#pistolHighlight)" strokeWidth="1.5" />
          <path d="M26 33 H64 V39 H26 Z" fill="#0f172a" opacity="0.6" />

          {/* Slide Serrations (Rãnh khía lên đạn sắc nét) */}
          {[32, 37, 42, 47, 52].map(x => (
            <g key={x}>
              <line x1={x} y1="34" x2={x} y2="45" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1={x + 1} y1="34" x2={x + 1} y2="45" stroke="#090d16" strokeWidth="1.2" />
            </g>
          ))}

          {/* Muzzle Compensator & Crown */}
          <rect x="144" y="34" width="8" height="11" rx="1" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx="148" cy="39.5" r="2.5" fill="#090d16" stroke="#475569" strokeWidth="0.8" />

          {/* Lower Receiver / Polymer Frame */}
          <path d="M46 48 H128 V56 H72 L62 83 H34 L46 48 Z" fill="url(#pistolGrip)" stroke="#334155" strokeWidth="1.5" />
          
          {/* Tactical Grip Texture Stippling */}
          <path d="M42 54 L32 79 H52 L62 54 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {[58, 64, 70, 75].map(y => (
            <line key={y} x1="38" y1={y} x2="55" y2={y} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          ))}
          <circle cx="46" cy="66" r="3" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />

          {/* Trigger Guard & Golden Trigger */}
          <path d="M68 56 C68 68 86 68 86 56" stroke="#64748b" strokeWidth="1.8" fill="none" />
          <path d="M74 57 Q78 63 73 64" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Front & Rear Night Sights with Green Tritium Dots */}
          <rect x="30" y="27" width="5" height="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <circle cx="32.5" cy="29" r="1" fill="#22c55e" />
          <rect x="136" y="27" width="4" height="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          <circle cx="138" cy="29" r="1" fill="#22c55e" />
        </svg>
      );

    case 'shotgun':
      // Remington 870 / SPAS-12 Combat Shotgun with Chambered 12G Shell
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shotgunMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="shotgunPump" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
            <linearGradient id="barrelHeat" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="70%" stopColor="#475569" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Folding Skeleton Stock */}
          <path d="M10 39 L34 43 V51 L10 45 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <line x1="10" y1="39" x2="34" y2="39" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="34" cy="45" r="3.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />

          {/* Heavy Steel Receiver */}
          <rect x="34" y="39" width="44" height="19" rx="2" fill="url(#shotgunMetal)" stroke="#64748b" strokeWidth="1.5" />
          {/* Ejection Port & Golden Brass Shell */}
          <rect x="52" y="43" width="16" height="7" rx="1" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <rect x="54" y="44.5" width="10" height="4" rx="0.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.5" />
          <rect x="62" y="44.5" width="3" height="4" fill="#fbbf24" />

          {/* Long Steel Barrel & Mag Tube */}
          <rect x="78" y="41" width="72" height="7" fill="url(#barrelHeat)" stroke="#64748b" strokeWidth="1.2" />
          <rect x="78" y="49" width="62" height="6" fill="url(#shotgunMetal)" stroke="#475569" strokeWidth="1" />
          <rect x="138" y="48.5" width="5" height="7" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

          {/* Perforated Heat Shield */}
          <line x1="84" y1="38" x2="136" y2="38" stroke="#94a3b8" strokeWidth="1.8" />
          {[88, 96, 104, 112, 120, 128].map(x => (
            <circle key={x} cx={x} cy="44.5" r="1.8" fill="#090d16" stroke="#64748b" strokeWidth="0.6" />
          ))}

          {/* Ribbed Heavy Pump Handguard */}
          <rect x="90" y="48" width="30" height="10" rx="2.5" fill="url(#shotgunPump)" stroke="#9a3412" strokeWidth="1.2" />
          {[96, 101, 106, 111, 116].map(x => (
            <line key={x} x1={x} y1="48" x2={x} y2="58" stroke="#431407" strokeWidth="1.5" />
          ))}

          {/* Tactical Pistol Grip & Trigger */}
          <path d="M42 58 L35 83 H50 L56 58 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <line x1="39" y1="64" x2="52" y2="64" stroke="#334155" strokeWidth="1.2" />
          <line x1="37" y1="72" x2="49" y2="72" stroke="#334155" strokeWidth="1.2" />
          <path d="M56 58 C56 69 70 69 70 58" stroke="#64748b" strokeWidth="1.6" fill="none" />
          <path d="M62 60 Q64 66 60 67" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />

          {/* Breaching Spiked Muzzle Brake with Orange Heat Glow */}
          <rect x="150" y="40" width="7" height="9" fill="#1e293b" stroke="#f97316" strokeWidth="1" />
          <polygon points="157,40 160,42 157,44" fill="#f97316" />
          <polygon points="157,45 160,47 157,49" fill="#f97316" />
        </svg>
      );

    case 'ak47':
      // AK-47 Kalashnikov with Rich Woodgrain & Stamped Steel Receiver
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="akWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="30%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="akSteel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="akMag" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Classic Russian Wood Stock */}
          <path d="M8 43 L38 41 V59 L10 63 Z" fill="url(#akWood)" stroke="#451a03" strokeWidth="1.5" />
          <line x1="12" y1="46" x2="34" y2="44" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
          <line x1="12" y1="56" x2="32" y2="54" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
          <rect x="8" y="44" width="3" height="18" fill="#1e293b" />

          {/* Stamped Steel Receiver with Rivets */}
          <rect x="38" y="39" width="46" height="18" rx="1.5" fill="url(#akSteel)" stroke="#64748b" strokeWidth="1.5" />
          <rect x="42" y="41" width="24" height="7" fill="#090d16" />
          {/* Bolt carrier charging handle */}
          <rect x="58" y="42" width="7" height="4" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
          <circle cx="44" cy="52" r="1.5" fill="#94a3b8" />
          <circle cx="78" cy="52" r="1.5" fill="#94a3b8" />

          {/* Curved Banana Magazine (30 Rounds 7.62x39mm) */}
          <path d="M64 57 C66 69 56 83 42 86 L37 81 C48 77 55 67 53 57 Z" fill="url(#akMag)" stroke="#f59e0b" strokeWidth="1.5" />
          {[62, 69, 76].map(y => (
            <path key={y} d={`M43 ${y} C49 ${y - 4} 53 ${y - 8} 52 ${y - 12}`} stroke="#475569" strokeWidth="1.2" />
          ))}

          {/* Barrel & Gas Piston Tube */}
          <rect x="84" y="42" width="62" height="5.5" fill="url(#akSteel)" stroke="#475569" strokeWidth="1" />
          <rect x="84" y="38" width="38" height="4.5" fill="url(#akSteel)" stroke="#475569" strokeWidth="1" />

          {/* Wooden Handguard & Gas Tube Cover */}
          <rect x="86" y="41" width="30" height="13" rx="2" fill="url(#akWood)" stroke="#451a03" strokeWidth="1.2" />
          <line x1="94" y1="41" x2="94" y2="54" stroke="#78350f" strokeWidth="1.2" />
          <line x1="104" y1="41" x2="104" y2="54" stroke="#78350f" strokeWidth="1.2" />

          {/* Bakelite Pistol Grip & Trigger */}
          <path d="M42 57 L37 79 H48 L53 57 Z" fill="url(#akWood)" stroke="#451a03" strokeWidth="1.5" />
          <path d="M53 57 C53 67 66 67 66 57" stroke="#64748b" strokeWidth="1.5" fill="none" />
          <path d="M59 59 Q60 65 57 66" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

          {/* Front Sight Post & Slanted Muzzle Brake */}
          <polygon points="138,42 140,32 143,32 144,42" fill="#475569" stroke="#64748b" strokeWidth="1" />
          <circle cx="141.5" cy="34" r="1" fill="#ef4444" />
          <polygon points="146,42 154,40 154,48 146,48" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
        </svg>
      );

    case 'sniper':
      // Barrett .50 Cal Anti-Materiel Precision Rifle with Illuminated Scope
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sniperChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="scopeGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
            <linearGradient id="flutedBarrel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Heavy Skeletonized Recoil-Absorbing Buttstock */}
          <path d="M6 43 H34 V57 H18 L8 51 Z" fill="url(#sniperChassis)" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="6" y="44" width="4" height="12" fill="#0284c7" />
          <rect x="12" y="57" width="5" height="14" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Heavy Stamped Receiver & Box Magazine */}
          <rect x="34" y="41" width="46" height="17" rx="1.5" fill="url(#sniperChassis)" stroke="#64748b" strokeWidth="1.5" />
          <rect x="44" y="58" width="20" height="18" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="49" y1="62" x2="49" y2="72" stroke="#334155" strokeWidth="1.5" />
          <line x1="57" y1="62" x2="57" y2="72" stroke="#334155" strokeWidth="1.5" />

          {/* Optical Scope (Kính ngắm cự ly xa đa thấu kính xanh phát sáng) */}
          <rect x="40" y="30" width="46" height="8" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="34,28 40,30 40,38 34,40" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
          <polygon points="86,30 92,27 92,41 86,38" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
          <rect x="91" y="28" width="3" height="12" fill="url(#scopeGlass)" />
          {/* Glowing Crosshair Reticle inside scope */}
          <circle cx="63" cy="34" r="3" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="60" y1="34" x2="66" y2="34" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="63" y1="31" x2="63" y2="37" stroke="#38bdf8" strokeWidth="0.8" />
          <rect x="48" y="38" width="4" height="4" fill="#334155" />
          <rect x="74" y="38" width="4" height="4" fill="#334155" />

          {/* Extra Long Heavy Match-Grade Fluted Barrel */}
          <rect x="80" y="44" width="66" height="6.5" fill="url(#flutedBarrel)" stroke="#475569" strokeWidth="1" />
          {[86, 96, 106, 116, 126, 136].map(x => (
            <line key={x} x1={x} y1="46" x2={x + 6} y2="46" stroke="#090d16" strokeWidth="1.5" />
          ))}

          {/* Dual-Baffle Arrowhead Muzzle Brake (.50 BMG) */}
          <polygon points="146,41 158,38 158,54 146,51" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="150" y="42" width="3" height="8" fill="#38bdf8" />
          <rect x="154" y="42" width="3" height="8" fill="#38bdf8" />

          {/* Heavy Duty Fold-Down Steel Bipod */}
          <circle cx="118" cy="53" r="2.5" fill="#64748b" stroke="#94a3b8" />
          <line x1="117" y1="55" x2="108" y2="82" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="119" y1="55" x2="128" y2="82" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />

          {/* Ergonomic Sniper Grip & Gold Match Trigger */}
          <path d="M36 58 L31 80 H42 L48 58 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <path d="M48 58 C48 68 60 68 60 58" stroke="#64748b" strokeWidth="1.5" fill="none" />
          <path d="M53 60 Q54 66 51 67" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'minigun':
      // M134 Vulcan 6-Barrel Rotary Gatling Cannon with Ammo Chute
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vulcanBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="vulcanGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="barrelSpin" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="80%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Top Carry Handle & Spades */}
          <path d="M24 35 H64 V43 H24 Z" fill="url(#vulcanBody)" stroke="#a855f7" strokeWidth="1.5" />
          <rect x="34" y="27" width="22" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />

          {/* Heavy Electric Motor Housing with Cooling Vents */}
          <rect x="20" y="43" width="48" height="26" rx="3" fill="url(#vulcanBody)" stroke="#a855f7" strokeWidth="1.8" />
          <circle cx="44" cy="56" r="7" fill="#0f172a" stroke="url(#vulcanGold)" strokeWidth="1.5" />
          <circle cx="44" cy="56" r="3" fill="#a855f7" className="animate-ping" />

          {/* Linked Ammunition Feed Chute */}
          <path d="M26 69 C26 80 16 85 8 84" stroke="#f59e0b" strokeWidth="5" strokeDasharray="3.5 1.5" />
          <path d="M26 69 C26 80 16 85 8 84" stroke="#ca8a04" strokeWidth="2" />

          {/* 6 High-Speed Rotary Barrels */}
          {[46, 50, 54, 58, 62].map((y, idx) => (
            <rect 
              key={y} 
              x="68" 
              y={y} 
              width="78" 
              height="3.5" 
              fill={idx % 2 === 0 ? "url(#barrelSpin)" : "#0f172a"} 
              stroke="#94a3b8" 
              strokeWidth="0.7" 
            />
          ))}

          {/* Clamping Discs & Rotor Spacers */}
          <rect x="94" y="44" width="7" height="23" rx="1" fill="url(#vulcanGold)" stroke="#ca8a04" strokeWidth="1" />
          <rect x="122" y="44" width="7" height="23" rx="1" fill="url(#vulcanGold)" stroke="#ca8a04" strokeWidth="1" />
          <rect x="146" y="43" width="9" height="25" rx="1.5" fill="#0f172a" stroke="url(#vulcanGold)" strokeWidth="1.5" />

          {/* Spinning Energy Halo & Muzzle Blast Corona */}
          <line x1="150" y1="46" x2="155" y2="46" stroke="#fbbf24" strokeWidth="2.5" />
          <line x1="150" y1="55" x2="157" y2="55" stroke="#f59e0b" strokeWidth="3" />
          <line x1="150" y1="64" x2="155" y2="64" stroke="#fbbf24" strokeWidth="2.5" />
        </svg>
      );

    case 'rpg':
      // RPG-7 Rocket Propelled Grenade Launcher with PG-7 Warhead
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rpgWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="warheadGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="40%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="exhaustCone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Exhaust Venturi Cone */}
          <polygon points="10,42 28,46 28,58 10,62" fill="url(#exhaustCone)" stroke="#eab308" strokeWidth="1.5" />

          {/* Steel Launch Tube Body */}
          <rect x="28" y="47" width="88" height="9" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />

          {/* Wood Heat-Shield Wrap */}
          <rect x="46" y="45" width="40" height="13" rx="2" fill="url(#rpgWood)" stroke="#451a03" strokeWidth="1.2" />
          <line x1="56" y1="45" x2="56" y2="58" stroke="#f59e0b" strokeWidth="1" />
          <line x1="70" y1="45" x2="70" y2="58" stroke="#f59e0b" strokeWidth="1" />

          {/* Dual Grip Handles */}
          <path d="M52 58 L47 79 H56 L61 58 Z" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
          <path d="M80 58 L82 77 H89 L87 58 Z" fill="#334155" stroke="#64748b" strokeWidth="1.2" />

          {/* PGO-7 Optical Sight */}
          <rect x="62" y="36" width="18" height="9" rx="1.5" fill="#0f172a" stroke="#eab308" strokeWidth="1.2" />
          <circle cx="71" cy="40.5" r="2.5" fill="#facc15" />

          {/* Iconic High-Explosive PG-7 Warhead */}
          <rect x="116" y="49" width="10" height="5" fill="#475569" />
          <path d="M126 51.5 L135 38 L149 51.5 L135 65 Z" fill="url(#warheadGreen)" stroke="#22c55e" strokeWidth="1.5" />
          {/* High Explosive Conical Fuse Tip */}
          <polygon points="149,51.5 158,51.5 149,46" fill="#ef4444" />
          <polygon points="149,51.5 158,51.5 149,57" fill="#ef4444" />
          <line x1="158" y1="51.5" x2="161" y2="51.5" stroke="#facc15" strokeWidth="2" />
        </svg>
      );

    case 'plasma':
      // Quantum Plasma Rifle X-1 with Swirling Liquid Core & Magnetic Rails
      return (
        <svg viewBox="0 0 160 90" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plasmaChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="plasmaGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>
            <radialGradient id="plasmaCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#083344" />
            </radialGradient>
          </defs>

          {/* Cyber Buttstock & Ion Battery */}
          <path d="M10 38 L36 42 V58 L12 60 Z" fill="url(#plasmaChassis)" stroke="#06b6d4" strokeWidth="1.5" />
          <rect x="14" y="44" width="6" height="12" rx="1" fill="#06b6d4" opacity="0.8" />

          {/* Central Housing with Transparent Plasma Tube */}
          <rect x="36" y="38" width="56" height="20" rx="3" fill="url(#plasmaChassis)" stroke="#22d3ee" strokeWidth="1.5" />
          {/* Glass Energy Tube with Swirling Quantum Fluid */}
          <rect x="44" y="42" width="38" height="12" rx="2" fill="#042f2e" stroke="#06b6d4" strokeWidth="1.2" />
          <rect x="46" y="44" width="34" height="8" rx="1.5" fill="url(#plasmaCore)" opacity="0.9" className="animate-pulse" />
          <circle cx="56" cy="48" r="2.5" fill="#ffffff" />
          <circle cx="70" cy="48" r="2" fill="#ffffff" />

          {/* Magnetic Accelerator Dual Rails */}
          <rect x="92" y="40" width="56" height="5" rx="1" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.2" />
          <rect x="92" y="51" width="56" height="5" rx="1" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.2" />
          
          {/* Electrical Plasma Arcs between rails */}
          <line x1="102" y1="45" x2="104" y2="51" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="118" y1="45" x2="116" y2="51" stroke="#22d3ee" strokeWidth="1.5" />
          <line x1="134" y1="45" x2="136" y2="51" stroke="#22d3ee" strokeWidth="1.5" />

          {/* Plasma Emitter Muzzle Crown */}
          <rect x="148" y="38" width="8" height="20" rx="2" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="152" cy="48" r="3.5" fill="#22d3ee" className="animate-ping" />

          {/* Cyber Grip & Pulse Trigger */}
          <path d="M48 58 L44 80 H56 L62 58 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
          <path d="M62 58 C62 68 74 68 74 58" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M67 60 Q68 65 65 66" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 2. DRONE VISUAL ARTWORK (ROBO TÁC CHIẾN HỘ VỆ)
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
      // Vulcan Quad-Rotor Combat Drone with Dual Rapid Gatlings
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="droneChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <radialGradient id="vulcanEye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#083344" />
            </radialGradient>
          </defs>

          {/* Anti-Gravity Carbon-Fiber Rotor Arms */}
          <line x1="22" y1="28" x2="52" y2="48" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="118" y1="28" x2="88" y2="48" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />

          {/* Spinning Energy Propeller Rings */}
          <ellipse cx="22" cy="26" rx="19" ry="5" fill="none" stroke={glowColor} strokeWidth="2" strokeDasharray="4 2" />
          <ellipse cx="118" cy="26" rx="19" ry="5" fill="none" stroke={glowColor} strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="22" cy="26" r="3.5" fill="#0f172a" stroke={color} strokeWidth="1.5" />
          <circle cx="118" cy="26" r="3.5" fill="#0f172a" stroke={color} strokeWidth="1.5" />

          {/* Armored Central Fuselage / Carbon Plating */}
          <polygon points="70,28 94,44 88,72 52,72 46,44" fill="url(#droneChassis)" stroke={color} strokeWidth="2" />
          <polygon points="70,34 86,46 70,64 54,46" fill="#0f172a" stroke={glowColor} strokeWidth="1.2" />

          {/* Central AI Targeting Eye with Laser Sight */}
          <circle cx="70" cy="49" r="8" fill="url(#vulcanEye)" stroke={glowColor} strokeWidth="2" />
          <circle cx="70" cy="49" r="3" fill="#ffffff" className="animate-ping" />
          <line x1="70" y1="57" x2="70" y2="92" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Under-Mounted Dual Rapid-Fire Machine Guns */}
          <g>
            <rect x="40" y="68" width="9" height="24" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
            <line x1="43" y1="68" x2="43" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="46" y1="68" x2="46" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="41.5" y="89" width="6" height="4" fill="#f59e0b" />
          </g>
          <g>
            <rect x="91" y="68" width="9" height="24" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
            <line x1="94" y1="68" x2="94" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="97" y1="68" x2="97" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="92.5" y="89" width="6" height="4" fill="#f59e0b" />
          </g>
        </svg>
      );

    case 'drone_plasma':
      // Plasma Orb Disc Drone with Ion Wings & Swirling Vortex
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="plasmaBall" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="85%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2e1065" />
            </radialGradient>
          </defs>

          {/* Outer Stabilizer Energy Ring */}
          <circle cx="70" cy="50" r="38" stroke="#a855f7" strokeWidth="2" strokeDasharray="8 4" opacity="0.6" />
          
          {/* Swept Forward Ion Winglets */}
          <path d="M20 38 L48 50 L34 68 Z" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.8" />
          <path d="M120 38 L92 50 L106 68 Z" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.8" />

          {/* Armored Torus Ring Chassis */}
          <ellipse cx="70" cy="50" rx="32" ry="24" fill="#0f172a" stroke="#c084fc" strokeWidth="2.5" />
          
          {/* Pulsating Quantum Plasma Core */}
          <circle cx="70" cy="50" r="16" fill="url(#plasmaBall)" stroke="#f472b6" strokeWidth="2" className="animate-pulse" />
          <circle cx="70" cy="50" r="7" fill="#ffffff" opacity="0.9" />

          {/* Forward Dual Plasma Emitters */}
          <rect x="52" y="70" width="8" height="16" rx="2" fill="#2e1065" stroke="#c084fc" strokeWidth="1.2" />
          <rect x="80" y="70" width="8" height="16" rx="2" fill="#2e1065" stroke="#c084fc" strokeWidth="1.2" />
          <line x1="56" y1="84" x2="84" y2="84" stroke="#f472b6" strokeWidth="2" />
        </svg>
      );

    case 'drone_laser':
      // Laser Stealth Hunter Drone with Prism Optics
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="stealthWing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Swept Delta Stealth Wings */}
          <polygon points="70,18 126,56 112,74 70,60 28,74 14,56" fill="url(#stealthWing)" stroke="#ef4444" strokeWidth="2" />
          <line x1="70" y1="18" x2="70" y2="60" stroke="#f87171" strokeWidth="1.5" />

          {/* Twin Wing-Tip Ion Thrusters */}
          <rect x="22" y="66" width="6" height="12" rx="1.5" fill="#ef4444" opacity="0.9" />
          <rect x="112" y="66" width="6" height="12" rx="1.5" fill="#ef4444" opacity="0.9" />

          {/* High-Energy Ruby Laser Turret Pod */}
          <circle cx="70" cy="46" r="10" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
          <circle cx="70" cy="46" r="5" fill="#f87171" />
          <rect x="67" y="54" width="6" height="18" rx="1" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />

          {/* Focused Crimson Death Beam */}
          <line x1="70" y1="72" x2="70" y2="98" stroke="#ef4444" strokeWidth="3" />
          <line x1="70" y1="72" x2="70" y2="98" stroke="#fecaca" strokeWidth="1.2" />
        </svg>
      );

    case 'drone_missile':
      // Heavy Ordnance Gunship Drone with Micro-Missile Pods
      return (
        <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="missileChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Heavy Armored Body */}
          <polygon points="70,24 100,42 94,76 46,76 40,42" fill="url(#missileChassis)" stroke="#f59e0b" strokeWidth="2" />

          {/* Heavy Dual Pod Missile Launchers (4 Rockets Each) */}
          <g>
            <rect x="20" y="38" width="22" height="34" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            {[44, 52, 60, 68].map(y => (
              <g key={y}>
                <circle cx="26" cy={y} r="2.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
                <circle cx="36" cy={y} r="2.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
              </g>
            ))}
          </g>
          <g>
            <rect x="98" y="38" width="22" height="34" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
            {[44, 52, 60, 68].map(y => (
              <g key={y}>
                <circle cx="104" cy={y} r="2.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
                <circle cx="114" cy={y} r="2.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
              </g>
            ))}
          </g>

          {/* Searchlight & Radar Sensor Dome */}
          <circle cx="70" cy="46" r="9" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="70" cy="46" r="4" fill="#facc15" className="animate-pulse" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 3. EQUIPMENT VISUAL ARTWORK (TRANG BỊ TÁC CHIẾN)
// ==========================================
export const EquipmentVisualArtwork: React.FC<{
  slotId: EquipmentSlotId;
  level: number;
  color?: string;
  className?: string;
}> = ({ slotId, level = 1, color = '#10b981', className = 'w-full h-full' }) => {
  switch (slotId) {
    case 'armor':
      // Modular Tactical Ballistic Exosuit Vest with Bio-Core
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="armorPlating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <radialGradient id="bioCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#022c22" />
            </radialGradient>
          </defs>

          {/* Reinforced Shoulder Pauldrons */}
          <path d="M22 36 L38 22 L46 36 L28 48 Z" fill="#1e293b" stroke={color} strokeWidth="1.8" />
          <path d="M98 36 L82 22 L74 36 L92 48 Z" fill="#1e293b" stroke={color} strokeWidth="1.8" />

          {/* Main Chest Armor Plate */}
          <path d="M38 22 H82 L90 62 L74 98 H46 L30 62 Z" fill="url(#armorPlating)" stroke={color} strokeWidth="2.5" />

          {/* Modular Ceramic Trauma Strike Plates */}
          <polygon points="40,32 56,32 54,52 36,48" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <polygon points="80,32 64,32 66,52 84,48" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <polygon points="42,56 56,58 54,78 38,72" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <polygon points="78,56 64,58 66,78 82,72" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />

          {/* Central Bio-Vitality Core / Defibrillator Unit */}
          <circle cx="60" cy="56" r="10" fill="url(#bioCore)" stroke={color} strokeWidth="2" />
          <circle cx="60" cy="56" r="4" fill="#ffffff" className="animate-ping" />
          {/* EKG Pulse Line */}
          <path d="M54 56 H58 L60 52 L61 60 L63 56 H66" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

          {/* Abdominal Segmented Blast Plates */}
          <line x1="44" y1="84" x2="76" y2="84" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
          <line x1="48" y1="91" x2="72" y2="91" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    case 'boots':
      // Kinetic Combat Boots with Rocket Jump Thrusters
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bootLeather" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="thrusterFire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Boot Shaft & Ankle Support */}
          <path d="M42 20 H74 V56 L92 70 V92 H26 L26 78 L38 50 Z" fill="url(#bootLeather)" stroke={color} strokeWidth="2.5" />

          {/* Heavy Lug Sole (Đế giày giảm chấn địa hình hiểm trở) */}
          <rect x="24" y="90" width="70" height="12" rx="3" fill="#0f172a" stroke={color} strokeWidth="1.8" />
          {[32, 44, 56, 68, 80].map(x => (
            <line key={x} x1={x} y1="96" x2={x} y2="102" stroke="#64748b" strokeWidth="2.5" />
          ))}

          {/* Tactical Speed Lacing & Reinforced Straps */}
          <line x1="46" y1="30" x2="68" y2="30" stroke={color} strokeWidth="2.2" />
          <line x1="46" y1="40" x2="68" y2="40" stroke={color} strokeWidth="2.2" />
          <line x1="48" y1="50" x2="70" y2="50" stroke={color} strokeWidth="2.2" />

          {/* Ankle Hydraulic Piston Suspension */}
          <rect x="42" y="60" width="8" height="14" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />

          {/* Heel Micro-Rocket Thruster & Flame Plume */}
          <rect x="18" y="74" width="10" height="14" rx="2" fill="#334155" stroke={color} strokeWidth="1.5" />
          <polygon points="10,81 18,76 18,86" fill="url(#thrusterFire)" className="animate-pulse" />
          <circle cx="12" cy="81" r="2" fill="#ffffff" />
        </svg>
      );

    case 'helmet':
      // Ballistic Combat Helmet with Integrated Holographic HUD Visor
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="helmetShell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="visorHUD" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#042f2e" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>

          {/* Helmet Composite Dome Shell */}
          <path 
            d="M24 66 C22 32 38 18 60 18 C82 18 98 32 96 66 L94 82 H82 L78 72 H42 L38 82 H26 Z" 
            fill="url(#helmetShell)" 
            stroke={color} 
            strokeWidth="2.5" 
          />

          {/* Side Tactical Headset Comms & Mic Boom */}
          <rect x="18" y="50" width="8" height="20" rx="2" fill="#1e293b" stroke={color} strokeWidth="1.2" />
          <rect x="94" y="50" width="8" height="20" rx="2" fill="#1e293b" stroke={color} strokeWidth="1.2" />
          <path d="M22 68 Q28 88 46 88" stroke={color} strokeWidth="2.2" fill="none" />
          <circle cx="48" cy="88" r="3" fill="#ef4444" />

          {/* Glowing Holographic Tactical Visor Lens */}
          <path d="M32 50 H88 L82 66 H38 Z" fill="url(#visorHUD)" stroke={color} strokeWidth="2" />
          <line x1="42" y1="58" x2="78" y2="58" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="6 3" className="animate-pulse" />
          <circle cx="60" cy="58" r="2.5" fill="#ffffff" />

          {/* NVG Shroud / Night Vision Mount */}
          <rect x="52" y="22" width="16" height="10" rx="2" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
      );

    case 'gloves':
      // Shooter Gloves with Molded Carbon Knuckles & Grip Pads
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gloveBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Glove Hand Form */}
          <path 
            d="M32 98 H88 L86 62 L96 48 L88 40 L78 52 L78 24 L68 24 L68 48 L58 22 L48 22 L48 48 L38 30 L28 34 L32 60 Z" 
            fill="url(#gloveBase)" 
            stroke={color} 
            strokeWidth="2.5" 
          />

          {/* Carbon-Fiber Reinforced Knuckle Armor Bar */}
          <rect x="36" y="52" width="48" height="14" rx="4" fill="#0f172a" stroke={color} strokeWidth="1.8" />
          {[44, 54, 64, 74].map(cx => (
            <circle key={cx} cx={cx} cy="59" r="3" fill={color} />
          ))}

          {/* Wrist Cinch Strap & Bio-Telemetry Buckle */}
          <rect x="34" y="86" width="52" height="10" rx="2" fill="#0f172a" stroke={color} strokeWidth="1.5" />
          <line x1="40" y1="91" x2="80" y2="91" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      );

    case 'backpack':
      // Tactical Military Assault Rucksack / Ammo Rig
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="packFabric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Main Rucksack Body */}
          <rect x="30" y="24" width="60" height="72" rx="8" fill="url(#packFabric)" stroke={color} strokeWidth="2.5" />

          {/* Top Flap Hood */}
          <path d="M26 24 C26 18 94 18 94 24 L90 42 H30 Z" fill="#1e293b" stroke={color} strokeWidth="1.8" />

          {/* Dual Side Gear Pods with Quick Straps */}
          <rect x="18" y="44" width="12" height="38" rx="3" fill="#0f172a" stroke={color} strokeWidth="1.5" />
          <rect x="90" y="44" width="12" height="38" rx="3" fill="#0f172a" stroke={color} strokeWidth="1.5" />

          {/* Front Laser-Cut MOLLE Webbing Ladders */}
          <line x1="38" y1="52" x2="82" y2="52" stroke={color} strokeWidth="2.5" strokeDasharray="6 3" />
          <line x1="38" y1="62" x2="82" y2="62" stroke={color} strokeWidth="2.5" strokeDasharray="6 3" />
          <line x1="38" y1="72" x2="82" y2="72" stroke={color} strokeWidth="2.5" strokeDasharray="6 3" />

          {/* Radio Antenna with Pulsing Beacon */}
          <line x1="86" y1="18" x2="86" y2="6" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="86" cy="5" r="2.5" fill="#ef4444" className="animate-ping" />
        </svg>
      );

    case 'visor':
      // Cybernetic Smart Laser Targeting Visor
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lensReflect" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>

          {/* Sleek Ergonomic Cyber Frame */}
          <path d="M18 46 Q60 38 102 46 L98 68 Q60 62 22 68 Z" fill="#0f172a" stroke={color} strokeWidth="2.5" />

          {/* Multi-Coated Mirror Optics Lens */}
          <path d="M24 50 Q60 44 96 50 L92 64 Q60 60 28 64 Z" fill="url(#lensReflect)" stroke={color} strokeWidth="1.5" />

          {/* Holographic Tactical Reticle & Readout */}
          <circle cx="60" cy="56" r="6" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" className="animate-spin" />
          <line x1="50" y1="56" x2="70" y2="56" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="60" cy="56" r="1.5" fill="#ef4444" />

          {/* Temple Jack Connectors & Battery Module */}
          <rect x="14" y="44" width="8" height="14" rx="2" fill="#334155" stroke={color} strokeWidth="1.2" />
          <rect x="98" y="44" width="8" height="14" rx="2" fill="#334155" stroke={color} strokeWidth="1.2" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// 4. SKILL / PERK VISUAL ARTWORK (KỸ NĂNG NÂNG CẤP)
// ==========================================
export const SkillPerkVisualArtwork: React.FC<{
  perkId: string;
  level: number;
  color?: string;
  className?: string;
}> = ({ perkId, level = 1, color = '#fbbf24', className = 'w-full h-full' }) => {
  switch (perkId) {
    case 'maxHpLevel':
      // Pulsating Cyber Heart with DNA Double Helix & Vital EKG Wave
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="60%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
          </defs>

          {/* Ambient Vitality Aura */}
          <circle cx="60" cy="60" r="44" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />

          {/* Anatomical Stylized Cyber Heart */}
          <path 
            d="M60 92 C60 92 24 70 24 44 C24 28 38 20 50 24 C56 26 60 32 60 32 C60 32 64 26 70 24 C82 20 96 28 96 44 C96 70 60 92 60 92 Z" 
            fill="url(#heartGlow)" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            className="animate-pulse"
          />

          {/* EKG Electrocardiogram Wave */}
          <path 
            d="M34 52 H48 L53 42 L57 64 L62 46 L66 56 H86" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Golden Medical Cross Star */}
          <rect x="57" y="68" width="6" height="14" rx="1" fill="#facc15" />
          <rect x="53" y="72" width="14" height="6" rx="1" fill="#facc15" />
        </svg>
      );

    case 'armorLevel':
      // Multi-Layered Hexagonal Kinetic Aegis Barrier
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* Outer Energy Hexagon Forcefield */}
          <polygon points="60,14 98,34 98,86 60,106 22,86 22,34" stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" opacity="0.7" />

          {/* Heavy Reinforced Aegis Shield */}
          <path d="M60 22 L92 34 V64 C92 84 60 100 60 100 C60 100 28 84 28 64 V34 Z" fill="url(#shieldMetal)" stroke="#93c5fd" strokeWidth="2.5" />

          {/* Internal Armor Emblems & Deflection Sparks */}
          <path d="M60 34 L82 42 V62 C82 76 60 88 60 88 C60 88 38 76 38 62 V42 Z" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.8" />
          <circle cx="60" cy="58" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <circle cx="60" cy="58" r="3" fill="#ffffff" />
        </svg>
      );

    case 'speedLevel':
      // Supersonic Kinetic Lightning Bolt with Sonic Boom Halo
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Sonic Shockwave Rings */}
          <circle cx="60" cy="60" r="46" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
          <circle cx="60" cy="60" r="34" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />

          {/* Dynamic Motion Wind Streaks */}
          <line x1="16" y1="36" x2="48" y2="36" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="60" x2="44" y2="60" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="84" x2="52" y2="84" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Razor Sharp High-Voltage Lightning Bolt */}
          <polygon points="68,16 38,62 58,62 48,104 84,52 64,52" fill="url(#boltGrad)" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'reloadLevel':
      // High-Speed Dual Magazine Speed-Loader with Precision Gears
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="magMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Rotating Kinetic Quick-Reload Arrows */}
          <circle cx="60" cy="60" r="42" stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 8" className="animate-spin" />

          {/* Double Magazine Fast Coupling */}
          <rect x="36" y="32" width="20" height="56" rx="3" fill="url(#magMetal)" stroke="#f59e0b" strokeWidth="1.8" />
          <rect x="64" y="32" width="20" height="56" rx="3" fill="url(#magMetal)" stroke="#f59e0b" strokeWidth="1.8" />

          {/* Golden Brass 9mm / 5.56 Cartridges visible on top */}
          <rect x="41" y="24" width="10" height="12" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <rect x="69" y="24" width="10" height="12" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

          {/* Speed Coupler Clamp Bar */}
          <rect x="30" y="54" width="60" height="12" rx="2" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="3" fill="#fbbf24" />
        </svg>
      );

    case 'critChanceLevel':
      // Tactical Ruby Crosshair Locking & Shattering Critical Weakpoint
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="critRuby" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
          </defs>

          {/* Sniper Crosshairs (Vòng ngắm bắn tỉa điểm yếu chí mạng) */}
          <circle cx="60" cy="60" r="44" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4" />
          <circle cx="60" cy="60" r="28" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="60" y1="12" x2="60" y2="108" stroke="#ef4444" strokeWidth="2" />
          <line x1="12" y1="60" x2="108" y2="60" stroke="#ef4444" strokeWidth="2" />

          {/* Shattering Glowing Crystal Core */}
          <polygon points="60,38 78,60 60,82 42,60" fill="url(#critRuby)" stroke="#ffffff" strokeWidth="2" />
          <circle cx="60" cy="60" r="4" fill="#ffffff" className="animate-ping" />

          {/* Critical Hit Sparks */}
          <line x1="38" y1="38" x2="48" y2="48" stroke="#facc15" strokeWidth="2.5" />
          <line x1="82" y1="38" x2="72" y2="48" stroke="#facc15" strokeWidth="2.5" />
          <line x1="38" y1="82" x2="48" y2="72" stroke="#facc15" strokeWidth="2.5" />
          <line x1="82" y1="82" x2="72" y2="72" stroke="#facc15" strokeWidth="2.5" />
        </svg>
      );

    case 'bulletDamageLevel':
      // Supersonic Tungsten Armor-Piercing Bullet with Conical Shockwaves
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bulletGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Supersonic Conical Shockwave Rings */}
          <path d="M24 24 Q60 60 24 96" stroke="#f97316" strokeWidth="2.5" opacity="0.6" />
          <path d="M42 32 Q74 60 42 88" stroke="#f97316" strokeWidth="2.5" opacity="0.8" />

          {/* Heavy Armor-Piercing Bullet Body */}
          <path d="M38 48 H76 C88 48 102 56 106 60 C102 64 88 72 76 72 H38 Z" fill="url(#bulletGold)" stroke="#ffffff" strokeWidth="2" />
          <rect x="30" y="46" width="8" height="28" rx="2" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.2" />

          {/* Penetration Incendiary Sparks */}
          <circle cx="106" cy="60" r="3.5" fill="#ef4444" className="animate-ping" />
          <line x1="106" y1="60" x2="116" y2="52" stroke="#fbbf24" strokeWidth="2" />
          <line x1="106" y1="60" x2="118" y2="60" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="106" y1="60" x2="116" y2="68" stroke="#fbbf24" strokeWidth="2" />
        </svg>
      );

    case 'magnetRadiusLevel':
      // Powerful Neodymium Horseshoe Magnet with Attracting Gold Coins
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="magPoleRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="magPoleBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>

          {/* Swirling Magnetic Flux Wave Arcs */}
          <path d="M20 40 C20 14 100 14 100 40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" className="animate-pulse" />
          <path d="M14 50 C14 6 106 6 106 50" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />

          {/* Heavy Industrial Horseshoe Magnet */}
          <path 
            d="M32 50 V68 C32 84 44 94 60 94 C76 94 88 84 88 68 V50 H72 V68 C72 74 66 78 60 78 C54 78 48 74 48 68 V50 Z" 
            fill="#1e293b" 
            stroke="#94a3b8" 
            strokeWidth="2.5" 
          />
          {/* North Red Pole */}
          <rect x="32" y="34" width="16" height="18" rx="1.5" fill="url(#magPoleRed)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="36" y="47" fill="#ffffff" fontSize="10" fontWeight="bold">N</text>

          {/* South Blue Pole */}
          <rect x="72" y="34" width="16" height="18" rx="1.5" fill="url(#magPoleBlue)" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="76" y="47" fill="#ffffff" fontSize="10" fontWeight="bold">S</text>

          {/* Floating Attracted Gold Coins */}
          <circle cx="50" cy="24" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="68" cy="22" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="60" cy="30" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
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
      // Military Trauma Field Surgical Medkit with Red Cross & Syringes
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="medCase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <radialGradient id="crossGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
          </defs>

          {/* Heavy Steel Carry Handle */}
          <path d="M46 34 V22 H74 V34" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

          {/* Hard-Shell Medical Container */}
          <rect x="22" y="34" width="76" height="60" rx="8" fill="url(#medCase)" stroke="#475569" strokeWidth="2.5" />
          {/* Dual Steel Latches */}
          <rect x="36" y="32" width="6" height="8" rx="1" fill="#334155" />
          <rect x="78" y="32" width="6" height="8" rx="1" fill="#334155" />

          {/* Glowing Red Medical Cross */}
          <circle cx="60" cy="64" r="20" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="55" y="49" width="10" height="30" rx="2" fill="url(#crossGlow)" />
          <rect x="45" y="59" width="30" height="10" rx="2" fill="url(#crossGlow)" />

          {/* Epinephrine Auto-Injector Syringe Ampoule */}
          <g>
            <rect x="84" y="60" width="8" height="24" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <line x1="88" y1="84" x2="88" y2="92" stroke="#94a3b8" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'armor':
      // High-Density Ceramic Strike Face Body Armor Plate
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ceramicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {/* Beveled Ceramic Strike Plate */}
          <path d="M38 24 H82 L94 48 V92 L82 100 H38 L26 92 V48 Z" fill="url(#ceramicGrad)" stroke="#60a5fa" strokeWidth="2.5" />

          {/* Hexagonal Armor Lattice Matrix */}
          <polygon points="60,40 70,46 70,58 60,64 50,58 50,46" fill="#1e293b" stroke="#93c5fd" strokeWidth="1.5" />
          <polygon points="60,66 70,72 70,84 60,90 50,84 50,72" fill="#1e293b" stroke="#93c5fd" strokeWidth="1.5" />
          <polygon points="40,53 50,59 50,71 40,77 30,71 30,59" fill="#1e293b" stroke="#93c5fd" strokeWidth="1.5" />
          <polygon points="80,53 90,59 90,71 80,77 70,71 70,59" fill="#1e293b" stroke="#93c5fd" strokeWidth="1.5" />

          {/* Quick-Release Straps */}
          <rect x="42" y="20" width="8" height="6" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
          <rect x="70" y="20" width="8" height="6" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
        </svg>
      );

    case 'grenade':
      // M67 Fragmentation Pineapple Grenade with Safety Pin & Lever
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grenadeBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#65a30d" />
              <stop offset="50%" stopColor="#4d7c0f" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>
          </defs>

          {/* Safety Pull Ring with Red Streamer */}
          <circle cx="36" cy="30" r="8" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="36" y1="38" x2="36" y2="52" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

          {/* Fuze Assembly & Safety Spoon Lever */}
          <rect x="52" y="26" width="16" height="16" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
          <path d="M68 28 C78 28 82 38 82 54 L78 74" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Cast Steel Pineapple Segmented Shrapnel Body */}
          <ellipse cx="60" cy="68" rx="26" ry="30" fill="url(#grenadeBody)" stroke="#1a2e05" strokeWidth="2.5" />

          {/* Shrapnel Grid Grooves */}
          <line x1="60" y1="38" x2="60" y2="98" stroke="#1a2e05" strokeWidth="2" />
          <path d="M42 46 Q60 52 78 46" stroke="#1a2e05" strokeWidth="2" fill="none" />
          <path d="M36 62 Q60 68 84 62" stroke="#1a2e05" strokeWidth="2" fill="none" />
          <path d="M38 78 Q60 84 82 78" stroke="#1a2e05" strokeWidth="2" fill="none" />

          {/* Yellow ID Ordnance Ring */}
          <ellipse cx="60" cy="54" rx="24" ry="4" stroke="#facc15" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'turret':
      // Automated Deployable Heavy Vulcan Sentry Turret
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="turretChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
          </defs>

          {/* Heavy Reinforced Tripod Legs */}
          <line x1="60" y1="78" x2="22" y2="106" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="78" x2="98" y2="106" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="78" x2="60" y2="108" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />

          {/* Motorized 360-Degree Azimuth Swivel Turret Base */}
          <ellipse cx="60" cy="76" rx="24" ry="9" fill="url(#turretChassis)" stroke="#f59e0b" strokeWidth="2" />

          {/* Main Armored Auto-Gun Pod */}
          <rect x="42" y="42" width="36" height="28" rx="4" fill="url(#turretChassis)" stroke="#94a3b8" strokeWidth="2" />

          {/* Dual Auto-Cannons */}
          <rect x="76" y="48" width="32" height="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <rect x="76" y="58" width="32" height="6" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <rect x="104" y="46" width="6" height="10" fill="#f59e0b" />
          <rect x="104" y="56" width="6" height="10" fill="#f59e0b" />

          {/* Optical Targeting Scanner Dome with Red Laser */}
          <circle cx="50" cy="54" r="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="50" cy="54" r="2.5" fill="#ef4444" className="animate-ping" />
          <line x1="56" y1="54" x2="116" y2="54" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );

    case 'trap':
      // High-Voltage Electromagnetic Tesla Ground Mine with Arcing Spikes
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="teslaPlasma" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="80%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
          </defs>

          {/* 4 Steel Ground Anchoring Spikes */}
          <polygon points="60,22 56,12 64,12" fill="#94a3b8" />
          <polygon points="60,98 56,108 64,108" fill="#94a3b8" />
          <polygon points="22,60 12,56 12,64" fill="#94a3b8" />
          <polygon points="98,60 108,56 108,64" fill="#94a3b8" />

          {/* Outer Heavy Steel Mine Disc */}
          <circle cx="60" cy="60" r="38" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="30" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" />

          {/* Glowing High-Voltage Plasma Capacitor Core */}
          <circle cx="60" cy="60" r="16" fill="url(#teslaPlasma)" stroke="#38bdf8" strokeWidth="2" className="animate-pulse" />

          {/* Electric Shock Lightning Arcs */}
          <path d="M42 42 L52 48 L48 56 L60 60" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 78 L68 72 L72 64 L60 60" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="60" r="5" fill="#ffffff" />
        </svg>
      );

    default:
      return null;
  }
};
