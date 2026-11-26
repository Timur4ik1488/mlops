import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Flame, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';

export const Step8FocalLossSimulator: React.FC = () => {
  const [pt, setPt] = useState<number>(0.92); // probability of ground truth class (0.01..0.99)
  const [gamma, setGamma] = useState<number>(2.0); // gamma (0..5)
  const [alpha, setAlpha] = useState<number>(0.75); // alpha weighting

  // Standard Binary Cross-Entropy: -log(pt)
  const bceLoss = -Math.log(Math.max(1e-7, pt));

  // Focal Loss: - alpha * (1 - pt)^gamma * log(pt)
  const modulatingFactor = Math.pow(1 - pt, gamma);
  const focalLoss = alpha * modulatingFactor * bceLoss;

  // Penalty reduction ratio
  const reductionRatio = bceLoss > 0 && focalLoss > 0 ? (bceLoss / focalLoss).toFixed(1) : '1.0';

  const setPreset = (p: number, g: number, a: number) => {
    sound.playClick();
    setPt(p);
    setGamma(g);
    setAlpha(a);
  };

  // SVG Chart Dimensions
  const width = 500;
  const height = 200;
  const samples = 60;
  const bcePoints: string[] = [];
  const focalPoints: string[] = [];

  for (let i = 1; i < samples; i++) {
    const curP = i / samples;
    const bLoss = -Math.log(curP);
    const fLoss = alpha * Math.pow(1 - curP, gamma) * bLoss;

    const x = curP * width;
    const yB = height - (Math.min(bLoss, 4.0) / 4.0) * height;
    const yF = height - (Math.min(fLoss, 4.0) / 4.0) * height;

    bcePoints.push(`${x.toFixed(1)},${yB.toFixed(1)}`);
    focalPoints.push(`${x.toFixed(1)},${yF.toFixed(1)}`);
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Flame className="w-4 h-4 text-rose-400" />
              Симулятор Focal Loss против стандартной Cross-Entropy
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Посмотри, как множитель $(1 - p_t)^\gamma$ подавляет ошибку от 99.5% очевидного безопасного кода, фокусируя градиенты на 0.5% редких атак.
            </p>
          </div>
        </div>

        {/* Real-world Scenarios */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Сценарии в датасете:</span>
          <button
            onClick={() => setPreset(0.98, 2.0, 0.25)}
            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            🟢 Очевидный чистый код ($p_t = 0.98$: Штраф занулен)
          </button>
          <button
            onClick={() => setPreset(0.20, 2.0, 0.75)}
            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
          >
            🚨 Сложная замаскированная уязвимость ($p_t = 0.20$: Максимальный штраф)
          </button>
          <button
            onClick={() => setPreset(0.50, 0.0, 1.0)}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            ⚪ Стандартный BCE без модуляции ($\gamma = 0$)
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* pt slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Уверенность в верном классе ($p_t$):</span>
              <span className="font-mono text-cyan-300 font-bold">{(pt * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={pt}
              onChange={(e) => setPt(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.01 (Грубая ошибка)</span>
              <span>0.99 (Идеально)</span>
            </div>
          </div>

          {/* gamma slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Параметр фокусировки ($\gamma$):</span>
              <span className="font-mono text-rose-400 font-bold">{gamma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.2"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Обычный BCE)</span>
              <span>2.0 (Стандарт)</span>
              <span>5.0 (Экстремальный)</span>
            </div>
          </div>

          {/* alpha slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Вес класса ($\alpha_t$):</span>
              <span className="font-mono text-purple-300 font-bold">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.25 (Safe)</span>
              <span>0.75 (Vulnerable)</span>
            </div>
          </div>
        </div>

        {/* Chart Comparison */}
        <div className="p-4 rounded-xl bg-[#060a12] border border-slate-800 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1 font-mono">
            <span>Кривая функции потерь Loss($p_t$)</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Cross-Entropy (BCE)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-3 h-0.5 bg-rose-400 inline-block" /> Focal Loss (γ = {gamma.toFixed(1)})
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            {/* Grid */}
            <line x1={0} y1={height} x2={width} y2={height} stroke="#1e293b" strokeWidth="1" />
            <line x1={0} y1={0} x2={0} y2={height} stroke="#1e293b" strokeWidth="1" />

            {/* Curves */}
            <polyline fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" points={bcePoints.join(' ')} />
            <polyline fill="none" stroke="#f43f5e" strokeWidth="3" points={focalPoints.join(' ')} />

            {/* Current point line */}
            <line
              x1={pt * width}
              y1={0}
              x2={pt * width}
              y2={height}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle cx={pt * width} cy={height - (Math.min(bceLoss, 4.0) / 4.0) * height} r="4" fill="#64748b" />
            <circle cx={pt * width} cy={height - (Math.min(focalLoss, 4.0) / 4.0) * height} r="6" fill="#f43f5e" className="animate-pulse" />
          </svg>
        </div>

        {/* Numeric Comparison Card */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-xs uppercase text-slate-400 font-semibold">Стандартная BCE:</div>
              <div className="text-2xl font-bold font-mono text-slate-300">{bceLoss.toFixed(4)}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">L = -log({pt.toFixed(2)})</div>
            </div>

            <div>
              <div className="text-xs uppercase text-rose-400 font-semibold">Focal Loss:</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{focalLoss.toFixed(5)}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Множитель (1 - {pt.toFixed(2)})^{gamma} = <strong className="text-rose-300">{modulatingFactor.toFixed(4)}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Эффект подавления:</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                в {reductionRatio}× раз
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {pt > 0.8
                  ? 'Очевидный пример заглушен, градиент свободен'
                  : 'Сложный пример сохраняет максимальный обучающий сигнал'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
