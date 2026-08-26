import { Weapon, ZombieType } from '../types/game';

export const INITIAL_WEAPONS: Record<string, Weapon> = {
  pistol: {
    id: 'pistol',
    name: 'Glock-19 9mm',
    nameVi: 'Súng Lục 9mm',
    damage: 28,
    fireRate: 260, // ms
    reloadTime: 1100, // ms
    magSize: 12,
    currentMag: 12,
    reserveAmmo: -1, // vô hạn
    spread: 0.05,
    bulletSpeed: 14,
    bulletCount: 1,
    bulletRange: 750,
    pierce: 1,
    knockback: 3,
    unlocked: true,
    cost: 0,
    level: 1,
    color: '#fbbf24',
    bulletColor: '#fef08a',
    icon: 'Crosshair',
    soundType: 'pistol'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Remington 870 12G',
    nameVi: 'Súng Săn 12-Gauge',
    damage: 22, // 22 x 6 pellets = 132 close range
    fireRate: 750,
    reloadTime: 1800,
    magSize: 8,
    currentMag: 8,
    reserveAmmo: 64,
    spread: 0.28,
    bulletSpeed: 13,
    bulletCount: 6,
    bulletRange: 550,
    pierce: 1,
    knockback: 10,
    unlocked: false,
    cost: 350,
    level: 1,
    color: '#f97316',
    bulletColor: '#fdba74',
    icon: 'Flame',
    soundType: 'shotgun'
  },
  ak47: {
    id: 'ak47',
    name: 'AK-47 Kalashnikov',
    nameVi: 'Súng Trường Tấn Công',
    damage: 34,
    fireRate: 110,
    reloadTime: 1500,
    magSize: 30,
    currentMag: 30,
    reserveAmmo: 180,
    spread: 0.09,
    bulletSpeed: 16,
    bulletCount: 1,
    bulletRange: 900,
    pierce: 1,
    knockback: 4,
    unlocked: false,
    cost: 650,
    level: 1,
    color: '#ef4444',
    bulletColor: '#fca5a5',
    icon: 'Zap',
    soundType: 'rifle'
  },
  sniper: {
    id: 'sniper',
    name: 'Barrett .50 Cal',
    nameVi: 'Súng Bắn Tỉa Công Phá',
    damage: 260,
    fireRate: 1100,
    reloadTime: 2200,
    magSize: 5,
    currentMag: 5,
    reserveAmmo: 30,
    spread: 0.01,
    bulletSpeed: 24,
    bulletCount: 1,
    bulletRange: 1400,
    pierce: 4,
    knockback: 14,
    unlocked: false,
    cost: 1100,
    level: 1,
    color: '#38bdf8',
    bulletColor: '#bae6fd',
    icon: 'Target',
    soundType: 'sniper'
  },
  minigun: {
    id: 'minigun',
    name: 'M134 Vulcan 6-Barrel',
    nameVi: 'Súng Máy Đại Liên 6 Nòng',
    damage: 26,
    fireRate: 55,
    reloadTime: 2800,
    magSize: 150,
    currentMag: 150,
    reserveAmmo: 450,
    spread: 0.16,
    bulletSpeed: 17,
    bulletCount: 1,
    bulletRange: 850,
    pierce: 1,
    knockback: 3,
    unlocked: false,
    cost: 1800,
    level: 1,
    color: '#a855f7',
    bulletColor: '#d8b4fe',
    icon: 'Activity',
    soundType: 'heavy'
  },
  rpg: {
    id: 'rpg',
    name: 'RPG-7 Rocket Launcher',
    nameVi: 'Súng Phóng Lựu RPG Nổ Lan',
    damage: 320,
    fireRate: 1500,
    reloadTime: 2500,
    magSize: 1,
    currentMag: 1,
    reserveAmmo: 15,
    spread: 0.02,
    bulletSpeed: 10,
    bulletCount: 1,
    bulletRange: 1000,
    pierce: 1,
    knockback: 22,
    unlocked: false,
    cost: 2500,
    level: 1,
    color: '#eab308',
    bulletColor: '#fde047',
    icon: 'Bomb',
    soundType: 'rocket'
  },
  plasma: {
    id: 'plasma',
    name: 'Plasma Disintegrator',
    nameVi: 'Súng Năng Lượng Plasma',
    damage: 75,
    fireRate: 130,
    reloadTime: 1600,
    magSize: 45,
    currentMag: 45,
    reserveAmmo: 225,
    spread: 0.04,
    bulletSpeed: 18,
    bulletCount: 1,
    bulletRange: 950,
    pierce: 2,
    knockback: 6,
    unlocked: false,
    cost: 3600,
    level: 1,
    color: '#06b6d4',
    bulletColor: '#67e8f9',
    icon: 'Radio',
    soundType: 'plasma'
  }
};

