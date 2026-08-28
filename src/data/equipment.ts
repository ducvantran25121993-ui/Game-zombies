import { EquipmentSlotId, EquipmentItem } from '../types/game';

export const INITIAL_EQUIPMENT: Record<EquipmentSlotId, EquipmentItem> = {
  armor: {
    id: 'armor',
    nameVi: 'Áo Giáp Chống Đạn & Hấp Thụ Lực',
    categoryVi: 'Giáp Thân',
    icon: 'Shield',
    color: '#38bdf8',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Áo Giáp Tác Chiến Kevlar Lớp 1',
        subtitleVi: 'Trang Bị Bộ Binh Tiêu Chuẩn',
        cost: 220,
        descVi: 'Gia cố sợi tổng hợp Kevlar giúp tăng dung lượng giáp phòng thủ và triệt tiêu một phần chấn động khi bị zombie tấn công.',
        statsDescVi: [
          '+40 Giáp tối đa (Hồi đầy giáp ngay khi mua)',
          '+10% Kháng sát thương từ mọi đòn tấn công',
          'Giảm 25% độ đẩy lùi khi bị zombie xô ngã'
        ],
        maxArmorBonus: 40,
        damageReduction: 0.10,
        visualColor: '#0284c7'
      },
      {
        tier: 2,
        nameVi: 'Giáp Hợp Kim Titanium Tác Chiến',
        subtitleVi: 'Giáp Nặng Lực Lượng Đặc Nhiệm',
        cost: 650,
        descVi: 'Tấm ốp hợp kim Titanium tôi cứng ngăn chặn các vết cắn sâu và mảnh đạn nổ từ zombie phát nổ.',
        statsDescVi: [
          '+90 Giáp tối đa (Hồi đầy giáp khi nâng cấp)',
          '+20% Kháng sát thương toàn phần',
          'Kháng 30% sát thương từ bẫy axit & phát nổ'
        ],
        maxArmorBonus: 90,
        damageReduction: 0.20,
        visualColor: '#38bdf8'
      },
      {
        tier: 3,
        nameVi: 'Áo Giáp Nano Cyber Mecha Exosuit',
        subtitleVi: 'Giáp Năng Lượng Công Nghệ Cao',
        cost: 1400,
        descVi: 'Bộ khung cơ khí ngoại lực tích hợp vi mạch nano tự vá lành lớp giáp bảo vệ khi không nhận sát thương trong 3 giây.',
        statsDescVi: [
          '+160 Giáp tối đa',
          '+30% Kháng sát thương toàn phần',
          'Tự động hồi phục +2 Giáp/giây khi không chiến đấu'
        ],
        maxArmorBonus: 160,
        damageReduction: 0.30,
        armorRegenPerSec: 2,
        visualColor: '#818cf8'
      },
      {
        tier: 4,
        nameVi: 'Giáp Lực Trường Thần Thánh Aegis Core',
        subtitleVi: 'Trang Bị Huyền Thoại Tối Thượng',
        cost: 2600,
        descVi: 'Máy phát lá chắn điện từ đa chiều tạo màng bảo hộ bao bọc chiến binh, phản lại 25% sát thương lên zombie cắn trúng.',
        statsDescVi: [
          '+250 Giáp tối đa',
          '+40% Kháng sát thương cực đại',
          'Tự động hồi phục +4 Giáp/giây',
          'Phản lại 25% sát thương cho zombie tấn công'
        ],
        maxArmorBonus: 250,
        damageReduction: 0.40,
        armorRegenPerSec: 4,
        visualColor: '#e0e7ff'
      }
    ]
  },

  boots: {
    id: 'boots',
    nameVi: 'Giày Tác Chiến & Ủng Phản Lực',
    categoryVi: 'Giày / Ủng',
    icon: 'Footprints',
    color: '#fbbf24',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Giày Tác Chiến Dã Ngoại Siêu Nhẹ',
        subtitleVi: 'Giày Hành Quân Đặc Nhiệm',
        cost: 180,
        descVi: 'Đế đệm cao su giảm chấn giúp chiến binh di chuyển thanh thoát, tăng tốc độ chạy và nhanh hồi phục thể lực lướt né.',
        statsDescVi: [
          '+15% Tốc độ di chuyển cơ bản',
          '-20% Thời gian hồi chiêu Lướt (Dash)',
          'Tăng độ bám đường trên mọi địa hình'
        ],
        speedMultBonus: 0.15,
        dashCooldownBonus: 0.20,
        visualColor: '#d97706'
      },
      {
        tier: 2,
        nameVi: 'Ủng Tác Chiến Tăng Áp Cơ Động',
        subtitleVi: 'Ủng Đột Kích Phản Ứng Nhanh',
        cost: 550,
        descVi: 'Hệ thống lò xo khí nén trợ lực giúp mỗi bước chạy trở nên tốc độ hơn, khoảng cách lướt né tăng thêm 25%.',
        statsDescVi: [
          '+30% Tốc độ di chuyển cơ bản',
          '-35% Thời gian hồi chiêu Lướt',
          '+25% Khoảng cách lướt né thoát thân'
        ],
        speedMultBonus: 0.30,
        dashCooldownBonus: 0.35,
        visualColor: '#f59e0b'
      },
      {
        tier: 3,
        nameVi: 'Giày Phản Lực Nitro Thruster',
        subtitleVi: 'Công Nghệ Động Cơ Phản Lực Mini',
        cost: 1200,
        descVi: 'Động cơ đẩy nitro gắn ở gót chân giúp bứt tốc vượt bậc, hoàn toàn miễn nhiễm với hiệu ứng làm chậm của bẫy axit zombie.',
        statsDescVi: [
          '+45% Tốc độ di chuyển',
          '-50% Thời gian hồi chiêu Lướt',
          'Miễn nhiễm hoàn toàn với hiệu ứng làm chậm'
        ],
        speedMultBonus: 0.45,
        dashCooldownBonus: 0.50,
        visualColor: '#06b6d4'
      },
      {
        tier: 4,
        nameVi: 'Ủng Trọng Lực Siêu Âm Hyper-Sonic',
        subtitleVi: 'Trang Bị Huyền Thoại Tốc Độ',
        cost: 2400,
        descVi: 'Đẩy vận tốc chiến binh đạt ngưỡng siêu thanh. Mỗi khi Lướt né, tạo ra luồng sóng xung kích hất văng và gây 120 sát thương lên zombie.',
        statsDescVi: [
          '+60% Tốc độ di chuyển tối thượng',
          '-65% Hồi chiêu Lướt (Lướt liên tục)',
          'Lướt tạo sóng xung kích hất tung và gây 120 ST'
        ],
        speedMultBonus: 0.60,
        dashCooldownBonus: 0.65,
        visualColor: '#38bdf8'
      }
    ]
  },

  helmet: {
    id: 'helmet',
    nameVi: 'Mũ Bảo Hộ & Kính Tác Chiến',
    categoryVi: 'Mũ / Nón',
    icon: 'HardHat',
    color: '#f87171',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Mũ Thép Chống Mảnh Văng Quân Đội',
        subtitleVi: 'Mũ Bảo Hộ Cơ Bản',
        cost: 200,
        descVi: 'Lớp thép cứng bảo vệ hộp sọ, gia tăng sinh lực tối đa và bảo toàn tính mạng khi bị zombie phục kích bất ngờ.',
        statsDescVi: [
          '+30 Máu tối đa (Hồi 30 HP ngay khi mua)',
          'Giảm 20% sát thương từ zombie phun độc và nổ'
        ],
        maxHpBonus: 30,
        visualColor: '#475569'
      },
      {
        tier: 2,
        nameVi: 'Mũ Kính Hồng Ngoại Tác Chiến Ban Đêm',
        subtitleVi: 'Mũ Thao Tác Đặc Chủng',
        cost: 580,
        descVi: 'Kính ngắm quang phổ hồng ngoại giúp nhận diện điểm yếu của zombie trong bóng tối, gia tăng tỉ lệ bắn trúng chí mạng.',
        statsDescVi: [
          '+70 Máu tối đa (Hồi 70 HP khi nâng cấp)',
          '+8% Tỉ lệ bắn trúng điểm yếu Chí Mạng',
          'Mở rộng bán kính tầm nhìn trong sương mù'
        ],
        maxHpBonus: 70,
        critChanceBonus: 0.08,
        visualColor: '#ef4444'
      },
      {
        tier: 3,
        nameVi: 'Mũ Chỉ Huy Tác Chiến Cyber Ops',
        subtitleVi: 'Mũ Tích Hợp Vi Xử Lý Quân Sự',
        cost: 1300,
        descVi: 'Hệ thống vi xử lý quét sóng não gia tăng phản xạ chiến đấu, tối ưu hóa điểm ngắm bắn cho sát thương chí mạng bùng nổ.',
        statsDescVi: [
          '+125 Máu tối đa (Hồi đầy máu)',
          '+16% Tỉ lệ bắn Chí Mạng',
          'Hiển thị định vị Boss & kẻ địch ẩn nấp'
        ],
        maxHpBonus: 125,
        critChanceBonus: 0.16,
        visualColor: '#ec4899'
      },
      {
        tier: 4,
        nameVi: 'Mũ Thần Chiến Binh Apex Predator',
        subtitleVi: 'Mũ Tác Chiến Cấp Huyền Thoại',
        cost: 2500,
        descVi: 'Vương miện công nghệ sinh học biến chiến binh thành sát thủ tối thượng, sát thương chí mạng tăng vọt lên x3.2.',
        statsDescVi: [
          '+200 Máu tối đa',
          '+25% Tỉ lệ Chí Mạng cực lớn',
          'Đòn đánh chí mạng nhân x3.2 sát thương (thay vì x2.5)'
        ],
        maxHpBonus: 200,
        critChanceBonus: 0.25,
        visualColor: '#fbbf24'
      }
    ]
  },

  gloves: {
    id: 'gloves',
    nameVi: 'Găng Tay Tác Chiến & Bắn Tỉa',
    categoryVi: 'Găng Tay',
    icon: 'Sparkles',
    color: '#a78bfa',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Găng Tay Chống Giật Grip Xạ Thủ',
        subtitleVi: 'Găng Thao Tác Bắn Cơ Bản',
        cost: 190,
        descVi: 'Lớp ma sát Silicon trên lòng bàn tay giúp thao tác nạp đạn nhanh nhẹn và kiểm soát độ rung giật của súng.',
        statsDescVi: [
          '+18% Tốc độ nạp đạn cho tất cả các loại súng',
          'Giảm 15% độ giật và độ tản đạn'
        ],
        reloadSpeedBonus: 0.18,
        visualColor: '#6b7280'
      },
      {
        tier: 2,
        nameVi: 'Găng Tay Cơ Học Trợ Lực Đặc Nhiệm',
        subtitleVi: 'Khung Xương Cầm Nắm Cơ Học',
        cost: 560,
        descVi: 'Cốt cơ khí trợ lực ngón tay bóp cò thần tốc, tăng nhịp độ bắn xả đạn và uy lực xuyên phá của đầu đạn.',
        statsDescVi: [
          '+30% Tốc độ nạp đạn',
          '+12% Tốc độ bắn (Fire Rate)',
          '+12% Sát thương súng'
        ],
        reloadSpeedBonus: 0.30,
        damageBonus: 0.12,
        visualColor: '#8b5cf6'
      },
      {
        tier: 3,
        nameVi: 'Găng Tay Điện Từ Tesla Shockwave',
        subtitleVi: 'Vũ Khí Phóng Điện Cao Tần',
        cost: 1250,
        descVi: 'Tụ điện plasma cao thế truyền vào đầu đạn, khiến phát bắn có 20% cơ hội phóng tia sét lan giật 3 zombie lân cận.',
        statsDescVi: [
          '+42% Tốc độ nạp đạn',
          '+25% Sát thương đạn toàn diện',
          '20% Cơ hội phóng tia sét Tesla lan giật 3 zombie'
        ],
        reloadSpeedBonus: 0.42,
        damageBonus: 0.25,
        visualColor: '#c084fc'
      },
      {
        tier: 4,
        nameVi: 'Găng Tay Lượng Tử Hư Vô Disintegrator',
        subtitleVi: 'Găng Tay Thần Lực Phân Rã',
        cost: 2450,
        descVi: 'Bẻ cong không gian xung quanh đường đạn, cộng thêm +1 mục tiêu xuyên phá (Pierce +1) cho mọi loại vũ khí trong tay.',
        statsDescVi: [
          '+55% Tốc độ nạp đạn chớp mắt',
          '+40% Sát thương vũ khí',
          '+1 Xuyên phá (Pierce +1) cho tất cả các súng'
        ],
        reloadSpeedBonus: 0.55,
        damageBonus: 0.40,
        visualColor: '#e879f9'
      }
    ]
  },

  backpack: {
    id: 'backpack',
    nameVi: 'Balo Tác Chiến & Tiếp Tế Hậu Cần',
    categoryVi: 'Balo Quân Dụng',
    icon: 'Package',
    color: '#34d399',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Balo Dã Ngoại Quân Đội Mở Rộng',
        subtitleVi: 'Túi Đựng Đạn Cỡ Lớn',
        cost: 220,
        descVi: 'Tăng cường nhiều ngăn chuyên dụng giúp mang thêm nhiều băng đạn dự trữ và lựu đạn nổ trong suốt cuộc chạm trán.',
        statsDescVi: [
          '+50% Sức chứa đạn dự trữ cho mọi vũ khí',
          '+2 Quả lựu đạn nổ diện rộng sẵn sàng',
          '+30px Bán kính hút vàng tự động'
        ],
        reserveAmmoBonus: 0.5,
        grenadeBonus: 2,
        magnetBonus: 30,
        visualColor: '#059669'
      },
      {
        tier: 2,
        nameVi: 'Balo Hậu Cần Nam Châm Điện Từ',
        subtitleVi: 'Thiết Bị Thu Nhặt Tự Động',
        cost: 600,
        descVi: 'Bộ hút từ trường mạnh mẽ tự động kéo vàng, kim cương và vật phẩm hỗ trợ từ xa về người chiến binh mà không cần di chuyển tới.',
        statsDescVi: [
          '+100% Sức chứa đạn dự trữ',
          '+100px Bán kính nam châm hút vàng & bổng lộc',
          '+3 Quả lựu đạn sẵn sàng'
        ],
        reserveAmmoBonus: 1.0,
        grenadeBonus: 3,
        magnetBonus: 100,
        visualColor: '#10b981'
      },
      {
        tier: 3,
        nameVi: 'Balo Lò Vi Phản Ứng Nano Tái Sinh',
        subtitleVi: 'Trạm Tiếp Tế Di Động Tự Động Hóa',
        cost: 1350,
        descVi: 'Lò phản ứng mini tự động tái tạo lựu đạn nổ sau mỗi 30 giây trong trận chiến, đảm bảo nguồn hỏa lực nổ không bao giờ cạn kiệt.',
        statsDescVi: [
          '+150% Sức chứa đạn dự trữ',
          'Tự động tạo ra 1 Lựu đạn nổ mỗi 30 giây',
          '+4 Quả lựu đạn nạp sẵn',
          '+160px Bán kính nam châm'
        ],
        reserveAmmoBonus: 1.5,
        grenadeBonus: 4,
        magnetBonus: 160,
        visualColor: '#34d399'
      },
      {
        tier: 4,
        nameVi: 'Balo Lượng Tử Siêu Hậu Cần Omega',
        subtitleVi: 'Kho Vũ Khí Di Động Tối Thượng',
        cost: 2550,
        descVi: 'Nhân đôi lượng vàng nhận được từ mỗi quái hạ gục, tạo lựu đạn mỗi 20 giây và đạn dự trữ dồi dào gấp 3 lần.',
        statsDescVi: [
          '+100% Vàng nhặt được (Nhân đôi mọi nguồn tiền)',
          'Tự tạo 1 Lựu đạn mỗi 20 giây (Tối đa 9 quả)',
          '+250% Sức chứa đạn dự trữ tối thượng'
        ],
        reserveAmmoBonus: 2.5,
        grenadeBonus: 5,
        magnetBonus: 240,
        visualColor: '#6ee7b7'
      }
    ]
  },

  visor: {
    id: 'visor',
    nameVi: 'Kính Ngắm Laser & Radar Phân Tích',
    categoryVi: 'Kính Ngắm / HUD',
    icon: 'Eye',
    color: '#38bdf8',
    level: 0,
    maxLevel: 4,
    tiers: [
      {
        tier: 1,
        nameVi: 'Kính Đo Khoảng Cách Laser Matrix',
        subtitleVi: 'Hệ Thống Ngắm Bắn Quang Học',
        cost: 210,
        descVi: 'Thấu kính chống phản xạ giúp đường đạn bay xa hơn trước khi suy hao, tăng uy lực tầm xa.',
        statsDescVi: [
          '+20% Tầm bắn của đạn cho mọi loại súng',
          '+5% Sát thương khi bắn ở khoảng cách xa'
        ],
        bulletRangeBonus: 0.20,
        visualColor: '#0284c7'
      },
      {
        tier: 2,
        nameVi: 'Kính Quét Điểm Yếu Sinh Học AI',
        subtitleVi: 'Radar Phân Tích Cấu Trúc Đột Biến',
        cost: 590,
        descVi: 'Thuật toán máy học quét nhanh mô tế bào zombie, hiển thị điểm chí mạng và nhân đôi sát thương khi bắn trúng đầu.',
        statsDescVi: [
          '+35% Tầm bắn của đạn',
          '+50% Sát thương khi bắn trúng đầu (Headshot)',
          'Tia laser ngắm bắn hiển thị rõ nét hơn'
        ],
        bulletRangeBonus: 0.35,
        headshotBonus: 0.50,
        visualColor: '#06b6d4'
      },
      {
        tier: 3,
        nameVi: 'Hệ Thống Khóa Mục Tiêu Radar Thông Minh',
        subtitleVi: 'Khóa Mục Tiêu Đạn Tự Uốn Nhẹ',
        cost: 1300,
        descVi: 'Tự động tính toán quỹ đạo gió và quán tính, đường đạn có khả năng tự uốn nhẹ về phía zombie gần tâm ngắm.',
        statsDescVi: [
          '+50% Tầm đạn cực xa',
          '+80% Sát thương trúng đầu Headshot',
          'Đạn tự uốn nhẹ bám theo zombie mục tiêu'
        ],
        bulletRangeBonus: 0.50,
        headshotBonus: 0.80,
        visualColor: '#38bdf8'
      },
      {
        tier: 4,
        nameVi: 'Kính Vệ Tinh Quỹ Đạo Thần Thánh Orbital HUD',
        subtitleVi: 'Kết Nối Vũ Trụ Vệ Tinh Trực Tiếp',
        cost: 2500,
        descVi: 'Đồng bộ hóa với vệ tinh quân sự quỹ đạo tầm thấp. Tia laser ngắm bắn xuyên thấu màn hình và tăng 35% sát thương toàn cự ly.',
        statsDescVi: [
          '+75% Tầm bay của đạn toàn bản đồ',
          '+100% Sát thương trúng đầu (x2 Headshot)',
          '+35% Sát thương trên toàn bộ tầm bắn'
        ],
        bulletRangeBonus: 0.75,
        headshotBonus: 1.0,
        visualColor: '#e0f2fe'
      }
    ]
  }
};
