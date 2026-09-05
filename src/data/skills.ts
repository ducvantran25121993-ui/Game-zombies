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
  }
};

export const getRandomSkillDraft = (currentSkills: Record<string, number> = {}): RoguelikeSkill[] => {
  const allSkills = Object.values(ROGUELIKE_SKILLS_DATABASE);
  // Filter out maxed skills
  const available = allSkills.filter(s => {
    const lvl = currentSkills[s.id] || 0;
    return lvl < s.maxLevel;
  });

  if (available.length <= 3) {
    return available;
  }

  // Shuffle and pick 3
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};
