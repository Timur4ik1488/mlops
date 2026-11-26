import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { Activity, Sparkles, ShieldAlert, ShieldCheck } from 'lucide-react';

export const Step6EntropyCalculator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('AKIAIOSFODNN7EXAMPLE');

  // Compute Shannon Entropy
  const calculateEntropy = (str: string) => {
    if (!str || str.length === 0) return { entropy: 0, freqs: {}, unique: 0, length: 0 };
    const len = str.length;
    const counts: Record<string, number> = {};
    for (const ch of str) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    let ent = 0;
    const freqs: Record<string, number> = {};
    for (const ch in counts) {
      const p = counts[ch] / len;
      freqs[ch] = p;
      ent -= p * Math.log2(p);
    }
    return {
      entropy: ent,
      freqs,
      unique: Object.keys(counts).length,
      length: len,
    };
  };

  const { entropy, freqs, unique, length } = calculateEntropy(inputText);

  // Verdict thresholds
  let verdict: 'clean' | 'suspicious' | 'secret' = 'clean';
  if (entropy > 3.4 && length >= 12) {
    verdict = 'secret';
  } else if (entropy >= 2.8 && length >= 8) {
    verdict = 'suspicious';
  }

  const setPreset = (text: string) => {
    sound.playClick();
    setInputText(text);
  };

  // Sort top frequencies for bar chart
  const sortedFreqs = Object.entries(freqs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-cyber-card/80 border border-cyber-border rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-emerald-400" />
              Живой калькулятор энтропии Шеннона и детекции секретов
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Введи любую строку или токен из кода. Математическая энтропия Шеннона $H(S) = -\sum p_i \log_2 p_i$ рассчитывается на лету.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-slate-400">Пресеты строк:</span>
          <button
            onClick={() => setPreset('AKIAIOSFODNN7EXAMPLE')}
            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition"
          >
            🚨 AWS Access Key (Боевой токен)
          </button>
          <button
            onClick={() => setPreset('4a9f8c2b-e1d7-4b0a-8f92-9c3d1e4a7b5e')}
            className="px-2.5 py-1 text-xs rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition"
          >
            🔑 Случайный UUID-4 токен
          </button>
          <button
            onClick={() => setPreset('your_api_key_placeholder')}
            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            🟢 Тестовый плейсхолдер &quot;your_api_key...&quot;
          </button>
          <button
            onClick={() => setPreset('password123')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            ⚪ Словарное слово &quot;password123&quot;
          </button>
          <button
            onClick={() => setPreset('aaaaaaa')}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            ⚪ Моно-символ &quot;aaaaaaa&quot; (H = 0)
          </button>
        </div>

        {/* Text Input */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Исследуемая строка в коде:
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Введи любой пароль, токен или строку..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>Длина: {length} символов</span>
            <span>Уникальных символов: {unique}</span>
            <span>Алфавит: {unique} / {length}</span>
          </div>
        </div>

        {/* Results Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          {/* Numerical Entropy Gauge */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-400">
              Информационная энтропия:
            </span>
            <div className="text-3xl font-bold font-mono text-cyan-300 flex items-baseline gap-2">
              <span>{entropy.toFixed(3)}</span>
              <span className="text-xs font-normal text-slate-400">бит / символ</span>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Максимум для длины {length}: {length > 0 ? Math.log2(unique || 1).toFixed(2) : 0} бит
            </p>
          </div>

          {/* Verdict Banner */}
          <div className="col-span-2">
            <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
              verdict === 'secret'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 cyber-glow-rose'
                : verdict === 'suspicious'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}>
              {verdict === 'secret' ? (
                <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 animate-pulse" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {verdict === 'secret'
                    ? '🚨 КРИТИЧЕСКИЙ УРОВЕНЬ ХАОСА: БОЕВОЙ СЕКРЕТ!'
                    : verdict === 'suspicious'
                    ? '⚠️ ПОДОЗРИТЕЛЬНАЯ СТРОКА (Требует анализа контекста)'
                    : '🟢 БЕЗОПАСНАЯ СТРОКА / СЛОВАРНОЕ СЛОВО (Низкий хаос)'}
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  {verdict === 'secret'
                    ? 'Случайное распределение символов без словарных паттернов. Сканер uncflow активирует блокировку.'
                    : verdict === 'suspicious'
                    ? 'Энтропия близка к пограничной зоне. Проверяется роль файла и AST-контекст.'
                    : 'Человеческий язык или регулярные повторы. Типичный плейсхолдер или константа.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Symbol Frequency Distribution Bar Chart */}
        {sortedFreqs.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Частоты появления символов ($p_i$):
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {sortedFreqs.map(([ch, p], i) => (
                <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="text-cyan-300 font-bold">&apos;{ch === ' ' ? '␣' : ch}&apos;</span>
                    <span className="text-slate-400">{(p * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${p * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
