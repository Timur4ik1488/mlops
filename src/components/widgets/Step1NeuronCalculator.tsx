import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { ShieldCheck, ShieldAlert, Sparkles, RotateCcw } from 'lucide-react';

export const Step1NeuronCalculator: React.FC = () => {
  const [entropy, setEntropy] = useState<number>(4.5);
  const [length, setLength] = useState<number>(32);
  const [w1, setW1] = useState<number>(0.8);
  const [w2, setW2] = useState<number>(0.1);
  const [bias, setBias] = useState<number>(-3.0);

  // Linear logit z = w1*x1 + w2*x2 + b
  const z = w1 * entropy + w2 * length + bias;
  // Sigmoid p = 1 / (1 + exp(-z))
  const probability = 1 / (1 + Math.exp(-z));
  const percentage = Math.round(probability * 1000) / 10;
  const isVulnerable = probability >= 0.5;

  const applyPreset = (ent: number, len: number, name: string) => {
    sound.playClick();
    setEntropy(ent);
    setLength(len);
  };

  const resetWeights = () => {
    sound.playClick();
    setW1(0.8);
    setW2(0.1);
    setBias(-3.0);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Калькулятор одного искусственного нейрона AppSec
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Подвигай ползунки признаков $x$ и весов $w$, чтобы увидеть в реальном времени расчет логита $z$ и вероятности $\sigma(z)$.
            </p>
          </div>
          <button
            onClick={resetWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Сброс весов
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Быстрые пресеты:</span>
          <button
            onClick={() => applyPreset(4.8, 40, 'aws')}
            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
          >
            🚨 Боевой токен AWS (H=4.8, L=40)
          </button>
          <button
            onClick={() => applyPreset(2.1, 12, 'admin')}
            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            🟢 Обычное слово &quot;admin123&quot; (H=2.1, L=12)
          </button>
          <button
            onClick={() => applyPreset(3.2, 28, 'placeholder')}
            className="px-2.5 py-1 text-xs rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
          >
            ⚠️ Плейсхолдер &quot;your_api_key_test&quot;
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs Section */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span>Входные признаки (Вектор x)</span>
              <span className="text-slate-500 font-mono">x ∈ ℝ²</span>
            </h5>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Энтропия Шеннона ($x_1$):</span>
                <span className="font-mono text-cyan-300 font-semibold">{entropy.toFixed(2)} бит</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.05"
                value={entropy}
                onChange={(e) => {
                  setEntropy(parseFloat(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>0.0 (Порядок)</span>
                <span>4.0 (Словарь)</span>
                <span>8.0 (Случайный хаос)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Длина строки ($x_2$):</span>
                <span className="font-mono text-cyan-300 font-semibold">{length} символов</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={length}
                onChange={(e) => {
                  setLength(parseInt(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>1 симв</span>
                <span>50 симв</span>
                <span>100 симв</span>
              </div>
            </div>
          </div>

          {/* Weights Section */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>Обучаемые веса и смещение (W, b)</span>
              <span className="text-slate-500 font-mono">W ∈ ℝ¹ˣ², b ∈ ℝ</span>
            </h5>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Вес энтропии ($w_1$):</span>
                <span className="font-mono text-purple-300 font-semibold">{w1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={w1}
                onChange={(e) => setW1(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Вес длины строки ($w_2$):</span>
                <span className="font-mono text-purple-300 font-semibold">{w2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Смещение (bias $b$):</span>
                <span className="font-mono text-purple-300 font-semibold">{bias.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="2"
                step="0.1"
                value={bias}
                onChange={(e) => setBias(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Results Card */}
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Calculation step */}
            <div className="col-span-2 space-y-2">
              <div className="text-xs font-mono text-slate-400">
                1. Линейный лог-скор: <span className="text-slate-200">z = ({w1.toFixed(2)} × {entropy.toFixed(2)}) + ({w2.toFixed(2)} × {length}) + ({bias.toFixed(2)})</span>
              </div>
              <div className="text-sm font-mono text-cyan-300 font-bold">
                z = {(w1 * entropy).toFixed(2)} + {(w2 * length).toFixed(2)} + ({bias.toFixed(2)}) = {z.toFixed(3)}
              </div>
              <div className="text-xs font-mono text-slate-400 pt-1">
                2. Сигмоида: <span className="text-slate-200">σ({z.toFixed(3)}) = 1 / (1 + e^({(-z).toFixed(3)}))</span>
              </div>
            </div>

            {/* Verdict Gauge */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              isVulnerable 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 cyber-glow-rose' 
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 cyber-glow-emerald'
            }`}>
              {isVulnerable ? (
                <ShieldAlert className="w-8 h-8 text-rose-400 mb-1 animate-pulse" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-400 mb-1" />
              )}
              <div className="text-2xl font-bold font-mono">
                {percentage}%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider mt-0.5">
                {isVulnerable ? '🚨 Утечка секрета' : '🟢 Безопасный код'}
              </div>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>0% (Чистый код)</span>
              <span className="text-amber-400 font-medium">Порог срабатывания: 50%</span>
              <span>100% (Критическая дыра)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-400/80 z-10" 
                title="Порог 50%"
              />
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  isVulnerable 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
