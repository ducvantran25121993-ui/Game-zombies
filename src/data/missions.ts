import { Mission, GameRecordStats } from '../types/game';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'first_blood',
    titleVi: 'Thanh Trừng Dịch Bệnh',
    descVi: 'Tiêu diệt 100 quái vật trong chiến dịch sinh tồn',
    target: 100,
    current: 0,
    rewardGold: 450,
    completed: false,
    claimed: false,
    icon: 'Crosshair',
    difficulty: 'hard'
  },
  {
    id: 'combo_master',
    titleVi: 'Bão Lửa Liên Hoàn',
    descVi: 'Đạt chuỗi 35x Combo cuồng sát không ngắt quãng',
    target: 35,
    current: 0,
    rewardGold: 700,
    completed: false,
    claimed: false,
    icon: 'Flame',
    difficulty: 'expert'
  },
  {
    id: 'headshot_marksman',
    titleVi: 'Xạ Thủ Bách Phát Bách Trúng',
    descVi: 'Hạ gục 40 zombie bằng phát đạn Headshot chuẩn xác',
    target: 40,
    current: 0,
    rewardGold: 650,
    completed: false,
    claimed: false,
    icon: 'Target',
    difficulty: 'hard'
  },
  {
    id: 'boss_slayer',
    titleVi: 'Kẻ Hành Quyết Trùm Tinh Anh',
    descVi: 'Tiêu diệt 3 Trùm đột biến khổng lồ',
    target: 3,
    current: 0,
    rewardGold: 1200,
    completed: false,
    claimed: false,
    icon: 'Skull',
    difficulty: 'expert'
  },
  {
    id: 'ultimate_power',
    titleVi: 'Bão Tố Hủy Diệt',
    descVi: 'Kích hoạt Kỹ năng Tuyệt kỹ (Ultimate) 5 lần càn quét chiến trường',
    target: 5,
    current: 0,
    rewardGold: 800,
    completed: false,
    claimed: false,
    icon: 'Zap',
    difficulty: 'hard'
  },
  {
    id: 'wave_veteran',
    titleVi: 'Sinh Tồn Đợt Khốc Liệt',
    descVi: 'Vượt qua thành công Đợt 6 (Wave 6) đầy thử thách',
    target: 6,
    current: 0,
    rewardGold: 1000,
    completed: false,
    claimed: false,
    icon: 'Shield',
    difficulty: 'expert'
  },
  {
    id: 'gold_tycoon',
    titleVi: 'Đại Gia Quân Nhu',
    descVi: 'Tích lũy đạt 3,500 Vàng trong kho chiến lợi phẩm',
    target: 3500,
    current: 0,
    rewardGold: 1500,
    completed: false,
    claimed: false,
    icon: 'DollarSign',
    difficulty: 'expert'
  },
  {
    id: 'zombie_annihilator',
    titleVi: 'Cơn Ác Mộng Của Xác Sống',
    descVi: 'Tiêu diệt tổng cộng 500 quái vật trong chiến dịch',
    target: 500,
    current: 0,
    rewardGold: 2200,
    completed: false,
    claimed: false,
    icon: 'Award',
    difficulty: 'nightmare'
  },
  {
    id: 'wave_nightmare_apocalypse',
    titleVi: 'Vượt Qua Vùng Tử Thần',
    descVi: 'Sống sót qua Đợt 10 (Wave 10) - cấp độ tử thần của thành phố',
    target: 10,
    current: 0,
    rewardGold: 3000,
    completed: false,
    claimed: false,
    icon: 'Trophy',
    difficulty: 'nightmare'
  },
  {
    id: 'k9_tactical_synergy',
    titleVi: 'Chiến Khuyển Đồng Đội Bọc Thép',
    descVi: 'Triệu hồi & Nâng cấp K-9 Đồng Đội đạt từ Cấp 2 trở lên',
    target: 2,
    current: 0,
    rewardGold: 1000,
    completed: false,
    claimed: false,
    icon: 'Dog',
    difficulty: 'hard'
  }
];

const STATS_STORAGE_KEY = 'zombie_outbreak_record_stats';
const MISSIONS_STORAGE_KEY = 'zombie_outbreak_missions';

export function loadRecordStats(): GameRecordStats {
  try {
    const data = localStorage.getItem(STATS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore storage errors
  }
  return {
    highScore: 0,
    maxWave: 1,
    totalKills: 0,
    totalBossKills: 0,
    totalGoldEarned: 0,
    gamesPlayed: 0,
    ultimatesCast: 0
  };
}

export function saveRecordStats(stats: Partial<GameRecordStats>): GameRecordStats {
  const current = loadRecordStats();
  const updated: GameRecordStats = {
    highScore: Math.max(current.highScore, stats.highScore || 0),
    maxWave: Math.max(current.maxWave, stats.maxWave || 1),
    totalKills: current.totalKills + (stats.totalKills || 0),
    totalBossKills: current.totalBossKills + (stats.totalBossKills || 0),
    totalGoldEarned: current.totalGoldEarned + (stats.totalGoldEarned || 0),
    gamesPlayed: current.gamesPlayed + (stats.gamesPlayed || 0),
    ultimatesCast: current.ultimatesCast + (stats.ultimatesCast || 0)
  };
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function loadSavedMissions(): Mission[] {
  try {
    const data = localStorage.getItem(MISSIONS_STORAGE_KEY);
    if (data) {
      const saved = JSON.parse(data);
      // Merge with INITIAL_MISSIONS enforcing new target & reward values
      return INITIAL_MISSIONS.map(m => {
        const found = saved.find((s: Mission) => s.id === m.id);
        if (found) {
          const current = Math.max(0, found.current || 0);
          const completed = current >= m.target;
          return {
            ...m,
            current,
            completed,
            claimed: Boolean(found.claimed && completed)
          };
        }
        return m;
      });
    }
  } catch {
    // Ignore
  }
  return JSON.parse(JSON.stringify(INITIAL_MISSIONS));
}

export function saveMissions(missions: Mission[]): void {
  try {
    localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(missions));
  } catch {
    // Ignore
  }
}
