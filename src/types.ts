export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';

export type ChannelType = 'SEARCH' | 'PERFORMANCE_MAX' | 'SHOPPING' | 'DISPLAY' | 'VIDEO';

export interface DailyRecord {
  date: string; // 'YYYY-MM-DD'
  cost: number; // in VND
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channelType: ChannelType;
  budgetDaily: number; // in VND
  dailyRecords: DailyRecord[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CalculatedCampaignMetrics {
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  avgCpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
}

export interface SummaryMetrics {
  totalCost: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  totalConversionValue: number;
  avgCtr: number;
  avgCpc: number;
  avgCpa: number;
  avgRoas: number;
  conversionRate: number;
}

export interface DailyAggregated {
  date: string;
  cost: number;
  clicks: number;
  conversions: number;
  impressions: number;
  cpa: number;
  avgCpc: number;
  ctr: number;
}
