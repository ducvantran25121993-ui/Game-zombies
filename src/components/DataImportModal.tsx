import React, { useState } from 'react';
import { Campaign } from '../types';
import { X, UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (campaigns: Campaign[]) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setErrorMsg('');
    setSuccessCount(null);

    if (!jsonText.trim()) {
      setErrorMsg('Vui lòng dán dữ liệu JSON chiến dịch hoặc báo cáo.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      let campaigns: Campaign[] = [];

      if (Array.isArray(parsed)) {
        // Check if format is flat rows or campaign objects
        if (parsed.length > 0 && parsed[0].dailyRecords) {
          campaigns = parsed;
        } else if (parsed.length > 0 && (parsed[0].campaignId || parsed[0].campaignName)) {
          // Group flat rows by campaign
          const map = new Map<string, Campaign>();
          parsed.forEach((row: any) => {
            const id = row.campaignId || row.id || `cmp-${Math.random().toString(36).substr(2, 5)}`;
            const name = row.campaignName || row.name || 'Chiến dịch mới';
            const status = row.status === 'PAUSED' ? 'PAUSED' : 'ENABLED';
            const channelType = row.channelType || 'SEARCH';
            const budgetDaily = Number(row.budgetDaily || 1000000);

            if (!map.has(id)) {
              map.set(id, {
                id,
                name,
                status,
                channelType,
                budgetDaily,
                dailyRecords: [],
              });
            }

            const cmp = map.get(id)!;
            cmp.dailyRecords.push({
              date: row.date || new Date().toISOString().split('T')[0],
              cost: Number(row.cost || 0),
              clicks: Number(row.clicks || 0),
              impressions: Number(row.impressions || 0),
              conversions: Number(row.conversions || 0),
              conversionValue: Number(row.conversionValue || 0),
            });
          });
          campaigns = Array.from(map.values());
        } else {
          throw new Error('Định dạng dữ liệu không khớp với schema chiến dịch.');
        }

        onImport(campaigns);
        setSuccessCount(campaigns.length);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error('Dữ liệu nhập vào phải là một mảng JSON (Array).');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi phân tích cú pháp JSON. Vui lòng kiểm tra lại cấu trúc.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Nhập Dữ Liệu Báo Cáo Google Ads</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          <p className="text-slate-400">
            Dán kết quả JSON được xuất ra từ Google Ads Script hoặc file báo cáo của bạn vào ô dưới đây:
          </p>

          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[
  {
    "date": "2026-07-01",
    "campaignId": "cmp-01",
    "campaignName": "[Search] Dịch Vụ Mới",
    "cost": 1500000,
    "clicks": 320,
    "impressions": 4500,
    "conversions": 18
  }
]`}
            className="w-full bg-[#070D19] border border-slate-700 rounded-xl p-3 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Nhập thành công {successCount} chiến dịch vào Dashboard!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
          >
            Xác Nhận Nhập
          </button>
        </div>
      </div>
    </div>
  );
};
