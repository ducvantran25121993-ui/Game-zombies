export interface PlayerProfile {
  playerName: string;
  level: number;
  exp: number;
  maxExp: number;
  title: string;
  totalKills?: number;
  highestWave?: number;
  lastUpdated?: number;
}

export const PROFILE_STORAGE_KEY = 'zombie_player_profile';

export const SUGGESTED_NAMES = [
  'Chiến Binh Alpha',
  'Đặc Nhiệm Ghost',
  'Sát Thủ Shadow',
  'Xạ Thủ Phoenix',
  'Biệt Kích Viper',
  'Đao Phủ Titan',
  'Thợ Săn Quái Vật',
  'Chiến Binh Rambo',
  'Đặc Nhiệm Bão Lửa',
  'Thủ Lĩnh Kháng Chiến',
  'Siêu Xạ Thủ Raven',
  'Chiến Thần Tận Thế'
];

/**
 * Tính toán danh hiệu quân hàm dựa trên cấp độ người chơi
 */
export function getRankTitle(level: number): string {
  if (level >= 30) return 'Đại Tướng Bất Tử';
  if (level >= 25) return 'Thống Soái Diệt Quái';
  if (level >= 20) return 'Huyền Thoại Tận Thế';
  if (level >= 15) return 'Chỉ Huy Biệt Kích';
  if (level >= 10) return 'Xạ Thủ Tinh Nhuệ';
  if (level >= 6) return 'Đặc Nhiệm Bão Lửa';
  if (level >= 3) return 'Chiến Binh Cảm Tử';
  return 'Tân Binh Sinh Tồn';
}

/**
 * Tính toán lượng EXP cần thiết để lên cấp tiếp theo
 */
export function getMaxExpForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.22, Math.max(0, level - 1)));
}

/**
 * Tải hồ sơ người chơi từ localStorage
 */
export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const level = Math.max(1, Number(data.level) || 1);
      const maxExp = getMaxExpForLevel(level);
      const exp = Math.max(0, Math.min(Number(data.exp) || 0, maxExp - 1));
      const playerName = (typeof data.playerName === 'string' && data.playerName.trim()) 
        ? data.playerName.trim().slice(0, 20) 
        : 'Chiến Binh Alpha';

      return {
        playerName,
        level,
        exp,
        maxExp,
        title: getRankTitle(level),
        totalKills: Number(data.totalKills) || 0,
        highestWave: Number(data.highestWave) || 1,
        lastUpdated: Number(data.lastUpdated) || Date.now()
      };
    }
  } catch {
    // Ignore parse error
  }

  // Mặc định cho người chơi mới
  return {
    playerName: 'Chiến Binh Alpha',
    level: 1,
    exp: 0,
    maxExp: 100,
    title: getRankTitle(1),
    totalKills: 0,
    highestWave: 1,
    lastUpdated: Date.now()
  };
}

/**
 * Lưu hồ sơ người chơi vào localStorage
 */
export function savePlayerProfile(partial: Partial<PlayerProfile>): PlayerProfile {
  const current = loadPlayerProfile();
  const level = partial.level !== undefined ? Math.max(1, partial.level) : current.level;
  const maxExp = getMaxExpForLevel(level);
  const exp = partial.exp !== undefined ? Math.max(0, partial.exp) : current.exp;
  const playerName = (partial.playerName && partial.playerName.trim())
    ? partial.playerName.trim().slice(0, 20)
    : current.playerName;

  const updated: PlayerProfile = {
    ...current,
    ...partial,
    playerName,
    level,
    exp,
    maxExp,
    title: getRankTitle(level),
    lastUpdated: Date.now()
  };

  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage write error
  }

  return updated;
}
