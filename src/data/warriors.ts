import commandoImg from '../assets/images/warrior_avatar_portrait_1787653097044.jpg';
import ghostImg from '../assets/images/warrior_ghost_skin_1787653148800.jpg';
import cyberImg from '../assets/images/warrior_cyber_skin_1787653169311.jpg';
import heroBannerImg from '../assets/images/warrior_hero_banner_1787653075087.jpg';

export interface WarriorClass {
  id: string;
  nameVi: string;
  codename: string;
  titleVi: string;
  descriptionVi: string;
  avatar: string;
  primaryColor: string;
  accentColor: string;
  visorColor: string;
  laserColor: string;
  armorType: 'standard' | 'stealth' | 'heavy' | 'valkyrie';
  bonusDesc: string;
  perks: {
    hpMultiplier: number;
    armorMultiplier: number;
    speedMultiplier: number;
    dashCooldownReduction: number;
    damageMultiplier: number;
  };
  unlockedByDefault: boolean;
  unlockCost: number;
}

export const WARRIOR_HERO_BANNER = heroBannerImg;

export const WARRIOR_CLASSES: WarriorClass[] = [
  {
    id: 'commando',
    nameVi: 'Đặc Nhiệm Commando',
    codename: 'ALPHA-01',
    titleVi: 'Chiến Binh Đột Kích Tinh Nhuệ',
    descriptionVi: 'Được huấn luyện bài bản trong môi trường sinh tồn khắc nghiệt. Chỉ số toàn diện và cân bằng nhất trên mọi địa hình tác chiến.',
    avatar: commandoImg,
    primaryColor: '#0284c7', // Sky Blue
    accentColor: '#38bdf8',
    visorColor: '#38bdf8',
    laserColor: '#ef4444',
    armorType: 'standard',
    bonusDesc: 'Cân bằng hoàn hảo: +10% Tốc độ nạp đạn, Hồi thể lực nhanh',
    perks: {
      hpMultiplier: 1.0,
      armorMultiplier: 1.0,
      speedMultiplier: 1.0,
      dashCooldownReduction: 0,
      damageMultiplier: 1.0
    },
    unlockedByDefault: true,
    unlockCost: 0
  },
  {
    id: 'ghost',
    nameVi: 'Bóng Ma Chiến Trường',
    codename: 'GHOST-SNIPER',
    titleVi: 'Sát Thủ Ngụy Trang & Cơ Động',
    descriptionVi: 'Trang bị áo giáp tàng hình quang học siêu nhẹ và kính nhìn đêm NVG tia lục. Tốc độ di chuyển và thời gian hồi Lướt thần tốc.',
    avatar: ghostImg,
    primaryColor: '#10b981', // Emerald green
    accentColor: '#34d399',
    visorColor: '#10b981',
    laserColor: '#10b981',
    armorType: 'stealth',
    bonusDesc: '+18% Tốc độ chạy & Giảm 25% hồi chiêu Lướt Né Đòn',
    perks: {
      hpMultiplier: 0.9,
      armorMultiplier: 0.85,
      speedMultiplier: 1.18,
      dashCooldownReduction: 0.25,
      damageMultiplier: 1.08
    },
    unlockedByDefault: false,
    unlockCost: 500
  },
  {
    id: 'cyber',
    nameVi: 'Tiên Phong Thiết Giáp',
    codename: 'VANGUARD-TITAN',
    titleVi: 'Cơ Giáp Trợ Lực Hạng Nặng',
    descriptionVi: 'Khoác lên mình bộ giáp trợ lực Exoskeleton mạ hợp kim Titan và kính ngắm ba chiều Hologram. Khả năng chống chịu phi thường.',
    avatar: cyberImg,
    primaryColor: '#f59e0b', // Amber/Gold
    accentColor: '#fbbf24',
    visorColor: '#f59e0b',
    laserColor: '#f59e0b',
    armorType: 'heavy',
    bonusDesc: '+40% Giáp tối đa & +15% Sức công phá súng hạng nặng',
    perks: {
      hpMultiplier: 1.25,
      armorMultiplier: 1.4,
      speedMultiplier: 0.94,
      dashCooldownReduction: -0.1,
      damageMultiplier: 1.15
    },
    unlockedByDefault: false,
    unlockCost: 1000
  }
];
