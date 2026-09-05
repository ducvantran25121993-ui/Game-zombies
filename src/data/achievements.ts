import { Achievement } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    titleVi: 'Phát Súng Đầu Tiên',
    descVi: 'Tiêu diệt 25 zombie bất kỳ trong trận chiến.',
    icon: 'Target',
    category: 'combat',
    progress: 0,
    maxProgress: 25,
    completed: false,
    claimed: false,
    rewardGold: 300
  },
  {
    id: 'slayer_500',
    titleVi: 'Kẻ Hủy Diệt Bầy Đàn',
    descVi: 'Tiêu diệt tổng cộng 500 zombie trên mọi trận đấu.',
    icon: 'Skull',
    category: 'combat',
    progress: 0,
    maxProgress: 500,
    completed: false,
    claimed: false,
    rewardGold: 1000
  },
  {
    id: 'headshot_master',
    titleVi: 'Xạ Thủ Tử Thần',
    descVi: 'Ghi được 100 cú bắn trúng đầu (Headshot) chí mạng.',
    icon: 'Crosshair',
    category: 'combat',
    progress: 0,
    maxProgress: 100,
    completed: false,
    claimed: false,
    rewardGold: 800
  },
  {
    id: 'wave_survivor_5',
    titleVi: 'Sống Sót Kiên Cường',
    descVi: 'Vượt qua đợt quái Wave 5 trong chế độ Sinh Tồn.',
    icon: 'Shield',
    category: 'survival',
    progress: 0,
    maxProgress: 5,
    completed: false,
    claimed: false,
    rewardGold: 600
  },
  {
    id: 'wave_survivor_10',
    titleVi: 'Huyền Thoại Bất Tử',
    descVi: 'Vượt qua đợt quái Wave 10 trong chế độ Sinh Tồn.',
    icon: 'Award',
    category: 'survival',
    progress: 0,
    maxProgress: 10,
    completed: false,
    claimed: false,
    rewardGold: 1500
  },
  {
    id: 'weapon_evolved',
    titleVi: 'Bậc Thầy Thần Khí',
    descVi: 'Tiến hóa thành công 1 vũ khí lên trạng thái Thần Khí Siêu Cấp.',
    icon: 'Zap',
    category: 'arsenal',
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    rewardGold: 1200
  },
  {
    id: 'boss_enrage_killer',
    titleVi: 'Kẻ Diệt Trùm Cuồng Nộ',
    descVi: 'Tiêu diệt 1 Trùm khi nó đang kích hoạt trạng thái Cuồng Nộ Phase 2.',
    icon: 'Flame',
    category: 'boss',
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    rewardGold: 1500
  },
  {
    id: 'boss_slayer_3',
    titleVi: 'Thợ Săn Quái Vật',
    descVi: 'Tiêu diệt 3 Trùm đột biến Alpha hoặc Behemoth.',
    icon: 'Crown',
    category: 'boss',
    progress: 0,
    maxProgress: 3,
    completed: false,
    claimed: false,
    rewardGold: 2000
  },
  {
    id: 'freeze_specialist',
    titleVi: 'Kỷ Băng Hà Tận Thế',
    descVi: 'Đóng băng 50 kẻ địch bằng Lựu Đạn Băng (Cryo) hoặc Bão Tuyết Gai Băng.',
    icon: 'Snowflake',
    category: 'combat',
    progress: 0,
    maxProgress: 50,
    completed: false,
    claimed: false,
    rewardGold: 750
  },
  {
    id: 'vortex_master',
    titleVi: 'Hố Đen Nuốt Chửng',
    descVi: 'Ném 5 quả Lựu Đạn Hút Lỗ Đen (Vortex) gom quái thành công.',
    icon: 'Orbit',
    category: 'combat',
    progress: 0,
    maxProgress: 5,
    completed: false,
    claimed: false,
    rewardGold: 700
  },
  {
    id: 'turret_architect',
    titleVi: 'Kỹ Sư Công Sự',
    descVi: 'Triển khai 8 Tháp Súng hoặc Bẫy Điện trên chiến trường.',
    icon: 'Wrench',
    category: 'arsenal',
    progress: 0,
    maxProgress: 8,
    completed: false,
    claimed: false,
    rewardGold: 850
  },
  {
    id: 'gold_magnate',
    titleVi: 'Đại Gia Hậu Tận Thế',
    descVi: 'Tích lũy tổng cộng 5,000 Vàng trong kho.',
    icon: 'Coins',
    category: 'survival',
    progress: 0,
    maxProgress: 5000,
    completed: false,
    claimed: false,
    rewardGold: 1000
  }
];

const STORAGE_KEY = 'zombie_apocalypse_achievements_v1';

export function loadSavedAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const parsed = JSON.parse(raw);
    return INITIAL_ACHIEVEMENTS.map(initial => {
      const saved = parsed.find((p: Achievement) => p.id === initial.id);
      if (!saved) return initial;
      return {
        ...initial,
        progress: Math.min(initial.maxProgress, Math.max(0, saved.progress || 0)),
        completed: saved.completed || (saved.progress || 0) >= initial.maxProgress,
        claimed: !!saved.claimed
      };
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}
