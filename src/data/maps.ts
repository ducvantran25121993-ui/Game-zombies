import { MapEnvironment } from '../types/game';

export const MAP_ENVIRONMENTS: MapEnvironment[] = [
  {
    id: 'rooftop',
    nameVi: 'Sân Thượng Chọc Trời',
    codename: 'SECTOR-SKYLINE',
    subtitleVi: 'Bãi đáp trực thăng trên đỉnh tháp 80 tầng',
    descVi: 'Không gian mở thoáng đãng, bãi đáp Helipad trung tâm, quạt gió HVAC và vực sâu nhìn xuống biển đèn đô thị ngập tràn sương đêm.',
    badge: 'GIÓ LỚN & VỰC SÂU',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    ambientLight: 'rgba(14, 165, 233, 0.08)',
    fogColor: '#030712',
    hazardsVi: 'Không có vật che chắn tự nhiên, quái đổ dồn từ cầu thang thoát hiểm'
  },
  {
    id: 'street',
    nameVi: 'Đường Phố Hoang Tàn',
    codename: 'WARZONE-AVENUE',
    subtitleVi: 'Đại lộ trung tâm thành phố ngập chìm khói lửa',
    descVi: 'Nhựa đường nứt toác, vạch kẻ đường hoen ố máu, xe cảnh sát cháy dở bốc khói và hàng rào kẽm gai phòng tuyến đổ sập.',
    badge: 'CHIẾN TRƯỜNG ĐÔ THỊ',
    themeColor: '#f59e0b',
    accentColor: '#fbbf24',
    ambientLight: 'rgba(245, 158, 11, 0.07)',
    fogColor: '#0a0a0a',
    hazardsVi: 'Xe cảnh sát cháy nổ lan, cống rãnh bốc khói che tầm nhìn'
  },
  {
    id: 'bunker',
    nameVi: 'Hầm Ngầm & Bio-Lab',
    codename: 'VAULT-ALPHA ☣️',
    subtitleVi: 'Phòng thí nghiệm ngầm cấp độ 4 bị rò rỉ virus',
    descVi: 'Sàn kim loại công nghiệp xám lạnh, đèn cảnh báo hazard nhấp nháy, rãnh hóa chất phát quang sinh học và cửa thép chống nổ.',
    badge: 'NGUY HIỂM SINH HỌC',
    themeColor: '#10b981',
    accentColor: '#34d399',
    ambientLight: 'rgba(16, 185, 129, 0.09)',
    fogColor: '#022c22',
    hazardsVi: 'Hóa chất độc hại ăn mòn, đèn neon nhấp nháy hạn chế tầm nhìn'
  },
  {
    id: 'hospital',
    nameVi: 'Bệnh Viện Ma Ám',
    codename: 'ASYLUM-WARD-X',
    subtitleVi: 'Khu cách ly dịch bệnh đầu tiên bị bỏ hoang',
    descVi: 'Gạch lát sàn men nứt vỡ loang lổ vết cào máu, giường bệnh cấp cứu hoen gỉ, đèn khẩn cấp đỏ rực xoay tít kinh hoàng.',
    badge: 'KHÔNG KHÍ KINH DỊ',
    themeColor: '#ef4444',
    accentColor: '#f87171',
    ambientLight: 'rgba(239, 68, 68, 0.1)',
    fogColor: '#1a0505',
    hazardsVi: 'Nhiều góc khuất và xác bệnh nhân đột biến bất ngờ'
  }
];
