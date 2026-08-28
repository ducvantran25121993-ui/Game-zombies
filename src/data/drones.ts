export type DroneType = 'gatling' | 'plasma' | 'laser' | 'missile';

export interface CompanionDroneConfig {
  id: string;
  name: string;
  nameVi: string;
  codename: string;
  subtitleVi: string;
  descVi: string;
  type: DroneType;
  cost: number;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  damage: number;
  fireRate: number; // ms
  range: number;
  bulletSpeed: number;
  color: string;
  glowColor: string;
  accentColor: string;
  abilitiesVi: string[];
}

export const INITIAL_DRONES: CompanionDroneConfig[] = [
  {
    id: 'drone_vulcan',
    name: 'V-100 Vulcan Hover Mech',
    nameVi: 'Robo Tác Chiến Vulcan V-100',
    codename: 'VULCAN-X',
    subtitleVi: 'Hộ vệ Hỏa Lực Súng Máy Kép',
    descVi: 'Robo cơ động mini trang bị 2 nòng xoay siêu tốc, tự động khóa và nã đạn liên thanh vào mọi quái vật trong phạm vi.',
    type: 'gatling',
    cost: 400,
    unlocked: false, // Locked by default - must purchase in armory shop
    level: 1,
    maxLevel: 5,
    damage: 18,
    fireRate: 220,
    range: 420,
    bulletSpeed: 16,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    accentColor: '#0891b2',
    abilitiesVi: ['Súng máy nòng kép tốc độ 220ms', 'Tự động quét mục tiêu 360°', 'Theo sát mạn trái chiến binh']
  },
  {
    id: 'drone_plasma',
    name: 'P-80 Titan Ion Mech',
    nameVi: 'Robo Pháo Năng Lượng Plasma P-80',
    codename: 'TITAN-ION',
    subtitleVi: 'Hộ vệ Pháo Năng Lượng Diện Rộng',
    descVi: 'Khí tài tác chiến thế hệ mới tích hợp lò phản ứng hạt nhân thu nhỏ, bắn ra các khối plasma phát nổ lan truyền gây sát thương diện rộng.',
    type: 'plasma',
    cost: 750,
    unlocked: false,
    level: 1,
    maxLevel: 5,
    damage: 48,
    fireRate: 580,
    range: 460,
    bulletSpeed: 13,
    color: '#a855f7',
    glowColor: '#c084fc',
    accentColor: '#7e22ce',
    abilitiesVi: ['Bắn cầu Plasma nổ bán kính 80px', 'Gây làm chậm quái vật 35%', 'Theo sát mạn phải chiến binh']
  },
  {
    id: 'drone_laser',
    name: 'L-90 Aegis Beam Scout',
    nameVi: 'Robo Laser Trực Tuyến L-90',
    codename: 'AEGIS-BEAM',
    subtitleVi: 'Hộ vệ Laser Nhiệt & Nam Châm Vàng',
    descVi: 'Robo tuần tra phát chùm tia laser nhiệt độ cao thiêu rụi mục tiêu xuyên thấu, đồng thời tự động hút tiền vàng rơi từ xa về cho chiến binh.',
    type: 'laser',
    cost: 1300,
    unlocked: false,
    level: 1,
    maxLevel: 5,
    damage: 32,
    fireRate: 170,
    range: 500,
    bulletSpeed: 24,
    color: '#ef4444',
    glowColor: '#f87171',
    accentColor: '#b91c1c',
    abilitiesVi: ['Tia Laser nhiệt xuyên thấu 2 mục tiêu', 'Tự động mở rộng bán kính hút vàng +80px', 'Hộ tống tiền tiêu phía trước']
  },
  {
    id: 'drone_missile',
    name: 'R-70 Valkyrie Micro-Launcher',
    nameVi: 'Robo Phóng Tên Lửa Mini R-70',
    codename: 'VALKYRIE-7',
    subtitleVi: 'Hộ vệ Tên Lửa Hủy Diệt Hạng Nặng',
    descVi: 'Robo tối tân hạng nặng trang bị 4 hốc phóng micro-rocket thông minh, khóa mục tiêu trùm và kẻ thù đông đúc gây nổ cực đại.',
    type: 'missile',
    cost: 2100,
    unlocked: false,
    level: 1,
    maxLevel: 5,
    damage: 95,
    fireRate: 950,
    range: 550,
    bulletSpeed: 11,
    color: '#f59e0b',
    glowColor: '#fbbf24',
    accentColor: '#d97706',
    abilitiesVi: ['Tên lửa tầm nhiệt tự động bẻ lái', 'Sát thương nổ cực đại 95+', 'Bảo vệ bọc hậu phía sau chiến binh']
  }
];

export interface ActiveDroneState {
  id: string;
  type: DroneType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  turretAngle: number;
  tilt: number;
  hoverOffset: number;
  lastShotTime: number;
  targetId: string | null;
  targetX?: number;
  targetY?: number;
  laserBeamTimer?: number;
}
