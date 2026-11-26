import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Sparkles, Eye, Code, Zap } from 'lucide-react';

interface CodeSnippetOption {
  id: string;
  label: string;
  cwe: string;
  tokens: { text: string; score: number; isPad?: boolean }[];
}

const SNIPPETS: CodeSnippetOption[] = [
  {
    id: 'sqli',
    label: 'CWE-89: SQL Injection конкатенация',
    cwe: 'CWE-89',
    tokens: [
      { text: 'val', score: 0.05 },
      { text: 'query', score: 0.8 },
      { text: '=', score: 0.02 },
      { text: '"SELECT * FROM users WHERE name = \'"', score: 3.5 },
      { text: '+', score: 4.8 },
      { text: 'inputName', score: 3.2 },
      { text: '+', score: 4.2 },
      { text: '"\'"', score: 1.2 },
      { text: '<PAD>', score: -1e9, isPad: true },
      { text: '<PAD>', score: -1e9, isPad: true }
    ]
  },
  {
    id: 'safe_sql',
    label: 'Безопасный запрос с плейсхолдером (False Positive)',
    cwe: 'Safe',
    tokens: [
      { text: 'val', score: 0.02 },
      { text: 'query', score: 0.6 },
      { text: '=', score: 0.01 },
      { text: '"SELECT * FROM users WHERE name = ?"', score: 0.4 },
      { text: ',', score: 0.05 },
      { text: 'inputName', score: 0.3 },
      { text: '<PAD>', score: -1e9, isPad: true },
      { text: '<PAD>', score: -1e9, isPad: true }
    ]
  },
  {
    id: 'hardcoded',
    label: 'CWE-798: Захардкоженный секретный токен',
    cwe: 'CWE-798',
    tokens: [
      { text: 'val', score: 0.02 },
      { text: 'apiKey', score: 2.2 },
      { text: '=', score: 0.05 },
      { text: '"AKIAIOSFODNN7EXAMPLE"', score: 5.4 },
      { text: '<PAD>', score: -1e9, isPad: true }
    ]
  }
];

export const Step5AttentionInspector: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('sqli');
  const [temperature, setTemperature] = useState<number>(1.0);

  const snippet = SNIPPETS.find((s) => s.id === selectedSnippetId) || SNIPPETS[0];

  // Calculate Softmax attention weights with temperature
  // alpha_i = exp(s_i / T) / sum(exp(s_j / T))
  const expScores = snippet.tokens.map((t) => {
    if (t.isPad) return 0;
    return Math.exp(t.score / temperature);
  });
  const sumExp = expScores.reduce((acc, v) => acc + v, 0);
  const weights = expScores.map((exp) => (sumExp > 0 ? exp / sumExp : 0));

  const selectSnippet = (id: string) => {
    sound.playClick();
    setSelectedSnippetId(id);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Eye className="w-4 h-4 text-cyan-400" />
              Инспектор механизма внимания (Self-Attention Pooling) к токенам кода
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Вектор внимания $v_a$ фокусирует нейросеть на уязвимых токенах, а токены $&lt;PAD&gt;$ маскируются в $-10^9$ и получают строго 0% веса.
            </p>
          </div>
        </div>

        {/* Snippet selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SNIPPETS.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSnippet(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSnippetId === s.id
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 cyber-glow-cyan'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Temperature slider */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-300">
              Температура Softmax ($T$):
            </span>
            <span className="font-mono text-amber-300 font-bold">{temperature.toFixed(2)}</span>
          </div>
          <div className="flex-1 min-w-[200px] max-w-xs">
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
          <span className="text-[11px] text-slate-500">
            {temperature < 0.8 ? 'Фокус на одном токене' : temperature > 1.8 ? 'Размазанное внимание' : 'Оптимальный фокус'}
          </span>
        </div>

        {/* Interactive Code Tokens Heatmap */}
        <div className="p-5 rounded-xl bg-[#060a12] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              Подсветка весов внимания $\alpha_t$:
            </span>
            <span>Сумма весов = {(weights.reduce((a, b) => a + b, 0) * 100).toFixed(0)}%</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 font-mono text-sm leading-relaxed">
            {snippet.tokens.map((token, idx) => {
              const weight = weights[idx];
              const pct = (weight * 100).toFixed(1);

              // Dynamic styling based on attention weight
              let badgeBg = 'bg-slate-800/40 text-slate-400 border-slate-700/50';
              if (token.isPad) {
                badgeBg = 'bg-slate-900/20 text-slate-600 border-dashed border-slate-800 opacity-40';
              } else if (weight > 0.4) {
                badgeBg = 'bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] font-bold';
              } else if (weight > 0.15) {
                badgeBg = 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold';
              } else if (weight > 0.05) {
                badgeBg = 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30';
              }

              return (
                <div
                  key={idx}
                  className={`relative group px-2.5 py-1.5 rounded border transition-all cursor-default ${badgeBg}`}
                >
                  <span>{token.text}</span>
                  <span className="ml-1.5 text-[10px] font-mono opacity-80">
                    {token.isPad ? '0.0%' : `${pct}%`}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 px-2 py-1 bg-slate-900 border border-slate-700 text-[11px] text-slate-200 rounded shadow-xl whitespace-nowrap pointer-events-none">
                    Токен: <code className="text-cyan-300">{token.text}</code> | Скор: {token.score.toFixed(1)} | Вес: {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
            <span>🔴 Красный: уязвимый паттерн (&gt; 40%)</span>
            <span>🟡 Желтый: подозрительный контекст (&gt; 15%)</span>
            <span>🔘 Серый / Пунктир: служебный код / &lt;PAD&gt; (0%)</span>
          </div>
        </div>

        {/* Top Attention Tokens Ranking */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Рейтинг важности токенов для принятия решения:
          </h5>
          <div className="space-y-2">
            {snippet.tokens
              .map((t, idx) => ({ ...t, weight: weights[idx] }))
              .filter((t) => !t.isPad)
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 4)
              .map((t, rank) => (
                <div key={rank} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-5 text-slate-500 font-bold">#{rank + 1}</span>
                  <span className="w-32 truncate text-slate-200 font-semibold">{t.text}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        t.weight > 0.4 ? 'bg-rose-500' : t.weight > 0.15 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, t.weight * 100)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-slate-300 font-bold">
                    {(t.weight * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
