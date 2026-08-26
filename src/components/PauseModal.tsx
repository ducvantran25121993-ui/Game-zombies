import React, { useState } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Home, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onGoHome,
  isMuted,
  onToggleMute
}) => {
  const [sfxVol, setSfxVol] = useState(0.7);
  const [musicVol, setMusicVol] = useState(0.4);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md max-h-[94vh] landscape:max-h-[92vh] overflow-y-auto p-4 sm:p-6 landscape:py-3 flex flex-col items-center text-center shadow-2xl text-neutral-200">
        <h2 className="text-xl sm:text-2xl landscape:text-lg font-black text-white tracking-widest uppercase mb-0.5">
          TẠM DỪNG TRẬN CHIẾN
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-400 mb-3 landscape:mb-2">Trò chơi đang dừng. Bạn có thể chỉnh âm thanh hoặc xem phím điều khiển bên dưới.</p>

        {/* AUDIO SETTINGS */}
        <div className="w-full bg-neutral-950/60 p-3 sm:p-4 rounded-2xl border border-neutral-800 space-y-3 landscape:space-y-2 mb-3 landscape:mb-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              Âm thanh trò chơi
            </span>
            <button
              onClick={onToggleMute}
              className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isMuted ? 'ĐANG TẮT' : 'ĐANG BẬT'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[10px] sm:text-[11px] text-neutral-400 font-semibold mb-1">
              <span>Âm lượng hiệu ứng (SFX)</span>
              <span>{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSfxVol(val);
                soundManager.setSfxVolume(val);
              }}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* KEYBOARD CONTROLS GUIDE */}
        <div className="w-full bg-neutral-950/40 p-2.5 sm:p-3 rounded-2xl border border-neutral-800/80 text-left mb-3 landscape:mb-2 text-[11px] sm:text-xs space-y-1">
          <div className="font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> HƯỚNG DẪN ĐIỀU KHIỂN:
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Di chuyển:</span>
            <span className="font-mono text-neutral-200 font-bold">W,A,S,D / Joystick</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Ngắm & Bắn:</span>
            <span className="font-mono text-neutral-200 font-bold">Chuột / Tự ngắm</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Lướt né đòn:</span>
            <span className="font-mono text-neutral-200 font-bold">Nút LƯỚT / SPACE</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Nạp đạn / Lựu đạn:</span>
            <span className="font-mono text-neutral-200 font-bold">Nút NẠP (R) / (G)</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onResume}
            className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-neutral-950" /> TIẾP TỤC CHƠI
          </button>
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-2 sm:py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> CHƠI LẠI
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 py-2 sm:py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" /> TRANG CHỦ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
