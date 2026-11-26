import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Sparkles, TrendingUp } from 'lucide-react';

export const Step2ActivationComparator: React.FC = () => {
  const [zVal, setZVal] = useState<number>(0.8);

  // Activations formulas
  // ReLU: max(0, z)
  const relu = Math.max(0, zVal);
  const reluGrad = zVal > 0 ? 1 : 0;

  // Sigmoid: 1 / (1 + exp(-z))
  const sigmoid = 1 / (1 + Math.exp(-zVal));
  const sigmoidGrad = sigmoid * (1 - sigmoid);

  // GELU approximation: 0.5 * z * (1 + tanh(sqrt(2/pi) * (z + 0.044715 * z^3)))
  const sqrt2OverPi = Math.sqrt(2 / Math.PI);
  const geluInner = sqrt2OverPi * (zVal + 0.044715 * Math.pow(zVal, 3));
  const gelu = 0.5 * zVal * (1 + Math.tanh(geluInner));
  // Numerical gradient of GELU
  const eps = 1e-4;
  const geluPlus = 0.5 * (zVal + eps) * (1 + Math.tanh(sqrt2OverPi * ((zVal + eps) + 0.044715 * Math.pow(zVal + eps, 3))));
  const geluMinus = 0.5 * (zVal - eps) * (1 + Math.tanh(sqrt2OverPi * ((zVal - eps) + 0.044715 * Math.pow(zVal - eps, 3))));
  const geluGrad = (geluPlus - geluMinus) / (2 * eps);

  // SVG dimensions for chart
  const width = 500;
  const height = 240;
  const minZ = -4.0;
  const maxZ = 4.0;
  const minY = -1.0;
  const maxY = 3.5;

  const toSvgX = (z: number) => ((z - minZ) / (maxZ - minZ)) * width;
  const toSvgY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  // Generate paths
  const samples = 100;
  const reluPoints: string[] = [];
  const geluPoints: string[] = [];
  const sigmoidPoints: string[] = [];

  for (let i = 0; i <= samples; i++) {
    const curZ = minZ + (i / samples) * (maxZ - minZ);
    // ReLU
    const rY = Math.max(0, curZ);
    reluPoints.push(`${toSvgX(curZ).toFixed(1)},${toSvgY(rY).toFixed(1)}`);

    // Sigmoid
    const sY = 1 / (1 + Math.exp(-curZ));
    sigmoidPoints.push(`${toSvgX(curZ).toFixed(1)},${toSvgY(sY).toFixed(1)}`);

    // GELU
    const gInner = sqrt2OverPi * (curZ + 0.044715 * Math.pow(curZ, 3));
    const gY = 0.5 * curZ * (1 + Math.tanh(gInner));
    geluPoints.push(`${toSvgX(curZ).toFixed(1)},${toSvgY(gY).toFixed(1)}`);
  }

  const setPreset = (val: number) => {
    sound.playClick();
    setZVal(val);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Интерактивный сравнитель активаций: GELU vs ReLU vs Sigmoid
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Исследуй поведение нелинейностей на отрицательных и положительных числах. Обрати внимание на плавный &quot;карман&quot; GELU при $z &lt; 0$.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-slate-400">Точки интереса:</span>
          <button
            onClick={() => setPreset(-2.0)}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Отрицательная зона (z = -2.0)
          </button>
          <button
            onClick={() => setPreset(-0.6)}
            className="px-2.5 py-1 text-xs rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition"
          >
            Карман GELU (z = -0.6)
          </button>
          <button
            onClick={() => setPreset(0.0)}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Нулевая точка (z = 0.0)
          </button>
          <button
            onClick={() => setPreset(1.8)}
            className="px-2.5 py-1 text-xs rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
          >
            Насыщение (z = +1.8)
          </button>
        </div>

        {/* Slider */}
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 mb-6">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="font-semibold text-slate-200">Входной логит ($z$):</span>
            <span className="font-mono text-cyan-300 font-bold text-sm">{zVal.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-4.0"
            max="4.0"
            step="0.05"
            value={zVal}
            onChange={(e) => setZVal(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>-4.0 (Сильное подавление)</span>
            <span>0.0 (Порог)</span>
            <span>+4.0 (Сильная активация)</span>
          </div>
        </div>

        {/* Dynamic SVG Plot */}
        <div className="relative bg-[#060a12] border border-slate-800 rounded-xl p-3 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="font-mono">График f(z)</span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-0.5 bg-purple-400 inline-block" /> GELU (SOTA в коде)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> ReLU
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Sigmoid
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
            {/* Grid & Axis */}
            <line
              x1={0}
              y1={toSvgY(0)}
              x2={width}
              y2={toSvgY(0)}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <line
              x1={toSvgX(0)}
              y1={0}
              x2={toSvgX(0)}
              y2={height}
              stroke="#1e293b"
              strokeWidth="1.5"
            />

            {/* Zero point label */}
            <text x={toSvgX(0) + 5} y={toSvgY(0) + 12} fill="#64748b" fontSize="10" fontFamily="monospace">
              0
            </text>

            {/* Function curves */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={reluPoints.join(' ')}
            />
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              points={sigmoidPoints.join(' ')}
            />
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              points={geluPoints.join(' ')}
            />

            {/* Current point vertical marker */}
            <line
              x1={toSvgX(zVal)}
              y1={0}
              x2={toSvgX(zVal)}
              y2={height}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Current points dots */}
            <circle cx={toSvgX(zVal)} cy={toSvgY(relu)} r="5" fill="#10b981" />
            <circle cx={toSvgX(zVal)} cy={toSvgY(sigmoid)} r="5" fill="#38bdf8" />
            <circle cx={toSvgX(zVal)} cy={toSvgY(gelu)} r="6" fill="#a855f7" className="animate-pulse" />
          </svg>
        </div>

        {/* Comparative Table & Gradient Inspection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* GELU Card */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 space-y-1">
            <div className="text-xs uppercase font-semibold text-purple-400">GELU (Наш выбор)</div>
            <div className="text-xl font-bold font-mono text-purple-300">{gelu.toFixed(4)}</div>
            <div className="text-xs text-slate-400 pt-1 border-t border-purple-500/20">
              Градиент f&apos;(z): <span className="font-mono text-purple-300 font-bold">{geluGrad.toFixed(3)}</span>
            </div>
            <p className="text-[11px] text-purple-300/80 pt-1">
              {zVal < -1.5 
                ? 'Мягко стремится к 0, не убивая градиент намертво.'
                : zVal < 0 
                ? '🔥 Отрицательный карман! Сохраняет поток градиента.'
                : 'Линейно масштабирует положительные токены.'}
            </p>
          </div>

          {/* ReLU Card */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-1">
            <div className="text-xs uppercase font-semibold text-emerald-400">ReLU (Классический)</div>
            <div className="text-xl font-bold font-mono text-emerald-300">{relu.toFixed(4)}</div>
            <div className="text-xs text-slate-400 pt-1 border-t border-emerald-500/20">
              Градиент f&apos;(z): <span className="font-mono text-emerald-300 font-bold">{reluGrad.toFixed(3)}</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 pt-1">
              {zVal <= 0 
                ? '⚠️ Умирающий ReLU: выход и градиент строго 0. Нейрон отключен.' 
                : 'Идеальная линейность при z > 0.'}
            </p>
          </div>

          {/* Sigmoid Card */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 space-y-1">
            <div className="text-xs uppercase font-semibold text-cyan-400">Sigmoid (Вероятность)</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{sigmoid.toFixed(4)}</div>
            <div className="text-xs text-slate-400 pt-1 border-t border-cyan-500/20">
              Градиент f&apos;(z): <span className="font-mono text-cyan-300 font-bold">{sigmoidGrad.toFixed(3)}</span>
            </div>
            <p className="text-[11px] text-cyan-300/80 pt-1">
              {Math.abs(zVal) > 2.5 
                ? 'Затухание градиента (градиент < 0.05). Только для финального слоя!' 
                : 'Применяется только в выходной бинарной голове.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
