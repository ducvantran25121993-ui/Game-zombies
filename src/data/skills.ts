import { RoguelikeSkill, RoguelikeSkillId } from '../types/game';

export const ROGUELIKE_SKILLS_DATABASE: Record<RoguelikeSkillId, RoguelikeSkill> = {
  ricochet: {
    id: 'ricochet',
    nameVi: 'Đạn Nảy Đa Mục Tiêu',
    descVi: 'Đạn sau khi bắn trúng quái sẽ nảy sang kẻ địch lân cận với 65% sát thương.',
    icon: 'CornerUpRight',
    rarity: 'rare',
    color: '#38bdf8',
    maxLevel: 3
  },
  explosive_rounds: {
    id: 'explosive_rounds',
    nameVi: 'Hỏa Tiễn Thu Nhỏ',
    descVi: 'Đạn thường có 35% xác suất phát nổ gây sát thương diện rộng và thiêu đốt.',
    icon: 'Bomb',
    rarity: 'rare',
    color: '#f97316',
    maxLevel: 3
  },
  chain_lightning: {
    id: 'chain_lightning',
    nameVi: 'Sét Giật Liên Hoàn',
    descVi: 'Mỗi 3.5 giây giáng một tia sét chuỗi giật qua 4 kẻ địch gần nhất gây choáng.',
    icon: 'Zap',
    rarity: 'legendary',
    color: '#a855f7',
    maxLevel: 3
  },
  frost_aura: {
    id: 'frost_aura',
    nameVi: 'Bão Tuyết Tuyệt Đối',
    descVi: 'Tạo vòng hào quang băng xung quanh người chơi làm chậm 45% quái vật áp sát.',
    icon: 'Snowflake',
    rarity: 'common',
    color: '#06b6d4',
    maxLevel: 3
  },
  vampiric_leech: {
    id: 'vampiric_leech',
    nameVi: 'Huyết Dược Ma Cà Rồng',
    descVi: 'Mỗi khi hạ gục 6 quái vật, lập tức hồi 12 Máu và 6 Giáp bảo hộ.',
    icon: 'HeartPulse',
    rarity: 'common',
    color: '#ef4444',
    maxLevel: 3
  },
  fire_aura: {
    id: 'fire_aura',
    nameVi: 'Vòng Lửa Địa Ngục',
    descVi: 'Vòng lửa thiêu đốt liên tục toàn bộ quái vật quanh người chơi 35 sát thương/giây.',
    icon: 'Flame',
    rarity: 'common',
    color: '#f59e0b',
    maxLevel: 3
  },
  twin_shot: {
    id: 'twin_shot',
    nameVi: 'Song Nòng Hỏa Lực',
    descVi: 'Tất cả các loại súng được bắn thêm +1 tia đạn song song mà không tốn thêm đạn.',
    icon: 'ChevronsUp',
    rarity: 'legendary',
    color: '#eab308',
    maxLevel: 2
  },
  adrenaline_rush: {
    id: 'adrenaline_rush',
    nameVi: 'Cuồng Nộ Chiến Trường',
    descVi: 'Tăng 25% tốc độ xả đạn, giảm 20% thời gian thay đạn và +15% tốc chạy.',
    icon: 'Activity',
    rarity: 'rare',
    color: '#10b981',
    maxLevel: 3
  },
  shockwave_armor: {
    id: 'shockwave_armor',
    nameVi: 'Giáp Sóng Xung Kích',
    descVi: 'Khi bị quái cắn, giáp tự động phát nổ xung kích đánh lùi và hất văng mọi quái xung quanh.',
    icon: 'ShieldAlert',
    rarity: 'common',
    color: '#6366f1',
    maxLevel: 3
  },
  k9_war_dog: {
    id: 'k9_war_dog',
    nameVi: 'Chiến Khuyển K-9 Đồng Đội',
    descVi: 'Triệu hồi Chó Nghiệp Vụ K-9: tự động cắn xé zombie, sủa gầm làm chậm quái, và chạy đi tha ngọc EXP/Đạn về cho chủ nhân!',
    icon: 'Dog',
    rarity: 'legendary',
    color: '#f59e0b',
    maxLevel: 3,
    minPlayerLevel: 2
  },
  midas_jackpot: {
    id: 'midas_jackpot',
    nameVi: 'Thần Tài Hoàng Kim (Kho Báu)',
    descVi: 'Nhận ngay +250,000 Vàng trực tiếp vào ví, tăng +100% tỉ lệ rơi thỏi vàng và đá quý khi hạ boss!',
    icon: 'Sparkles',
    rarity: 'legendary',
    color: '#eab308',
    maxLevel: 10,
    minPlayerLevel: 3
  },
  gold_millionaire: {
    id: 'gold_millionaire',
    nameVi: 'Thẻ Triệu Phú Đỉnh Cao (1M Gold)',
    descVi: 'KÍCH HOẠT ĐỈNH CAO: Bổ sung thẳng +1,000,000 VÀNG (1M) vào tài khoản và +100% sát thương chí mạng!',
    icon: 'Star',
    rarity: 'legendary',
    color: '#fbbf24',
    maxLevel: 3,
    minPlayerLevel: 5
  },
  orbital_laser: {
    id: 'orbital_laser',
    nameVi: 'Laser Quỹ Đạo Vệ Tinh',
    descVi: 'Mỗi 6 giây, chùm tia laser không gian hủy diệt giáng xuống thiêu rụi mục tiêu quái vật mạnh nhất với 2,800 sát thương!',
    icon: 'Zap',
    rarity: 'legendary',
    color: '#38bdf8',
    maxLevel: 3,
    minPlayerLevel: 3
  },
  titan_berserk: {
    id: 'titan_berserk',
    nameVi: 'Chiến Thần Titan Bất Tử',
    descVi: 'Tăng vĩnh viễn +300 Máu tối đa, +120 Giáp chắn, và +40% Sát thương tổng thể!',
    icon: 'Activity',
    rarity: 'rare',
    color: '#ef4444',
    maxLevel: 8,
    minPlayerLevel: 2
  },
  infinite_overdrive: {
    id: 'infinite_overdrive',
    nameVi: 'Quá Tải Băng Đạn Vô Tận',
    descVi: 'Sau mỗi lần lướt Dash hoặc hạ quái lớn, kích hoạt 5 giây xả đạn vô tận không tốn đạn với tốc bắn +60%!',
    icon: 'ChevronsUp',
    rarity: 'legendary',
    color: '#ec4899',
    maxLevel: 3,
    minPlayerLevel: 4
  }
};

