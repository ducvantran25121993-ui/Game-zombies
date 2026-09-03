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
  | 'boss_abomination'
  | 'boss_cyber_behemoth'
  | 'boss_inferno_titan'
  | 'boss_void_reaper';

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
  bossSpecialState?: 'idle' | 'charging' | 'slamming' | 'spawning' | 'invisible' | 'shielded' | 'laser';
  chargeTarget?: { x: number; y: number };
  invisibleTimer?: number;
  shieldTimer?: number;
  laserAngle?: number;
  hasSpawnedClone?: boolean;
  isClone?: boolean;
  currentSkillName?: string;
  signatureWave?: number;
}

export interface BossHazard {
  id: string;
  type: 'toxic_pool' | 'lava_pool' | 'meteor_target' | 'black_hole';
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
  damage: number;
  color: string;
  dpsInterval?: number;
  lastDpsTime?: number;
  pullRadius?: number;
  pullForce?: number;
}

export interface SweepingLaser {
  id: string;
  bossId: string;
  x: number;
  y: number;
  currentAngle: number;
  startAngle: number;
  endAngle: number;
  range: number;
  width: number;
  state: 'charging' | 'firing';
  timer: number;
  maxTimer: number;
  damage: number;
}

export interface TentacleHook {
  id: string;
  bossId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  retracting: boolean;
  timer: number;
  color: string;
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
  isHoming?: boolean;
  homingSpeed?: number;
  homingTurnRate?: number;
  splitOnDeath?: boolean;
  splitCount?: number;
  isVoidWave?: boolean;
  waveWidth?: number;
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
  | 'diamond_gem'
  | 'boss_chest'
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
  | 'streetlight'
  | 'tombstone'
  | 'crypt'
  | 'magma_rock'
  | 'barrier'
  | 'satellite'
  | 'cactus';

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
  // Ultimate Skill
  ultimateCharge: number; // 0 to 100
  isUltimateActive?: boolean;
  ultimateTimer?: number;
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
  // Warrior Equipment Levels (0 = unowned, 1-4 = tier)
  equipment?: Record<EquipmentSlotId, number>;
}

export interface ActiveBuffs {
  doubleDamageTimer: number;
  speedBoostTimer: number;
  freezeEnemiesTimer: number;
  shieldTimer: number;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type GameMode = 'survival' | 'endless';

export type MapEnvironmentId = 
  | 'rooftop' 
  | 'street' 
  | 'bunker' 
  | 'hospital'
  | 'graveyard'
  | 'desert_outpost'
  | 'cyber_facility'
  | 'volcanic_core';

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
  image?: string;
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

export type EquipmentSlotId = 'armor' | 'boots' | 'helmet' | 'gloves' | 'backpack' | 'visor';

export interface EquipmentTierConfig {
  tier: number;
  nameVi: string;
  subtitleVi: string;
  cost: number;
  descVi: string;
  statsDescVi: string[];
  maxArmorBonus?: number;
  damageReduction?: number;
  armorRegenPerSec?: number;
  speedMultBonus?: number;
  dashCooldownBonus?: number;
  maxHpBonus?: number;
  critChanceBonus?: number;
  reloadSpeedBonus?: number;
  damageBonus?: number;
  reserveAmmoBonus?: number;
  grenadeBonus?: number;
  magnetBonus?: number;
  bulletRangeBonus?: number;
  headshotBonus?: number;
  visualColor?: string;
}

export interface EquipmentItem {
  id: EquipmentSlotId;
  nameVi: string;
  categoryVi: string;
  icon: string;
  color: string;
  level: number; // 0 = unowned, 1-4 = tiers
  maxLevel: number;
  tiers: EquipmentTierConfig[];
}

export interface Mission {
  id: string;
  titleVi: string;
  descVi: string;
  target: number;
  current: number;
  rewardGold: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface GameRecordStats {
  highScore: number;
  maxWave: number;
  totalKills: number;
  totalBossKills: number;
  totalGoldEarned: number;
  gamesPlayed: number;
  ultimatesCast: number;
}


