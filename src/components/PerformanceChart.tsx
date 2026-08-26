import React, { useState } from 'react';
import { DailyAggregated } from '../types';
import { formatVND, formatNumber, formatPercent } from '../utils/calculations';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

interface PerformanceChartProps {
  data: DailyAggregated[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [tab, setTab] = useState<'COST_CLICKS' | 'CONV_CPA' | 'CTR_CPC'>('COST_CLICKS');

  const formattedData = data.map((d) => ({
    ...d,
    displayDate: d.date.slice(5), // 'MM-DD'
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-lg">
        {/* Chart Header & Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Biểu Đồ Xu Hướng Hiệu Quả Theo Ngày
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi tương quan giữa Chi phí, Lượt nhấp, Chuyển đổi và CPA thực tế
            </p>
          </div>

          <div className="flex items-center bg-[#070D19] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTab('COST_CLICKS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                tab === 'COST_CLICKS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chi Phí & Lượt Nhấp
            </button>
            <button
              type="button"
              onClick={() => setTab('CONV_CPA')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                tab === 'CONV_CPA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chuyển Đổi & CPA
            </button>
            <button
              type="button"
              onClick={() => setTab('CTR_CPC')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                tab === 'CTR_CPC'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CTR & Giá CPC
            </button>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />

              {tab === 'COST_CLICKS' && (
                <>
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)} tr`}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="cost"
                    name="Chi Phí (VNĐ)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="clicks"
                    name="Lượt Nhấp (Clicks)"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              )}

              {tab === 'CONV_CPA' && (
                <>
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v}`}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="conversions"
                    name="Lượt Chuyển Đổi"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConv)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cpa"
                    name="CPA (VNĐ/Chuyển đổi)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              )}

              {tab === 'CTR_CPC' && (
                <>
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v)} đ`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ctr"
                    name="Tỷ Lệ Nhấp (CTR)"
                    stroke="#ec4899"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgCpc"
                    name="Giá Mỗi Nhấp (CPC)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip component for recharts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1">Ngày: {label}</p>
        {payload.map((entry: any, index: number) => {
          let valueText = entry.value;
          if (entry.dataKey === 'cost' || entry.dataKey === 'cpa' || entry.dataKey === 'avgCpc') {
            valueText = formatVND(entry.value);
          } else if (entry.dataKey === 'ctr') {
            valueText = formatPercent(entry.value);
          } else {
            valueText = formatNumber(entry.value);
          }

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-bold text-slate-100">{valueText}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}