export const getRandomSkillDraft = (
  currentSkills: Record<string, number> = {},
  playerLevel: number = 1
): RoguelikeSkill[] => {
  const allSkills = Object.values(ROGUELIKE_SKILLS_DATABASE);
  
  // At high levels (>= 5), prioritize the 1M Gold Millionaire card and High-tier cards
  const available = allSkills.filter(s => {
    const lvl = currentSkills[s.id] || 0;
    if (lvl >= s.maxLevel) return false;
    if (s.minPlayerLevel && playerLevel < s.minPlayerLevel) return false;
    return true;
  });

  // If player is level >= 5 and hasn't picked 1M Gold Millionaire, give it high chance to show
  if (playerLevel >= 5 && (currentSkills['gold_millionaire'] || 0) < 3) {
    const goldSkill = allSkills.find(s => s.id === 'gold_millionaire');
    if (goldSkill && !available.some(s => s.id === 'gold_millionaire')) {
      available.unshift(goldSkill);
    }
  }

  // Fallback if everything is maxed: always provide Midas Jackpot & Titan Berserk so cards never stop!
  if (available.length === 0) {
    return [
      ROGUELIKE_SKILLS_DATABASE.midas_jackpot,
      ROGUELIKE_SKILLS_DATABASE.titan_berserk,
      ROGUELIKE_SKILLS_DATABASE.gold_millionaire
    ];
  }

  if (available.length <= 3) {
    return available;
  }

  // If K-9 war dog is available and not yet unlocked at level >= 2, prioritize showing it
  const dogLvl = currentSkills['k9_war_dog'] || 0;
  const dogSkill = available.find(s => s.id === 'k9_war_dog');
  let selected: RoguelikeSkill[] = [];

  if (dogSkill && dogLvl === 0 && Math.random() < 0.75) {
    selected.push(dogSkill);
  }

  // At high levels (>= 5), guarantee at least one legendary card like 1M Gold or Orbital Laser
  if (playerLevel >= 5 && selected.length < 3) {
    const highLevelLegendary = available.find(s => 
      (s.id === 'gold_millionaire' || s.id === 'midas_jackpot' || s.id === 'orbital_laser') &&
      !selected.some(sel => sel.id === s.id)
    );
    if (highLevelLegendary) {
      selected.push(highLevelLegendary);
    }
  }

  const remaining = available.filter(s => !selected.some(sel => sel.id === s.id));
  const shuffled = [...remaining].sort(() => 0.5 - Math.random());
  
  while (selected.length < 3 && shuffled.length > 0) {
    const next = shuffled.pop();
    if (next) selected.push(next);
  }

  return selected.sort(() => 0.5 - Math.random());
};
