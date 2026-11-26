import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Compass, Sparkles } from 'lucide-react';

interface CodeToken {
  id: string;
  name: string;
  category: 'secret' | 'syntax' | 'safe' | 'sink';
  coords: [number, number]; // 2D projection
}

const TOKENS: CodeToken[] = [
  { id: '1', name: 'password', category: 'secret', coords: [0.85, 0.45] },
  { id: '2', name: 'secret_key', category: 'secret', coords: [0.88, 0.38] },
  { id: '3', name: 'auth_token', category: 'secret', coords: [0.82, 0.52] },
  { id: '4', name: 'api_key', category: 'secret', coords: [0.89, 0.41] },
  { id: '5', name: 'query_db', category: 'sink', coords: [-0.45, 0.82] },
  { id: '6', name: 'execute_sql', category: 'sink', coords: [-0.41, 0.88] },
  { id: '7', name: 'clean_input', category: 'safe', coords: [-0.85, 0.32] },
  { id: '8', name: 'sanitize', category: 'safe', coords: [-0.88, 0.28] },
  { id: '9', name: 'println', category: 'syntax', coords: [0.12, -0.92] },
  { id: '10', name: 'override', category: 'syntax', coords: [0.18, -0.88] }
];

export const Step3EmbeddingCosine: React.FC = () => {
  const [tokenAId, setTokenAId] = useState<string>('1'); // 'password'
  const [tokenBId, setTokenBId] = useState<string>('2'); // 'secret_key'

  const tokenA = TOKENS.find((t) => t.id === tokenAId) || TOKENS[0];
  const tokenB = TOKENS.find((t) => t.id === tokenBId) || TOKENS[1];

  // Dot product
  const dot = tokenA.coords[0] * tokenB.coords[0] + tokenA.coords[1] * tokenB.coords[1];
  // Norms
  const normA = Math.sqrt(tokenA.coords[0] ** 2 + tokenA.coords[1] ** 2);
  const normB = Math.sqrt(tokenB.coords[0] ** 2 + tokenB.coords[1] ** 2);
  // Cosine similarity
  const cosine = dot / (normA * normB);
  // Angle in degrees
  const clampedCos = Math.max(-1, Math.min(1, cosine));
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180) / Math.PI;

  const selectPair = (idA: string, idB: string) => {
    sound.playClick();
    setTokenAId(idA);
    setTokenBId(idB);
  };

  // Canvas visual coordinates
  const svgSize = 300;
  const center = svgSize / 2;
  const scale = 110;

  const toSvg = (coords: [number, number]) => ({
    x: center + coords[0] * scale,
    y: center - coords[1] * scale,
  });

  const posA = toSvg(tokenA.coords);
  const posB = toSvg(tokenB.coords);

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Compass className="w-4 h-4 text-cyan-400" />
              Семантическое векторное пространство токенов кода и Косинусное сходство
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              В обученном 128-мерном пространстве эмбеддингов токены с похожим контекстом смотрят в одном направлении ($\cos \theta \approx 1.0$).
            </p>
          </div>
        </div>

        {/* Quick comparisons */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400">Сравнить готовые пары:</span>
          <button
            onClick={() => selectPair('1', '2')}
            className="px-2.5 py-1 text-xs rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition"
          >
            🔑 password vs secret_key (Близкие синонимы)
          </button>
          <button
            onClick={() => selectPair('5', '6')}
            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
          >
            💉 query_db vs execute_sql (SQL Sinks)
          </button>
          <button
            onClick={() => selectPair('1', '9')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            📐 password vs println (Ортогональные термины)
          </button>
          <button
            onClick={() => selectPair('5', '7')}
            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            🛡️ query_db vs clean_input (Противоположный смысл)
          </button>
        </div>

        {/* Selectors and Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Selectors */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-cyan-400 block mb-1">
                  Токен 1 (Вектор A):
                </label>
                <select
                  value={tokenAId}
                  onChange={(e) => {
                    sound.playClick();
                    setTokenAId(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                >
                  {TOKENS.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Координаты: [{tokenA.coords[0].toFixed(2)}, {tokenA.coords[1].toFixed(2)}]
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-purple-400 block mb-1">
                  Токен 2 (Вектор B):
                </label>
                <select
                  value={tokenBId}
                  onChange={(e) => {
                    sound.playClick();
                    setTokenBId(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-purple-400 font-mono"
                >
                  {TOKENS.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Координаты: [{tokenB.coords[0].toFixed(2)}, {tokenB.coords[1].toFixed(2)}]
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-slate-400">
                1. Скалярное произведение: <span className="text-slate-200">{dot.toFixed(4)}</span>
              </div>
              <div className="text-slate-400">
                2. Норма ‖A‖₂: <span className="text-cyan-300">{normA.toFixed(3)}</span>, ‖B‖₂: <span className="text-purple-300">{normB.toFixed(3)}</span>
              </div>
              <div className="text-slate-400">
                3. Угол между векторами: <span className="text-amber-300 font-bold">{angleDeg.toFixed(1)}°</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold font-sans">Косинусное сходство:</span>
                <span className={`font-bold font-mono text-base ${
                  cosine >= 0.8 ? 'text-emerald-400' : cosine <= 0 ? 'text-rose-400' : 'text-cyan-300'
                }`}>
                  {cosine.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* 2D Vector Projection Canvas */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#060a12] border border-slate-800 rounded-xl relative">
            <div className="text-xs text-slate-500 font-mono absolute top-3 left-4">
              2D Проекция t-SNE / PCA
            </div>

            <svg width={svgSize} height={svgSize} className="overflow-visible">
              {/* Unit circle reference */}
              <circle
                cx={center}
                cy={center}
                r={scale}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Axes */}
              <line x1={center} y1={10} x2={center} y2={svgSize - 10} stroke="#1e293b" strokeWidth="1" />
              <line x1={10} y1={center} x2={svgSize - 10} y2={center} stroke="#1e293b" strokeWidth="1" />

              {/* Angle arc between vectors */}
              <path
                d={`M ${center} ${center} L ${center + (posA.x - center) * 0.3} ${center + (posA.y - center) * 0.3} A 35 35 0 0 1 ${center + (posB.x - center) * 0.3} ${center + (posB.y - center) * 0.3} Z`}
                fill="rgba(245, 158, 11, 0.15)"
                stroke="#f59e0b"
                strokeWidth="1"
              />

              {/* All other token points */}
              {TOKENS.map((t) => {
                const pos = toSvg(t.coords);
                const isSelected = t.id === tokenA.id || t.id === tokenB.id;
                return (
                  <g key={t.id} className="cursor-pointer" onClick={() => selectPair(tokenA.id, t.id)}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 6 : 3}
                      fill={isSelected ? (t.id === tokenA.id ? '#38bdf8' : '#a855f7') : '#475569'}
                      opacity={isSelected ? 1 : 0.6}
                    />
                    <text
                      x={pos.x + 8}
                      y={pos.y + 4}
                      fill={isSelected ? '#f8fafc' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {t.name}
                    </text>
                  </g>
                );
              })}

              {/* Vector Arrow A */}
              <line
                x1={center}
                y1={center}
                x2={posA.x}
                y2={posA.y}
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              {/* Vector Arrow B */}
              <line
                x1={center}
                y1={center}
                x2={posB.x}
                y2={posB.y}
                stroke="#a855f7"
                strokeWidth="2.5"
              />
            </svg>

            <div className="text-[11px] text-slate-400 mt-2 text-center">
              Угол θ = {angleDeg.toFixed(1)}° | {cosine >= 0.85 ? '🟢 Идентичный функциональный контекст' : cosine < 0 ? '🔴 Противоположные концепции' : '⚪ Независимые токены'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
