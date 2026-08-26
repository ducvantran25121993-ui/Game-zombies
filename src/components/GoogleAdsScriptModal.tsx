import React, { useState } from 'react';
import { X, Copy, Check, Code2, AlertTriangle } from 'lucide-react';

interface GoogleAdsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleScript = `/**
 * Google Ads Script - Xuất báo cáo hiệu suất chiến dịch
 * Tự động chia 1,000,000 (micros) để ra chi phí tiền VNĐ chuẩn xác
 */
function main() {
  const query = \`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.conversions_value,
      segments.date
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
      AND campaign.status != 'REMOVED'
  \`;

  const report = AdsApp.search(query);
  const rows = [];

  while (report.hasNext()) {
    const row = report.next();
    // Chuyển đổi micros sang VND thực tế: chia cho 1.000.000
    const costVND = row.metrics.costMicros ? Math.round(row.metrics.costMicros / 1000000) : 0;
    const budgetVND = row.campaignBudget.amountMicros ? Math.round(row.campaignBudget.amountMicros / 1000000) : 0;

    rows.push({
      date: row.segments.date,
      campaignId: row.campaign.id,
      campaignName: row.campaign.name,
      status: row.campaign.status,
      channelType: row.campaign.advertisingChannelType,
      cost: costVND,
      budgetDaily: budgetVND,
      clicks: row.metrics.clicks || 0,
      impressions: row.metrics.impressions || 0,
      conversions: row.metrics.conversions || 0,
      conversionValue: row.metrics.conversionsValue || 0
    });
  }

  Logger.log('Đã xuất thành công: ' + rows.length + ' bản ghi.');
  Logger.log(JSON.stringify(rows));
}
`;

export const GoogleAdsScriptModal: React.FC<GoogleAdsScriptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Google Ads Script Báo Cáo Chuẩn Xác</h3>
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
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý quan trọng về đơn vị Micros:</strong> Google Ads API/Script trả về chi phí ở đơn vị `micros` (nhân 1.000.000). Mã script dưới đây đã tự động chia cho 1.000.000 để đưa về đúng số tiền VNĐ thực tế.
            </div>
          </div>

          <p className="text-slate-400">
            Dán mã này vào <strong>Công cụ & Cài đặt ➔ Tập lệnh (Scripts)</strong> trong tài khoản Google Ads của bạn để tự động lấy số liệu:
          </p>

          <div className="relative">
            <pre className="bg-[#070D19] border border-slate-800 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72">
              {sampleScript}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
