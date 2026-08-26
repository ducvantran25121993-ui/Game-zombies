import React from 'react';
import { SummaryMetrics } from '../types';
import { formatVND, formatCompactVND, formatNumber, formatPercent } from '../utils/calculations';
import { DollarSign, Target, MousePointerClick, TrendingUp, Award, Layers } from 'lucide-react';

interface MetricCardsProps {
  metrics: SummaryMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cost */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tổng Chi Phí (Cost)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatVND(metrics.totalCost)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Đã quy đổi chuẩn từ micros</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-blue-400 font-medium">{formatCompactVND(metrics.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Conversions */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tổng Chuyển Đổi (Conversions)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatNumber(metrics.totalConversions)} <span className="text-sm font-normal text-slate-400">lượt</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Tỷ lệ CVR:</span>
              <span className="text-emerald-400 font-semibold">{formatPercent(metrics.conversionRate)}</span>
              <span className="text-slate-600">&bull;</span>
              <span>ROAS: <strong className="text-slate-200">{metrics.avgRoas.toFixed(2)}x</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Average CPA */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chi Phí / Chuyển Đổi (CPA)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
              {formatVND(metrics.avgCpa)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>Giá vốn trung bình / 1 khách</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400 font-medium">Tối ưu tốt</span>
            </div>
          </div>
        </div>

        {/* Card 4: Clicks & CPC */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lượt Nhấp (Clicks) & CPC
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatNumber(metrics.totalClicks)} <span className="text-sm font-normal text-slate-400">clicks</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>CTR: <strong className="text-purple-400">{formatPercent(metrics.avgCtr)}</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>CPC: <strong className="text-slate-200">{formatVND(metrics.avgCpc)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
