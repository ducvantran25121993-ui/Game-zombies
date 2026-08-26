import React, { useState } from 'react';
import { Campaign, DateRange } from '../types';
import { calculateCampaignMetrics, formatVND, formatCompactVND, formatNumber, formatPercent } from '../utils/calculations';
import {
  Search,
  ArrowUpDown,
  Play,
  Pause,
  Layers,
  Megaphone,
  ShoppingBag,
  Tv,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CampaignTableProps {
  campaigns: Campaign[];
  dateRange: DateRange;
  onToggleStatus: (id: string) => void;
}

type SortField = 'name' | 'cost' | 'conversions' | 'cpa' | 'clicks' | 'ctr' | 'avgCpc';

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  dateRange,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENABLED' | 'PAUSED'>('ALL');
  const [sortField, setSortField] = useState<SortField>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute metrics for each campaign
  const computedList = campaigns.map((cmp) => ({
    ...cmp,
    computed: calculateCampaignMetrics(cmp, dateRange),
  }));

  // Filter
  const filtered = computedList.filter((cmp) => {
    const matchesSearch = cmp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ENABLED' && cmp.status === 'ENABLED') ||
      (statusFilter === 'PAUSED' && cmp.status === 'PAUSED');
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortField === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'cost') {
      valA = a.computed.cost;
      valB = b.computed.cost;
    } else if (sortField === 'conversions') {
      valA = a.computed.conversions;
      valB = b.computed.conversions;
    } else if (sortField === 'cpa') {
      valA = a.computed.cpa;
      valB = b.computed.cpa;
    } else if (sortField === 'clicks') {
      valA = a.computed.clicks;
      valB = b.computed.clicks;
    } else if (sortField === 'ctr') {
      valA = a.computed.ctr;
      valB = b.computed.ctr;
    } else if (sortField === 'avgCpc') {
      valA = a.computed.avgCpc;
      valB = b.computed.avgCpc;
    }

    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getChannelBadge = (type: Campaign['channelType']) => {
    switch (type) {
      case 'SEARCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[11px] font-medium border border-blue-500/20">
            <Search className="w-3 h-3" /> Search
          </span>
        );
      case 'PERFORMANCE_MAX':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] font-medium border border-indigo-500/20">
            <Layers className="w-3 h-3" /> PMax
          </span>
        );
      case 'SHOPPING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
            <ShoppingBag className="w-3 h-3" /> Shopping
          </span>
        );
      case 'DISPLAY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 text-[11px] font-medium border border-pink-500/20">
            <Eye className="w-3 h-3" /> Display
          </span>
        );
      case 'VIDEO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-medium border border-red-500/20">
            <Tv className="w-3 h-3" /> Video
          </span>
        );
      default:
        return null;
    }
  };

  const activeCount = campaigns.filter((c) => c.status === 'ENABLED').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-lg">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <Megaphone className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white text-sm">Chiến dịch</span>
              <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                {activeCount} Active
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400">
              Số liệu tính toán trực tiếp theo khoảng ngày đã chọn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-campaigns-input"
                placeholder="Tìm chiến dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070D19] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-[#070D19] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ENABLED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ENABLED'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đang chạy
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PAUSED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'PAUSED'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tạm dừng
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/90">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-[#070D19] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Tên Chiến Dịch</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">Loại Kênh</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex items-center gap-1">
                    <span>Chi Phí (Cost)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('conversions')}
                >
                  <div className="flex items-center gap-1">
                    <span>Chuyển Đổi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('cpa')}
                >
                  <div className="flex items-center gap-1">
                    <span>CPA (VNĐ)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('clicks')}
                >
                  <div className="flex items-center gap-1">
                    <span>Clicks</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('ctr')}
                >
                  <div className="flex items-center gap-1">
                    <span>CTR</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                  onClick={() => handleSort('avgCpc')}
                >
                  <div className="flex items-center gap-1">
                    <span>Avg. CPC</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0B1120]">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Không tìm thấy chiến dịch phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                sorted.map((cmp) => {
                  const isEnabled = cmp.status === 'ENABLED';
                  return (
                    <tr
                      key={cmp.id}
                      className="hover:bg-slate-850/50 transition-colors group"
                    >
                      {/* Status Toggle Switch */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(cmp.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                            isEnabled
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Bật</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-2.5 h-2.5 fill-current" />
                              <span>Tắt</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Campaign Name */}
                      <td className="py-3 px-3 font-medium text-slate-100 max-w-xs truncate">
                        {cmp.name}
                      </td>

                      {/* Channel Type */}
                      <td className="py-3 px-3">
                        {getChannelBadge(cmp.channelType)}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 font-semibold text-slate-100 whitespace-nowrap">
                        {formatVND(cmp.computed.cost)}
                      </td>

                      {/* Conversions */}
                      <td className="py-3 px-3 text-emerald-400 font-bold whitespace-nowrap">
                        {formatNumber(cmp.computed.conversions)}
                      </td>

                      {/* CPA */}
                      <td className="py-3 px-3 text-amber-400 font-bold whitespace-nowrap">
                        {formatVND(cmp.computed.cpa)}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {formatNumber(cmp.computed.clicks)}
                      </td>

                      {/* CTR */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {formatPercent(cmp.computed.ctr)}
                      </td>

                      {/* Avg CPC */}
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatVND(cmp.computed.avgCpc)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