export const ZOMBIE_TEMPLATES: Record<ZombieType, {
  nameVi: string;
  radius: number;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  gold: number;
  color: string;
}> = {
  walker: {
    nameVi: 'Zombie Đi Bộ',
    radius: 17,
    hp: 55,
    speed: 1.6,
    damage: 12,
    score: 100,
    gold: 15,
    color: '#4ade80'
  },
  runner: {
    nameVi: 'Zombie Chạy Nhanh',
    radius: 14,
    hp: 35,
    speed: 3.2,
    damage: 10,
    score: 160,
    gold: 25,
    color: '#f87171'
  },
  tank: {
    nameVi: 'Zombie Đột Biến Khổng Lồ',
    radius: 28,
    hp: 360,
    speed: 1.1,
    damage: 28,
    score: 450,
    gold: 80,
    color: '#a78bfa'
  },
  spitter: {
    nameVi: 'Zombie Phun Axit',
    radius: 18,
    hp: 80,
    speed: 1.5,
    damage: 15,
    score: 250,
    gold: 45,
    color: '#facc15'
  },
  bomber: {
    nameVi: 'Zombie Cảm Tử (Phát Nổ)',
    radius: 16,
    hp: 45,
    speed: 2.8,
    damage: 55,
    score: 300,
    gold: 50,
    color: '#fb923c'
  },
  boss_mutant: {
    nameVi: 'TRÙM ĐỘT BIẾN HUỶ DIỆT',
    radius: 46,
    hp: 1800,
    speed: 1.4,
    damage: 42,
    score: 4000,
    gold: 850,
    color: '#e11d48'
  },
  boss_abomination: {
    nameVi: 'CHÚA TỂ HỖN MANG',
    radius: 54,
    hp: 3200,
    speed: 1.45,
    damage: 52,
    score: 7500,
    gold: 1350,
    color: '#9333ea'
  },
  boss_cyber_behemoth: {
    nameVi: 'QUÁI VẬT CYBER MECHA',
    radius: 52,
    hp: 4800,
    speed: 1.5,
    damage: 60,
    score: 11000,
    gold: 1850,
    color: '#06b6d4'
  },
  boss_inferno_titan: {
    nameVi: 'BẠO CHÚA LỬA ĐỊA NGỤC',
    radius: 58,
    hp: 6500,
    speed: 1.55,
    damage: 70,
    score: 16000,
    gold: 2400,
    color: '#f97316'
  },
  boss_void_reaper: {
    nameVi: 'TỬ THẦN HƯ VÔ TỐI THƯỢNG',
    radius: 62,
    hp: 9000,
    speed: 1.65,
    damage: 85,
    score: 25000,
    gold: 3500,
    color: '#6366f1'
  }
};

export const UPGRADES_CONFIG = [
  {
    id: 'maxHpLevel',
    nameVi: 'Tăng Lượng Máu Tối Đa',
    desc: '+25 Máu tối đa và hồi đầy máu ngay lập tức',
    baseCost: 150,
    costMultiplier: 1.6,
    maxLevel: 10,
    icon: 'Heart'
  },
  {
    id: 'armorLevel',
    nameVi: 'Áo Giáp Chống Đạn',
    desc: '+20 Giáp hấp thụ 70% sát thương nhận vào',
    baseCost: 200,
    costMultiplier: 1.7,
    maxLevel: 8,
    icon: 'Shield'
  },
  {
    id: 'speedLevel',
    nameVi: 'Tốc Độ Di Chuyển',
    desc: '+8% Tốc độ di chuyển và hồi thể lực Lướt nhanh hơn',
    baseCost: 180,
    costMultiplier: 1.65,
    maxLevel: 6,
    icon: 'Footprints'
  },
  {
    id: 'reloadLevel',
    nameVi: 'Kỹ Năng Thay Đạn Thần Tốc',
    desc: 'Giảm 12% thời gian thay đạn cho mọi vũ khí',
    baseCost: 220,
    costMultiplier: 1.8,
    maxLevel: 5,
    icon: 'RefreshCw'
  },
  {
    id: 'critChanceLevel',
    nameVi: 'Bắn Chuẩn Chí Mạng',
    desc: '+6% Cơ hội bắn trúng điểm yếu gây x2.5 sát thương',
    baseCost: 250,
    costMultiplier: 1.85,
    maxLevel: 6,
    icon: 'Target'
  },
  {
    id: 'bulletDamageLevel',
    nameVi: 'Hỏa Lực Toàn Phần',
    desc: '+10% Sát thương cho tất cả các loại súng',
    baseCost: 300,
    costMultiplier: 1.9,
    maxLevel: 10,
    icon: 'Sword'
  },
  {
    id: 'magnetRadiusLevel',
    nameVi: 'Nam Châm Hút Vật Phẩm',
    desc: 'Tự động hút vàng và vật phẩm hỗ trợ từ xa',
    baseCost: 150,
    costMultiplier: 1.5,
    maxLevel: 5,
    icon: 'Magnet'
  }
];

export const MAP_SIZE = {
  width: 2600,
  height: 2000
};
