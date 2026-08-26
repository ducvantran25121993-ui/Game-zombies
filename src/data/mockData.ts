import { Campaign } from '../types';

// Helper to generate consistent realistic daily stats
function generateDailyRecords(
  baseCost: number,
  baseClicks: number,
  baseConversions: number,
  costVariance = 0.25
) {
  const records = [];
  const start = new Date('2026-01-01');
  const end = new Date('2026-08-31');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    // Seed variance based on day of week and date
    const dayOfWeek = d.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 0.95;
    const randomWave = 1 + Math.sin(d.getDate() * 0.4) * costVariance;

    const cost = Math.round(baseCost * weekendMultiplier * randomWave);
    const clicks = Math.max(1, Math.round(baseClicks * weekendMultiplier * randomWave));
    const impressions = Math.round(clicks * (12 + (d.getDate() % 5)));
    const conversions = Math.max(0, Math.round(baseConversions * weekendMultiplier * randomWave));
    const conversionValue = conversions * (1200000 + (d.getDate() % 7) * 150000);

    records.push({
      date: dateStr,
      cost,
      clicks,
      impressions,
      conversions,
      conversionValue,
    });
  }
  return records;
}

export const initialCampaigns: Campaign[] = [
  {
    id: 'cmp-01',
    name: '🔍 [Search] Tìm Kiếm Chính Xác - Khóa Học & Dịch Vụ',
    status: 'ENABLED',
    channelType: 'SEARCH',
    budgetDaily: 1500000,
    dailyRecords: generateDailyRecords(1420000, 320, 18, 0.2),
  },
  {
    id: 'cmp-02',
    name: '🚀 [PMax] Performance Max - Toàn Diện Sản Phẩm VIP',
    status: 'ENABLED',
    channelType: 'PERFORMANCE_MAX',
    budgetDaily: 2500000,
    dailyRecords: generateDailyRecords(2380000, 580, 34, 0.3),
  },
  {
    id: 'cmp-03',
    name: '🛍️ [Shopping] Google Smart Shopping - Top Bán Chạy',
    status: 'ENABLED',
    channelType: 'SHOPPING',
    budgetDaily: 1200000,
    dailyRecords: generateDailyRecords(1150000, 410, 22, 0.15),
  },
  {
    id: 'cmp-04',
    name: '🎯 [Display] Remarketing Đeo Bám Khách Hàng Tiềm Năng',
    status: 'ENABLED',
    channelType: 'DISPLAY',
    budgetDaily: 800000,
    dailyRecords: generateDailyRecords(760000, 650, 12, 0.25),
  },
  {
    id: 'cmp-05',
    name: '🎬 [YouTube] Video Action - Tăng Chuyển Đổi Đơn Hàng',
    status: 'ENABLED',
    channelType: 'VIDEO',
    budgetDaily: 1000000,
    dailyRecords: generateDailyRecords(950000, 280, 14, 0.35),
  },
  {
    id: 'cmp-06',
    name: '🌟 [Brand Search] Tìm Kiếm Thương Hiệu Công Ty',
    status: 'ENABLED',
    channelType: 'SEARCH',
    budgetDaily: 500000,
    dailyRecords: generateDailyRecords(480000, 190, 28, 0.1),
  },
  {
    id: 'cmp-07',
    name: '🔥 [PMax] Chiến dịch Flash Sale Xả Kho Mùa Hè',
    status: 'PAUSED',
    channelType: 'PERFORMANCE_MAX',
    budgetDaily: 2000000,
    dailyRecords: generateDailyRecords(1800000, 440, 20, 0.4),
  },
];
