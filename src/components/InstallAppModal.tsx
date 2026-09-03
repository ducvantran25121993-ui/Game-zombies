import React from 'react';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playEmptyClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Preview */}
        <div className="relative mt-2 mb-4 group">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.45)] bg-neutral-950 p-1 transition-transform group-hover:scale-105">
            <img
              src="/icon.png"
              alt="Zombie Strike App Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase border border-red-400/50 shadow-md">
            HD ICON
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
          Cài đặt vào Điện thoại
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs">
          Biểu tượng <span className="text-red-400 font-bold">Zombie Strike</span> mới sẽ hiển thị trực tiếp trên màn hình chính của bạn.
        </p>

        {isInstalled ? (
          <div className="mt-5 w-full p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Ứng dụng đã được cài đặt trên thiết bị!</span>
          </div>
        ) : (
          <div className="mt-4 w-full flex flex-col gap-3">
            {/* Direct Native Install for Android/Chrome */}
            {isInstallable && (
              <button
                onClick={async () => {
                  soundManager.playPowerUp();
                  const success = await onInstall();
                  if (success) {
                    onClose();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Cài đặt ứng dụng ngay (1 Chạm)</span>
              </button>
            )}

            {/* iOS Safari Instructions */}
            <div className="w-full text-left bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>{isIOS ? 'Hướng dẫn cài đặt trên iPhone / iPad (Safari)' : 'Hướng dẫn thêm vào Màn hình chính'}</span>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  {isIOS ? (
                    <>Nhấn nút <strong>Chia sẻ (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> ở thanh công cụ dưới cùng của trình duyệt Safari.</>
                  ) : (
                    <>Nhấn nút <strong>Menu 3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt Chrome / Cốc Cốc.</>
                  )}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  {isIOS ? (
                    <>Cuộn xuống danh sách và chọn <strong className="text-white"><PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> Thêm vào MH chính (Add to Home Screen)</strong>.</>
                  ) : (
                    <>Chọn mục <strong className="text-white">Cài đặt ứng dụng</strong> hoặc <strong className="text-white">Thêm vào màn hình chính</strong>.</>
                  )}
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Xác nhận <strong>"Thêm" (Add)</strong>. Biểu tượng <strong>Zombie Strike</strong> sẽ xuất hiện trên màn hình điện thoại với đầy đủ tính năng toàn màn hình cực mượt!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" /> Toàn màn hình
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Tải siêu tốc
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Không chiếm bộ nhớ
          </span>
        </div>

        <button
          onClick={() => {
            soundManager.playEmptyClick();
            onClose();
          }}
          className="mt-4 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition"
        >
          Đã hiểu & Đóng
        </button>
      </div>
    </div>
  );
};
