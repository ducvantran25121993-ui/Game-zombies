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
    radius: 48,
    hp: 3600,
    speed: 1.65,
    damage: 55,
    score: 5000,
    gold: 1100,
    color: '#e11d48'
  },
  boss_abomination: {
    nameVi: 'CHÚA TỂ HỖN MANG',
    radius: 54,
    hp: 6800,
    speed: 1.7,
    damage: 70,
    score: 9500,
    gold: 1700,
    color: '#9333ea'
  },
  boss_cyber_behemoth: {
    nameVi: 'QUÁI VẬT CYBER MECHA',
    radius: 54,
    hp: 11000,
    speed: 1.75,
    damage: 85,
    score: 14000,
    gold: 2400,
    color: '#06b6d4'
  },
  boss_inferno_titan: {
    nameVi: 'BẠO CHÚA LỬA ĐỊA NGỤC',
    radius: 60,
    hp: 15500,
    speed: 1.8,
    damage: 105,
    score: 20000,
    gold: 3200,
    color: '#f97316'
  },
  boss_void_reaper: {
    nameVi: 'TỬ THẦN HƯ VÔ TỐI THƯỢNG',
    radius: 64,
    hp: 22000,
    speed: 1.9,
    damage: 130,
    score: 32000,
    gold: 4500,
    color: '#6366f1'
  }
};

export interface BossSkillInfo {
  nameVi: string;
  icon: string;
  descVi: string;
  tag: string;
}

export interface BossMetaInfo {
  type: string;
  nameVi: string;
  titleVi: string;
  signatureWave: number;
  badge: string;
  themeColor: string;
  skills: BossSkillInfo[];
}

export const BOSS_SKILL_DATABASE: Record<string, BossMetaInfo> = {
  boss_mutant: {
    type: 'boss_mutant',
    nameVi: 'TRÙM ĐỘT BIẾN HUỶ DIỆT',
    titleVi: 'VÒNG 1: QUÁI ĐỘT BIẾN ĐỊA CHẤN',
    signatureWave: 1,
    badge: 'ĐỘC TỐ & ĐỊA CHẤN',
    themeColor: '#e11d48',
    skills: [
      { nameVi: 'ĐỊA CHẤN TÀN PHÁ', icon: '💥', tag: 'SLAM', descVi: 'Dộng đất 360° đẩy lùi người chơi & sinh 4 bãi axit sôi sùng sục ăn mòn' },
      { nameVi: 'LAO HÚC TÀN BẠO', icon: '⚡', tag: 'CHARGE', descVi: 'Gầm rú lao tốc biến cực đại nghiền nát vật cản và húc văng mục tiêu' },
      { nameVi: 'PHÁO AXIT TAM HƯỚNG', icon: '☣️', tag: 'ACID', descVi: 'Nã 3 bọc bùn axit màu xanh lục huỳnh quang gây sát thương diện rộng' }
    ]
  },
  boss_abomination: {
    type: 'boss_abomination',
    nameVi: 'CHÚA TỂ HỖN MANG',
    titleVi: 'VÒNG 2: CHÚA TỂ BÓNG TỐI HỖN MANG',
    signatureWave: 2,
    badge: 'HẮC ÁM & DỊCH CHUYỂN',
    themeColor: '#a855f7',
    skills: [
      { nameVi: 'DỊCH CHUYỂN BÓNG TỐI', icon: '🌌', tag: 'BLINK', descVi: 'Hóa bóng ma vô hình rồi bất ngờ xuất hiện sau lưng chém quét bất ngờ' },
      { nameVi: 'XÚC TU HẮC ÁM', icon: '🕸️', tag: 'PULL', descVi: 'Phóng xúc tu vươn dài kéo giật người chơi về phía trùm và làm chậm' },
      { nameVi: 'CẦU HỖN MANG PHÂN TỬ', icon: '🔮', tag: 'SPLIT', descVi: 'Quả cầu hắc ám khổng lồ bay chậm rồi phát nổ vỡ thành 8 quả cầu gai tỏa tròn' }
    ]
  },
  boss_cyber_behemoth: {
    type: 'boss_cyber_behemoth',
    nameVi: 'QUÁI VẬT CYBER MECHA',
    titleVi: 'VÒNG 3: QUÁI THÚ CƠ GIỚI MECHA',
    signatureWave: 3,
    badge: 'LASER & TÊN LỬA TẦM NHIỆT',
    themeColor: '#06b6d4',
    skills: [
      { nameVi: 'TIA QUÉT LASER TỬ THẦN', icon: '🔴', tag: 'LASER', descVi: 'Tụ năng lượng quét tia laser đỏ rực khổng lồ góc 70 độ cắt ngang bản đồ' },
      { nameVi: 'LOẠT TÊN LỬA TẦM NHIỆT', icon: '🚀', tag: 'HOMING', descVi: 'Phóng 3 tên lửa đuôi khói lửa tự động uốn lượn rượt đuổi người chơi' },
      { nameVi: 'KHIÊN ĐIỆN TỪ HẤP THỤ', icon: '🛡️', tag: 'SHIELD', descVi: 'Bật lá chắn vòm cyan giảm 50% sát thương nhận và xả xung điện EMP' }
    ]
  },
  boss_inferno_titan: {
    type: 'boss_inferno_titan',
    nameVi: 'BẠO CHÚA LỬA ĐỊA NGỤC',
    titleVi: 'VÒNG 4: BẠO CHÚA LỬA ĐỊA NGỤC',
    signatureWave: 4,
    badge: 'THIÊN THẠCH & BIỂN LỬA',
    themeColor: '#f97316',
    skills: [
      { nameVi: 'MƯA THIÊN THẠCH DUNG NHAM', icon: '☄️', tag: 'METEOR', descVi: 'Khóa 3 hồng tâm lửa trước khi giáng thiên thạch khổng lồ nổ tung thành biển dung nham' },
      { nameVi: 'BÃO LỬA LUÂN HỒI', icon: '🌀', tag: 'SPIRAL', descVi: 'Xoay tròn xả 12 quả cầu lửa đạn mạc xoắn ốc tỏa kín mọi hướng' },
      { nameVi: 'VẾT CHÂN DUNG NHAM', icon: '🔥', tag: 'LAVA', descVi: 'Di chuyển để lại các vũng nham thạch sôi sục thiêu đốt mặt đất' }
    ]
  },
  boss_void_reaper: {
    type: 'boss_void_reaper',
    nameVi: 'TỬ THẦN HƯ VÔ TỐI THƯỢNG',
    titleVi: 'VÒNG 5+: TỬ THẦN HƯ VÔ TỐI THƯỢNG',
    signatureWave: 5,
    badge: 'HỐ ĐEN & TRẢM KÍCH HƯ VÔ',
    themeColor: '#6366f1',
    skills: [
      { nameVi: 'HỐ ĐEN TRỌNG LỰC HƯ VÔ', icon: '🕳️', tag: 'BLACK_HOLE', descVi: 'Đặt lỗ đen xoáy tím khổng lồ hút người chơi và uốn cong đường đạn' },
      { nameVi: 'TRẢM KÍCH HƯ VÔ TAM ĐOẠN', icon: '⚔️', tag: 'SLASH', descVi: 'Chém 3 làn sóng hình trăng khuyết khổng lồ bay xuyên qua mọi vật cản' },
      { nameVi: 'ẢO ẢNH PHÂN THÂN BÓNG MA', icon: '👥', tag: 'CLONE', descVi: 'Phân tách tạo ảo ảnh chiến đấu song song gia tăng áp lực cực đại' }
    ]
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
