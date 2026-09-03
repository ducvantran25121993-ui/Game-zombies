import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle2, Sparkles, Gamepad2, HelpCircle } from 'lucide-react';
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
  const [modalTab, setModalTab] = useState<'install' | 'gameplay'>('install');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-4 sm:p-6 flex flex-col items-center text-center overflow-hidden max-h-[90vh]">
        {/* Background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playEmptyClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
            HƯỚNG DẪN TRÒ CHƠI
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full bg-neutral-950/80 p-1 rounded-xl border border-neutral-800 mb-3 gap-1">
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              setModalTab('install');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              modalTab === 'install'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cài Đặt ĐT</span>
          </button>
          <button
            onClick={() => {
              soundManager.playEmptyClick();
              setModalTab('gameplay');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              modalTab === 'gameplay'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Cách Chơi</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="w-full overflow-y-auto pr-0.5 space-y-3 text-left">
          {modalTab === 'install' ? (
            <div className="flex flex-col items-center text-center">
              {/* Icon Preview */}
              <div className="relative my-2 group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.4)] bg-neutral-950 p-1 transition-transform group-hover:scale-105">
                  <img
                    src="/icon.png"
                    alt="Zombie Strike App Icon"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black tracking-wider uppercase border border-red-400/50 shadow-md">
                  HD ICON
                </div>
              </div>

              <p className="text-xs text-neutral-400 max-w-xs mb-3">
                Thêm biểu tượng <strong className="text-red-400 font-bold">Zombie Strike</strong> vào màn hình chính để mở game nhanh và chơi chế độ toàn màn hình siêu mượt!
              </p>

              {isInstalled ? (
                <div className="w-full p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ứng dụng đã được cài đặt trên thiết bị!</span>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2.5">
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
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Cài đặt ứng dụng ngay (1 Chạm)</span>
                    </button>
                  )}

                  {/* iOS Safari & Android Instructions */}
                  <div className="w-full text-left bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3 text-[11px] space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{isIOS ? 'Trên iPhone / iPad (Safari):' : 'Trên Android (Chrome):'}</span>
                    </div>

                    <div className="flex items-start gap-2 text-neutral-300">
                      <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </span>
                      <span>
                        {isIOS ? (
                          <>Nhấn nút <strong>Chia sẻ</strong> <Share2 className="w-3 h-3 inline mx-1 text-sky-400" /> ở thanh dưới của Safari.</>
                        ) : (
                          <>Nhấn nút <strong>Menu 3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt.</>
                        )}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-neutral-300">
                      <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </span>
                      <span>
                        {isIOS ? (
                          <>Chọn <strong className="text-white"><PlusSquare className="w-3 h-3 inline mx-1 text-emerald-400" /> Thêm vào MH chính</strong> (Add to Home Screen).</>
                        ) : (
                          <>Chọn mục <strong className="text-white">Cài đặt ứng dụng</strong> hoặc <strong className="text-white">Thêm vào màn hình chính</strong>.</>
                        )}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-neutral-300">
                      <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </span>
                      <span>
                        Xác nhận <strong>"Thêm" (Add)</strong>. Biểu tượng mới sẽ xuất hiện trên màn hình điện thoại!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-red-400" /> Toàn màn hình
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Tải siêu tốc
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Siêu nhẹ
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h4 className="font-black text-sky-400 uppercase text-xs flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Điều khiển trên Điện thoại:
                </h4>
                <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                  <li>• <strong className="text-white">Cần Joystick Trái</strong>: Di chuyển nhân vật 360 độ</li>
                  <li>• <strong className="text-white">Cần Joystick Phải</strong>: Ngắm hướng và bắn liên tục</li>
                  <li>• <strong className="text-white">Nút Lướt (Dash)</strong>: Lướt nhanh né quái vật bao vây</li>
                  <li>• <strong className="text-white">Nút Ném Bom / Tuyệt Kỹ</strong>: Kích hoạt chiêu thức hủy diệt diện rộng</li>
                  <li>• <strong className="text-white">Dải súng dưới cùng</strong>: Chạm vào súng bất kỳ để chuyển đổi tức thì</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h4 className="font-black text-amber-400 uppercase text-xs flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" /> Điều khiển trên Máy tính:
                </h4>
                <ul className="space-y-1 text-neutral-300 text-[11px]">
                  <li>• <strong className="text-white">W, A, S, D</strong>: Di chuyển</li>
                  <li>• <strong className="text-white">Chuột Trái</strong>: Bắn súng | <strong className="text-white">R</strong>: Nạp đạn</li>
                  <li>• <strong className="text-white">Phím Cách (Space)</strong>: Lướt né</li>
                  <li>• <strong className="text-white">Phím G / E</strong>: Ném lựu đạn</li>
                  <li>• <strong className="text-white">Phím F / U</strong>: Tuyệt kỹ tối thượng</li>
                  <li>• <strong className="text-white">Phím B</strong>: Mở Cửa hàng vũ khí</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px]">
                💡 <strong>Mẹo sinh tồn:</strong> Luôn giữ khoảng cách, bắn thùng phuy nổ lan khi quái đông và nâng cấp vũ khí tại Shop!
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            soundManager.playEmptyClick();
            onClose();
          }}
          className="mt-3.5 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition shrink-0"
        >
          Đã hiểu & Đóng
        </button>
      </div>
    </div>
  );
};
