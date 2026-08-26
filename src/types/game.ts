export type WeaponType = 
  | 'pistol' 
  | 'shotgun' 
  | 'ak47' 
  | 'sniper' 
  | 'minigun' 
  | 'rpg' 
  | 'plasma' 
  | 'flamethrower';

export interface Weapon {
  id: WeaponType;
  name: string;
  nameVi: string;
  damage: number;
  fireRate: number; // ms between shots
  reloadTime: number; // ms
  magSize: number;
  currentMag: number;
  reserveAmmo: number; // -1 for infinite
  spread: number; // in radians
  bulletSpeed: number;
  bulletCount: number; // e.g. 6 for shotgun
  bulletRange: number;
  pierce: number;
  knockback: number;
  unlocked: boolean;
  cost: number;
  level: number;
  color: string;
  bulletColor: string;
  icon: string;
  soundType: 'pistol' | 'shotgun' | 'rifle' | 'sniper' | 'heavy' | 'rocket' | 'plasma' | 'fire';
}

export type ZombieType = 
  | 'walker' 
  | 'runner' 
  | 'tank' 
  | 'spitter' 
  | 'bomber' 
  | 'boss_mutant'
  | 'boss_abomination';

export interface Zombie {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  damage: number;
  scoreValue: number;
  goldValue: number;
  color: string;
  angle: number;
  animationFrame: number;
  frozenTimer: number;
  burnTimer: number;
  poisonTimer: number;
  attackCooldown: number;
  // Boss specific
  isBoss?: boolean;
  bossPhase?: number;
  bossAttackTimer?: number;
  bossSpecialState?: 'idle' | 'charging' | 'slamming' | 'spawning';
  chargeTarget?: { x: number; y: number };
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierceLeft: number;
  rangeLeft: number;
  radius: number;
  color: string;
  isExplosive?: boolean;
  isPlasma?: boolean;
  isFire?: boolean;
  isEnemyBullet?: boolean;
  knockback: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'smoke' | 'fire' | 'shell' | 'blood';
  angle?: number;
  vAngle?: number;
}

export interface Decal {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  type: 'blood' | 'crater' | 'burn';
}

export type PowerUpType = 
  | 'gold_coin'
  | 'gold_ingot'
  | 'coin_bag'
  | 'medkit' 
  | 'ammo' 
  | 'nuke' 
  | 'double_damage' 
  | 'speed_boost' 
  | 'freeze' 
  | 'shield' 
  | 'turret';

export interface DropItem {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  value: number;
  duration?: number;
  radius: number;
  pulse: number;
  createdAt: number;
  vx?: number;
  vy?: number;
  bounceZ?: number;
  vz?: number;
  rotation?: number;
}

export interface ActiveTurret {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  angle: number;
  lastShotTime: number;
  duration: number;
  range: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  isCrit?: boolean;
}

export type ObstacleType = 
  | 'crate' 
  | 'barrel' 
  | 'sandbag' 
  | 'vehicle' 
  | 'tree' 
  | 'hvac' 
  | 'server' 
  | 'gurney' 
  | 'streetlight';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  hp?: number;
  maxHp?: number;
  isExplosive?: boolean;
  angle?: number;
  variant?: string;
  color?: string;
  isBurning?: boolean;
}

export interface PlayerStats {
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  speed: number;
  angle: number;
  stamina: number;
  maxStamina: number;
  isDashing: boolean;
  dashCooldown: number;
  dashTimer: number;
  grenadeCount: number;
  gold: number;
  score: number;
  kills: number;
  headshots: number;
  combo: number;
  comboTimer: number;
  multiplier: number;
  invincibleTimer: number;
  warriorSkin?: string;
  walkFrame?: number;
  // Upgrade levels
  upgrades: {
    maxHpLevel: number;
    armorLevel: number;
    speedLevel: number;
    reloadLevel: number;
    critChanceLevel: number;
    magnetRadiusLevel: number;
    bulletDamageLevel: number;
  };
}

export interface ActiveBuffs {
  doubleDamageTimer: number;
  speedBoostTimer: number;
  freezeEnemiesTimer: number;
  shieldTimer: number;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type GameMode = 'survival' | 'endless';

export type MapEnvironmentId = 'rooftop' | 'street' | 'bunker' | 'hospital';

export interface MapEnvironment {
  id: MapEnvironmentId;
  nameVi: string;
  codename: string;
  subtitleVi: string;
  descVi: string;
  badge: string;
  themeColor: string;
  accentColor: string;
  ambientLight: string;
  fogColor: string;
  hazardsVi: string;
}

export interface HighScoreRecord {
  name: string;
  score: number;
  kills: number;
  wave: number;
  date: string;
  difficulty: GameDifficulty;
  mapId?: MapEnvironmentId;
}
