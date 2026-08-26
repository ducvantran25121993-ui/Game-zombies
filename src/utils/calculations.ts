import { Campaign, DateRange, SummaryMetrics, DailyAggregated, CalculatedCampaignMetrics } from '../types';

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatCompactVND(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0 ₫';
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} tỷ ₫`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} tr ₫`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k ₫`;
  }
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function formatNumber(num: number, decimals = 0): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(val: number, decimals = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00%';
  return `${(val * 100).toFixed(decimals)}%`;
}

export function calculateCampaignMetrics(
  campaign: Campaign,
  dateRange: DateRange
): CalculatedCampaignMetrics {
  const filtered = campaign.dailyRecords.filter(
    (r) => r.date >= dateRange.startDate && r.date <= dateRange.endDate
  );

  const cost = filtered.reduce((sum, r) => sum + r.cost, 0);
  const clicks = filtered.reduce((sum, r) => sum + r.clicks, 0);
  const impressions = filtered.reduce((sum, r) => sum + r.impressions, 0);
  const conversions = filtered.reduce((sum, r) => sum + r.conversions, 0);
  const conversionValue = filtered.reduce((sum, r) => sum + r.conversionValue, 0);

  const ctr = impressions > 0 ? clicks / impressions : 0;
  const avgCpc = clicks > 0 ? cost / clicks : 0;
  const cpa = conversions > 0 ? cost / conversions : 0;
  const roas = cost > 0 ? conversionValue / cost : 0;
  const conversionRate = clicks > 0 ? conversions / clicks : 0;

  return {
    cost,
    clicks,
    impressions,
    conversions,
    conversionValue,
    ctr,
    avgCpc,
    cpa,
    roas,
    conversionRate,
  };
}

export function calculateMetrics(
  campaigns: Campaign[],
  dateRange: DateRange
): { metrics: SummaryMetrics; filteredDaily: DailyAggregated[] } {
  // Aggregate daily records across all campaigns
  const dailyMap = new Map<string, { cost: number; clicks: number; impressions: number; conversions: number }>();

  let totalCost = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalConversions = 0;
  let totalConversionValue = 0;

  campaigns.forEach((campaign) => {
    campaign.dailyRecords.forEach((record) => {
      if (record.date >= dateRange.startDate && record.date <= dateRange.endDate) {
        totalCost += record.cost;
        totalClicks += record.clicks;
        totalImpressions += record.impressions;
        totalConversions += record.conversions;
        totalConversionValue += record.conversionValue;

        const current = dailyMap.get(record.date) || { cost: 0, clicks: 0, impressions: 0, conversions: 0 };
        dailyMap.set(record.date, {
          cost: current.cost + record.cost,
          clicks: current.clicks + record.clicks,
          impressions: current.impressions + record.impressions,
          conversions: current.conversions + record.conversions,
        });
      }
    });
  });

  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const avgCpa = totalConversions > 0 ? totalCost / totalConversions : 0;
  const avgRoas = totalCost > 0 ? totalConversionValue / totalCost : 0;
  const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;

  const metrics: SummaryMetrics = {
    totalCost,
    totalClicks,
    totalImpressions,
    totalConversions,
    totalConversionValue,
    avgCtr,
    avgCpc,
    avgCpa,
    avgRoas,
    conversionRate,
  };

  const dates = Array.from(dailyMap.keys()).sort();
  const filteredDaily: DailyAggregated[] = dates.map((d) => {
    const data = dailyMap.get(d)!;
    return {
      date: d,
      cost: data.cost,
      clicks: data.clicks,
      impressions: data.impressions,
      conversions: data.conversions,
      cpa: data.conversions > 0 ? data.cost / data.conversions : 0,
      avgCpc: data.clicks > 0 ? data.cost / data.clicks : 0,
      ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
    };
  });

  return { metrics, filteredDaily };
}
