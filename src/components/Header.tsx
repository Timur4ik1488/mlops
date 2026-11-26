import React from 'react';
import { sound } from '../utils/sound';
import { Shield, Volume2, VolumeX, RotateCcw, Award, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  completedCount: number;
  totalCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  completedCount,
  totalCount,
  soundEnabled,
  onToggleSound,
  onResetProgress,
}) => {
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 cyber-glow-cyan shadow-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  uncflow
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ML ACADEMY
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Двухпоточная нейросеть для AppSec: с нуля до продакшена
              </p>
            </div>
          </div>

          {/* Progress & Controls */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Пройдено {completedCount} из {totalCount}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Прогресс: {percentage}%
                </div>
              </div>
              <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Badges / Skills */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                PyTorch
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                Bi-LSTM
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                ONNX INT8
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSound();
                }}
                className={`p-2 rounded-lg border transition-all ${
                  soundEnabled
                    ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={soundEnabled ? 'Звук включен' : 'Звук отключен'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  if (window.confirm('Сбросить весь прогресс прохождения курса?')) {
                    onResetProgress();
                  }
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                title="Сбросить прогресс"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
