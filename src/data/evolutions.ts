import { WeaponType, WeaponEvolutionConfig } from '../types/game';

export const WEAPON_EVOLUTIONS: Record<WeaponType, WeaponEvolutionConfig> = {
  shotgun: {
    weaponId: 'shotgun',
    requiredSkillId: 'frost_aura',
    evolvedId: 'blizzard_shotgun',
    evolvedNameVi: 'BÃO TUYẾT GAI BĂNG',
    evolvedTitleVi: 'Shotgun Siêu Cấp: Bão Tuyết Gai Băng',
    descVi: 'Bắn ra chùm 10 gai băng sắc nhọn xuyên thấu, 100% cơ hội đóng băng mục tiêu trong 3.5 giây.',
    bonusDescVi: [
      '+4 Mảnh gai băng bổ sung',
      'Đóng băng mục tiêu tức thì',
      'Tăng 60% sát thương xuyên thấu'
    ],
    bulletColor: '#38bdf8',
    damageMultiplier: 1.6,
    fireRateMultiplier: 1.15
  },
  minigun: {
    weaponId: 'minigun',
    requiredSkillId: 'chain_lightning',
    evolvedId: 'storm_minigun',
    evolvedNameVi: 'BÃO LÔI PHÁO LIÊN THANH',
    evolvedTitleVi: 'Minigun Siêu Cấp: Bão Lôi Pháo',
    descVi: 'Tốc độ xả đạn cực đại. Mỗi phát bắn tiếp đất kích hoạt tia sét giật liên hoàn giữa các quái vật lân cận.',
    bonusDescVi: [
      'Phóng tia sét lôi điện trên mọi viên đạn',
      'Băng đạn mở rộng tối đa',
      'Giật choáng kẻ địch 0.3s'
    ],
    bulletColor: '#a855f7',
    damageMultiplier: 1.5,
    fireRateMultiplier: 1.3
  },
  flamethrower: {
    weaponId: 'flamethrower',
    requiredSkillId: 'fire_aura',
    evolvedId: 'napalm_hellfire',
    evolvedNameVi: 'HỎA NGỤC NAPALM',
    evolvedTitleVi: 'Súng Lửa Siêu Cấp: Hỏa Ngục Napalm',
    descVi: 'Dung nham napalm thiêu rụi mặt đất, tạo ra các vũng lửa địa ngục thiêu đốt zombie liên tục.',
    bonusDescVi: [
      'Để lại vệt dung nham cháy 6 giây',
      'Vùng quét lửa mở rộng gấp đôi',
      'Sát thương đốt nhân 2'
    ],
    bulletColor: '#f97316',
    damageMultiplier: 1.7,
    fireRateMultiplier: 1.2
  },
  ak47: {
    weaponId: 'ak47',
    requiredSkillId: 'ricochet',
    evolvedId: 'cyber_rebound_rifle',
    evolvedNameVi: 'XUNG KÍCH PHẢN XẠ',
    evolvedTitleVi: 'AK-47 Siêu Cấp: Xung Kích Phản Xạ',
    descVi: 'Đạn chùm laser phản xạ nảy liên tiếp qua 3 mục tiêu khác nhau, tiêu diệt cả bầy đàn trong tích tắc.',
    bonusDescVi: [
      'Đạn tự nảy 3 lần giữa các mục tiêu',
      'Vận tốc đạn tăng 40%',
      'Sát thương tăng vọt'
    ],
    bulletColor: '#06b6d4',
    damageMultiplier: 1.55,
    fireRateMultiplier: 1.2
  },
  sniper: {
    weaponId: 'sniper',
    requiredSkillId: 'vampiric_leech',
    evolvedId: 'bloodhunter_sniper',
    evolvedNameVi: 'HUYẾT MA XUYÊN PHÁ',
    evolvedTitleVi: 'Sniper Siêu Cấp: Huyết Ma Xuyên Phá',
    descVi: 'Phát bắn xuyên thấu vô tận toàn bộ hàng dọc zombie. Mỗi cú bạo kích hoặc headshot hồi ngay 20 HP.',
    bonusDescVi: [
      'Đạn xuyên thấu không giới hạn',
      'Hồi 20 HP trên mỗi đòn bạo kích',
      'Hiệu ứng tia laser đỏ khát máu'
    ],
    bulletColor: '#e11d48',
    damageMultiplier: 1.8,
    fireRateMultiplier: 1.15
  },
  rpg: {
    weaponId: 'rpg',
    requiredSkillId: 'twin_shot',
    evolvedId: 'apocalypse_cluster_rpg',
    evolvedNameVi: 'ĐẠI PHÁO TẬN THẾ',
    evolvedTitleVi: 'RPG Siêu Cấp: Đại Pháo Tận Thế',
    descVi: 'Đầu đạn tên lửa khi nổ giải phóng thêm 5 quả mini rocket chùm tự động truy quét zombie.',
    bonusDescVi: [
      'Tách thành 5 quả rocket chùm',
      'Bán kính nổ mở rộng 50%',
      'Sát thương hủy diệt diện rộng'
    ],
    bulletColor: '#ef4444',
    damageMultiplier: 1.75,
    fireRateMultiplier: 1.25
  },
  plasma: {
    weaponId: 'plasma',
    requiredSkillId: 'shockwave_armor',
    evolvedId: 'quantum_nova_plasma',
    evolvedNameVi: 'LƯỢNG TỬ PHẢN VẬT CHẤT',
    evolvedTitleVi: 'Plasma Siêu Cấp: Lượng Tử Phản Vật Chất',
    descVi: 'Bắn ra quả cầu năng lượng phản vật chất giải phóng sóng xung kích liên hồi hút và nghiền nát zombie.',
    bonusDescVi: [
      'Sóng xung kích tỏa ra khi cầu di chuyển',
      'Hút nhẹ kẻ địch vào tâm năng lượng',
      'Sát thương nổ cực đại'
    ],
    bulletColor: '#6366f1',
    damageMultiplier: 1.65,
    fireRateMultiplier: 1.2
  },
  pistol: {
    weaponId: 'pistol',
    requiredSkillId: 'adrenaline_rush',
    evolvedId: 'exorcist_magnum',
    evolvedNameVi: 'THÁNH QUANG TRỪ TÀ',
    evolvedTitleVi: 'Pistol Siêu Cấp: Thánh Quang Trừ Tà',
    descVi: 'Súng lục thánh phát hỏa đạn ánh sáng chói lọi, hút ngọc và vàng từ xa, 100% gây sát thương bạo kích.',
    bonusDescVi: [
      'Tự động hút vàng và EXP bán kính lớn',
      'Bạo kích x2.5 sát thương',
      'Băng đạn vô hạn không cần nạp'
    ],
    bulletColor: '#facc15',
    damageMultiplier: 2.2,
    fireRateMultiplier: 1.4
  }
};

export function checkCanEvolveWeapon(
  weaponId: WeaponType,
  weaponLevel: number,
  playerSkills: Record<string, number>,
  evolvedWeapons: string[] = []
): WeaponEvolutionConfig | null {
  const evo = WEAPON_EVOLUTIONS[weaponId];
  if (!evo) return null;
  if (evolvedWeapons.includes(evo.evolvedId)) return null;

  // Can evolve if weapon is level >= 3 (or maxed) and player has the required skill
  const hasSkill = (playerSkills[evo.requiredSkillId] || 0) > 0;
  const highLevel = weaponLevel >= 3;

  if (hasSkill && highLevel) {
    return evo;
  }
  return null;
}
