import React, { useState } from 'react';
import { DateRange } from '../types';
import { Calendar, ChevronDown, Check } from 'lucide-react';

interface DateFilterBarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedMonth: number | null; // 1 - 12 or null
  onSelectMonth: (month: number | null) => void;
}

const months = [
  { label: 'Tháng 1', value: 1, start: '2026-01-01', end: '2026-01-31' },
  { label: 'Tháng 2', value: 2, start: '2026-02-01', end: '2026-02-28' },
  { label: 'Tháng 3', value: 3, start: '2026-03-01', end: '2026-03-31' },
  { label: 'Tháng 4', value: 4, start: '2026-04-01', end: '2026-04-30' },
  { label: 'Tháng 5', value: 5, start: '2026-05-01', end: '2026-05-31' },
  { label: 'Tháng 6', value: 6, start: '2026-06-01', end: '2026-06-30' },
  { label: 'Tháng 7', value: 7, start: '2026-07-01', end: '2026-07-31' },
  { label: 'Tháng 8', value: 8, start: '2026-08-01', end: '2026-08-31' },
];

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateRange,
  onDateRangeChange,
  selectedMonth,
  onSelectMonth,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);

  const handleMonthClick = (m: (typeof months)[0]) => {
    onSelectMonth(m.value);
    onDateRangeChange({
      startDate: m.start,
      endDate: m.end,
    });
  };

  const handleAllTimeClick = () => {
    onSelectMonth(null);
    onDateRangeChange({
      startDate: '2026-01-01',
      endDate: '2026-08-31',
    });
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onSelectMonth(null);
      onDateRangeChange({
        startDate: customStart,
        endDate: customEnd,
      });
      setShowCustomModal(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-5">
      <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        {/* Month Quick Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            id="filter-all-time"
            onClick={handleAllTimeClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMonth === null && dateRange.startDate === '2026-01-01' && dateRange.endDate === '2026-08-31'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            Tất cả (Năm 2026)
          </button>

          {months.map((m) => {
            const isSelected = selectedMonth === m.value;
            return (
              <button
                key={m.value}
                type="button"
                id={`filter-month-${m.value}`}
                onClick={() => handleMonthClick(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Picker Toggle */}
        <div className="relative flex items-center justify-end">
          <button
            type="button"
            id="custom-date-toggle-btn"
            onClick={() => setShowCustomModal(!showCustomModal)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {dateRange.startDate} ➔ {dateRange.endDate}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Custom Date Dropdown Panel */}
          {showCustomModal && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F172A] border border-slate-700 rounded-2xl p-4 shadow-2xl z-40">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Chọn khoảng ngày tùy chỉnh
              </h4>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Từ ngày (Start Date):</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Đến ngày (End Date):</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Check className="w-3 h-3" />
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
