import { MapEnvironment } from '../types/game';

export const MAP_ENVIRONMENTS: MapEnvironment[] = [
  {
    id: 'rooftop',
    nameVi: 'Sân Thượng Chọc Trời',
    codename: 'SECTOR-01 // SKYLINE',
    subtitleVi: 'Bãi đáp trực thăng trên đỉnh tháp 80 tầng',
    descVi: 'Không gian mở thoáng đãng, bãi đáp Helipad trung tâm, quạt gió HVAC và vực sâu nhìn xuống biển đèn đô thị ngập tràn sương đêm.',
    badge: 'GIÓ LỚN & VỰC SÂU',
    themeColor: '#0ea5e9',
    accentColor: '#38bdf8',
    ambientLight: 'rgba(14, 165, 233, 0.08)',
    fogColor: '#030712',
    hazardsVi: 'Không có vật che chắn tự nhiên, quái tràn ra từ cầu thang thoát hiểm'
  },
  {
    id: 'street',
    nameVi: 'Đại Lộ Hoang Tàn',
    codename: 'SECTOR-02 // WARZONE',
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
    codename: 'SECTOR-03 // VAULT ☣️',
    subtitleVi: 'Phòng thí nghiệm ngầm cấp độ 4 bị rò rỉ virus',
    descVi: 'Sàn kim loại công nghiệp xám lạnh, biểu tượng hazard phát quang, rãnh hóa chất ăn mòn sinh học và hệ thống máy chủ dữ liệu tối mật.',
    badge: 'NGUY HIỂM SINH HỌC',
    themeColor: '#10b981',
    accentColor: '#34d399',
    ambientLight: 'rgba(16, 185, 129, 0.09)',
    fogColor: '#022c22',
    hazardsVi: 'Hóa chất độc hại ăn mòn, đèn neon nhấp nháy hạn chế tầm nhìn'
  },
  {
    id: 'hospital',
    nameVi: 'Bệnh Viện Cách Ly Ma Ám',
    codename: 'SECTOR-04 // ASYLUM-X',
    subtitleVi: 'Khu cách ly dịch bệnh đầu tiên bị bỏ hoang',
    descVi: 'Gạch lát sàn men nứt vỡ loang lổ vệt máu kinh hoàng, giường cấp cứu hoen gỉ, đèn khẩn cấp đỏ rực xoay tít trong sương mù.',
    badge: 'KHÔNG KHÍ KINH DỊ',
    themeColor: '#ef4444',
    accentColor: '#f87171',
    ambientLight: 'rgba(239, 68, 68, 0.1)',
    fogColor: '#1a0505',
    hazardsVi: 'Nhiều góc khuất và xác bệnh nhân đột biến bất ngờ'
  },
  {
    id: 'graveyard',
    nameVi: 'Nghĩa Địa Rừng Hắc Ám',
    codename: 'SECTOR-05 // NECROPOLIS ⚰️',
    subtitleVi: 'Khu mộ cổ phong ấn linh hồn nguyền rủa giữa rừng chết',
    descVi: 'Đất hoang phủ rêu phong, bia mộ đá cổ nứt toác, vòng tròn ma thuật tà giáo phát sáng tím huyền bí cùng các đốm ma trơi ma quái bay lơ lửng.',
    badge: 'LINH HỒN OAN KHUẤT',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    ambientLight: 'rgba(168, 85, 247, 0.12)',
    fogColor: '#1e1035',
    hazardsVi: 'Bẫy ma thuật tà ác, sương mù tử khí che lấp bước chân zombie'
  },
  {
    id: 'desert_outpost',
    nameVi: 'Tiền Đồn Sa Mạc Cát Đỏ',
    codename: 'SECTOR-06 // DUNE-BASE',
    subtitleVi: 'Căn cứ quân sự tiền tuyến bị bão cát cô lập',
    descVi: 'Những đụn cát đỏ rực trải dài bỏng rát, trạm ăng-ten radar radar vệ tinh, hàng rào bao cát kiên cố và thùng nhiên liệu quân sự bị bỏ lại.',
    badge: 'BÃO CÁT THIÊU ĐỐT',
    themeColor: '#eab308',
    accentColor: '#fde047',
    ambientLight: 'rgba(234, 179, 8, 0.08)',
    fogColor: '#291804',
    hazardsVi: 'Gió cát giảm tầm nhìn, thùng dầu rò rỉ dễ bắt lửa bốc cháy dữ dội'
  },
  {
    id: 'cyber_facility',
    nameVi: 'Trung Tâm Lõi Lượng Tử',
    codename: 'SECTOR-07 // CYBER-CORE ⚡',
    subtitleVi: 'Nhà máy năng lượng lượng tử siêu công nghệ tương lai',
    descVi: 'Sàn lưới tổ ong kim loại titan phản chiếu laser neon xanh ngọc, lò phản ứng hạt nhân lượng tử quay cuồng ở trung tâm và các trụ lưới chắn xung điện.',
    badge: 'SIÊU CÔNG NGHỆ CYBER',
    themeColor: '#06b6d4',
    accentColor: '#22d3ee',
    ambientLight: 'rgba(6, 182, 212, 0.14)',
    fogColor: '#042f2e',
    hazardsVi: 'Dòng điện cao thế rò rỉ, trường lực phản xạ đạn năng lượng'
  },
  {
    id: 'volcanic_core',
    nameVi: 'Lò Lửa Dung Nham Địa Ngục',
    codename: 'SECTOR-08 // INFERNO-MAGMA 🌋',
    subtitleVi: 'Vùng miệng núi lửa phun trào dung nham hủy diệt',
    descVi: 'Nền đá núi lửa hắc diện thạch nứt nẻ, những dòng sông dung nham nóng chảy đỏ rực sôi sục, tàn tro than hồng bay khắp không gian.',
    badge: 'ĐỊA NGỤC DUNG NHAM',
    themeColor: '#f97316',
    accentColor: '#fb923c',
    ambientLight: 'rgba(249, 115, 22, 0.16)',
    fogColor: '#270a04',
    hazardsVi: 'Dung nham nóng chảy gây sát thương bỏng liên tục, tro lửa mù mịt'
  }
];
