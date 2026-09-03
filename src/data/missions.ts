import { Mission, GameRecordStats } from '../types/game';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'first_blood',
    titleVi: 'Khai Hỏa Đầu Tiên',
    descVi: 'Tiêu diệt 25 quái vật bất kỳ',
    target: 25,
    current: 0,
    rewardGold: 150,
    completed: false,
    claimed: false,
    icon: 'Crosshair'
  },
  {
    id: 'combo_master',
    titleVi: 'Sát Thủ Bão Lửa',
    descVi: 'Đạt chuỗi 15x Combo liên sát',
    target: 15,
    current: 0,
    rewardGold: 250,
    completed: false,
    claimed: false,
    icon: 'Flame'
  },
  {
    id: 'boss_slayer',
    titleVi: 'Đao Phủ Diệt Trùm',
    descVi: 'Tiêu diệt 1 Trùm đột biến nguy hiểm',
    target: 1,
    current: 0,
    rewardGold: 400,
    completed: false,
    claimed: false,
    icon: 'Skull'
  },
  {
    id: 'ultimate_power',
    titleVi: 'Sức Mạnh Tối Thượng',
    descVi: 'Kích hoạt Kỹ năng Tuyệt kỹ (Ultimate) 2 lần',
    target: 2,
    current: 0,
    rewardGold: 300,
    completed: false,
    claimed: false,
    icon: 'Zap'
  },
  {
    id: 'wave_veteran',
    titleVi: 'Chiến Binh Bất Khuất',
    descVi: 'Sống sót thành công qua Đợt 3 (Wave 3)',
    target: 3,
    current: 0,
    rewardGold: 500,
    completed: false,
    claimed: false,
    icon: 'Shield'
  },
  {
    id: 'gold_tycoon',
    titleVi: 'Kho Báu Chiến Trường',
    descVi: 'Tích lũy đạt 1,000 vàng trong trận chiến',
    target: 1000,
    current: 0,
    rewardGold: 600,
    completed: false,
    claimed: false,
    icon: 'DollarSign'
  },
  {
    id: 'zombie_annihilator',
    titleVi: 'Hủy Diệt Bầy Đàn',
    descVi: 'Tiêu diệt tổng cộng 150 quái vật',
    target: 150,
    current: 0,
    rewardGold: 800,
    completed: false,
    claimed: false,
    icon: 'Award'
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
      // Merge with INITIAL_MISSIONS in case of new additions
      return INITIAL_MISSIONS.map(m => {
        const found = saved.find((s: Mission) => s.id === m.id);
        return found ? { ...m, ...found } : m;
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
